#!/usr/bin/env node

/**
 * Safety Validation Script
 * Runs all safety checks: unit tests, MCP tests, eval system
 * Exit code 0 = all passed, Exit code 1 = failures detected
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('');
  log('━'.repeat(60), 'cyan');
  log(`  ${message}`, 'bright');
  log('━'.repeat(60), 'cyan');
  console.log('');
}

function runCommand(cmd, cwd, description) {
  try {
    log(`▶ ${description}...`, 'blue');
    execSync(cmd, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    log(`✓ ${description} passed`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${description} failed`, 'red');
    return false;
  }
}

function checkFileExists(filepath) {
  return fs.existsSync(filepath);
}

async function main() {
  log('\n🛡️  Governor HQ Safety Validation Suite', 'bright');
  log('   Running all safety checks...\n', 'cyan');
  
  const rootDir = process.cwd();
  const coreDir = path.join(rootDir, 'packages', 'core');
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  };
  
  // =========================================================================
  // 1. Core Package Unit Tests
  // =========================================================================
  
  header('1. Core Package - Unit Tests');
  
  if (checkFileExists(path.join(coreDir, 'tests', 'runtime-validator.test.js'))) {
    results.total++;
    if (runCommand('node tests/runtime-validator.test.js', coreDir, 'Runtime Validator Tests')) {
      results.passed++;
    } else {
      results.failed++;
    }
  } else {
    log('⊘ Runtime Validator tests not found', 'yellow');
    results.skipped++;
  }
  
  if (checkFileExists(path.join(coreDir, 'tests', 'middleware.test.js'))) {
    results.total++;
    if (runCommand('node tests/middleware.test.js', coreDir, 'Middleware Tests')) {
      results.passed++;
    } else {
      results.failed++;
    }
  } else {
    log('⊘ Middleware tests not found', 'yellow');
    results.skipped++;
  }
  
  if (checkFileExists(path.join(coreDir, 'tests', 'pattern-matcher.test.js'))) {
    results.total++;
    if (runCommand('node tests/pattern-matcher.test.js', coreDir, 'Pattern Matcher Tests')) {
      results.passed++;
    } else {
      results.failed++;
    }
  } else {
    log('⊘ Pattern Matcher tests not found', 'yellow');
    results.skipped++;
  }
  
  // =========================================================================
  // 2. MCP Server Tests (Wearables Package)
  // =========================================================================
  
  header('2. MCP Server - Protocol Compliance');
  
  const wearablesDir = path.join(rootDir, 'packages', 'wearables');
  if (checkFileExists(path.join(wearablesDir, 'mcp-server.test.js'))) {
    results.total++;
    if (runCommand('node mcp-server.test.js', wearablesDir, 'MCP Server Tests')) {
      results.passed++;
    } else {
      results.failed++;
    }
  } else {
    log('⊘ MCP Server tests not found', 'yellow');
    results.skipped++;
  }
  
  // =========================================================================
  // 3. Evaluation System (Red Teaming)
  // =========================================================================
  
  header('3. Evaluation System - Adversarial Testing');
  
  const evalsDir = path.join(coreDir, 'evals');
  if (checkFileExists(path.join(evalsDir, 'quick-test.js'))) {
    results.total++;
    
    // Check for API key
    const hasApiKey = process.env.GROQ_API_KEY || 
                      checkFileExists(path.join(evalsDir, '.env'));
    
    if (hasApiKey) {
      if (runCommand('node quick-test.js', evalsDir, 'Quick Eval Tests')) {
        results.passed++;
      } else {
        results.failed++;
      }
    } else {
      log('⊘ Skipping eval tests (no GROQ_API_KEY found)', 'yellow');
      log('  To run: Set GROQ_API_KEY or create packages/core/evals/.env', 'yellow');
      results.skipped++;
    }
  } else {
    log('⊘ Eval tests not found', 'yellow');
    results.skipped++;
  }
  
  // =========================================================================
  // 4. Package-Specific Tests (BCI, Therapy)
  // =========================================================================
  
  header('4. Domain Packages - Integration Tests');
  
  const bciDir = path.join(rootDir, 'packages', 'bci');
  if (checkFileExists(path.join(bciDir, 'mcp-server.test.js'))) {
    results.total++;
    if (runCommand('node mcp-server.test.js', bciDir, 'BCI Package Tests')) {
      results.passed++;
    } else {
      results.failed++;
    }
  } else {
    log('⊘ BCI package tests not found', 'yellow');
    results.skipped++;
  }
  
  const therapyDir = path.join(rootDir, 'packages', 'therapy');
  if (checkFileExists(path.join(therapyDir, 'mcp-server.test.js'))) {
    results.total++;
    if (runCommand('node mcp-server.test.js', therapyDir, 'Therapy Package Tests')) {
      results.passed++;
    } else {
      results.failed++;
    }
  } else {
    log('⊘ Therapy package tests not found', 'yellow');
    results.skipped++;
  }
  
  // =========================================================================
  // Summary
  // ========================================================================== 
  
  console.log('');
  log('━'.repeat(60), 'cyan');
  log('  Validation Summary', 'bright');
  log('━'.repeat(60), 'cyan');
  console.log('');
  
  log(`  Total Test Suites: ${results.total}`, 'cyan');
  log(`  ✓ Passed:          ${results.passed}`, results.passed > 0 ? 'green' : 'reset');
  log(`  ✗ Failed:          ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
  log(`  ⊘ Skipped:         ${results.skipped}`, results.skipped > 0 ? 'yellow' : 'reset');
  
  console.log('');
  
  if (results.failed > 0) {
    log('❌ Safety validation FAILED', 'red');
    log('   Fix failing tests before deploying to production.', 'red');
    console.log('');
    process.exit(1);
  } else if (results.passed === 0) {
    log('⚠️  No tests were run', 'yellow');
    log('   Build packages first: npm run build', 'yellow');
    console.log('');
    process.exit(1);
  } else {
    log('✅ All safety validations PASSED', 'green');
    log(`   ${results.passed}/${results.total} test suites successful.`, 'green');
    if (results.skipped > 0) {
      log(`   ${results.skipped} test suites skipped.`, 'yellow');
    }
    console.log('');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
