#!/usr/bin/env node

/**
 * Governor HQ Language Validator CLI
 * Validates user-facing text against AI safety constraints
 * 
 * Usage:
 *   echo "You should rest today" | governor-validate
 *   governor-validate path/to/file.js
 *   governor-validate --help
 */

const fs = require('fs');
const path = require('path');
const core = require('../dist/index');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function printHelp() {
  console.log(`
${colorize('Governor HQ Language Validator', 'bright')}
${colorize('═══════════════════════════════', 'blue')}

Validates text against AI safety language constraints.

${colorize('Usage:', 'bright')}
  echo "text to validate" | governor-validate
  governor-validate <file>
  governor-validate --help

${colorize('Examples:', 'bright')}
  ${colorize('# Validate text from stdin', 'gray')}
  echo "You should rest today" | governor-validate
  
  ${colorize('# Validate a file', 'gray')}
  governor-validate src/messages.js
  
  ${colorize('# Use in CI/CD', 'gray')}
  governor-validate src/**/*.js || exit 1

${colorize('Exit Codes:', 'bright')}
  0 - All validations passed
  1 - Violations found

${colorize('Checks:', 'bright')}
  ❌ Prescriptive language (must, should, need to)
  ❌ Authoritative medical terms
  ❌ Medical scope violations
`);
}

function extractStrings(code) {
  // Extract strings from JavaScript/TypeScript code
  const stringRegex = /["'`]([^"'`\\]*(\\.[^"'`\\]*)*)["'`]/g;
  const strings = [];
  let match;
  
  while ((match = stringRegex.exec(code)) !== null) {
    const str = match[1];
    // Filter out import paths, requires, and short strings
    if (str.length > 10 && !str.includes('/') && !str.includes('require')) {
      strings.push(str);
    }
  }
  
  return strings;
}

function validateText(text, source = 'stdin') {
  const languageResult = core.validateLanguage(text);
  const scopeResult = core.validateScope(text);
  
  const hasViolations = !languageResult.isValid || !scopeResult.isValid;
  
  if (hasViolations) {
    console.log(colorize(`\n✗ Violations found in ${source}:`, 'red'));
    console.log(colorize(`  "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`, 'gray'));
    
    if (!languageResult.isValid) {
      console.log(colorize(`  • Language: ${languageResult.message}`, 'red'));
    }
    
    if (!scopeResult.isValid) {
      console.log(colorize(`  • Scope: ${scopeResult.message}`, 'red'));
    }
  }
  
  return hasViolations;
}

function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const strings = extractStrings(content);
    
    if (strings.length === 0) {
      console.log(colorize(`\n⚠ No strings found in ${filePath}`, 'yellow'));
      return false;
    }
    
    console.log(colorize(`\n📄 Scanning ${filePath} (${strings.length} strings)`, 'blue'));
    
    let violationCount = 0;
    
    strings.forEach((str, index) => {
      const hasViolations = validateText(str, `${filePath}:string#${index + 1}`);
      if (hasViolations) {
        violationCount++;
      }
    });
    
    if (violationCount === 0) {
      console.log(colorize(`\n✓ All ${strings.length} strings passed validation`, 'green'));
    } else {
      console.log(colorize(`\n✗ ${violationCount} of ${strings.length} strings have violations`, 'red'));
    }
    
    return violationCount > 0;
  } catch (error) {
    console.error(colorize(`\n✗ Error reading file: ${error.message}`, 'red'));
    return true;
  }
}

function main() {
  const args = process.argv.slice(2);
  
  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }
  
  // Validate file
  if (args.length > 0) {
    const filePath = args[0];
    
    if (!fs.existsSync(filePath)) {
      console.error(colorize(`\n✗ File not found: ${filePath}`, 'red'));
      process.exit(1);
    }
    
    const hasViolations = validateFile(filePath);
    process.exit(hasViolations ? 1 : 0);
  }
  
  // Validate from stdin
  if (process.stdin.isTTY) {
    console.error(colorize('\n✗ No input provided. Use --help for usage.', 'red'));
    process.exit(1);
  }
  
  let input = '';
  
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', (chunk) => {
    input += chunk;
  });
  
  process.stdin.on('end', () => {
    if (!input.trim()) {
      console.error(colorize('\n✗ Empty input', 'red'));
      process.exit(1);
    }
    
    console.log(colorize('\n🔍 Validating text from stdin...', 'blue'));
    const hasViolations = validateText(input.trim(), 'stdin');
    
    if (!hasViolations) {
      console.log(colorize('\n✓ Validation passed', 'green'));
    }
    
    process.exit(hasViolations ? 1 : 0);
  });
}

if (require.main === module) {
  main();
}

module.exports = { validateText, validateFile };
