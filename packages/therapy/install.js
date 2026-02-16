#!/usr/bin/env node

/**
 * Governor HQ Constitutional Framework - Therapy Package Quick Install
 * Sets up AI safety context for therapy and mental health data projects
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function createCursorRules(targetDir) {
  const cursorRulesPath = path.join(targetDir, '.cursorrules');
  
  if (fs.existsSync(cursorRulesPath)) {
    log('⚠️  .cursorrules already exists, skipping...', 'yellow');
    return false;
  }

  const content = `# Governor HQ Constitutional Framework - Therapy Data Safety Rules

You are working on a project that processes therapy, mood tracking, and mental wellbeing data.

## ABSOLUTE CONSTRAINTS:

1. ❌ NO mental health diagnoses (depression, anxiety, PTSD, bipolar, etc.)
2. ❌ NO therapy or treatment recommendations
3. ❌ NO medication suggestions or dosage guidance
4. ❌ NO crisis intervention or suicide risk assessment
5. ❌ NO replacing licensed mental health professionals
6. ❌ NO commanding language (must, should, need to)

## ALLOWED SCOPE:

✅ Mood and emotion tracking (observation only)
✅ Journaling and reflection tools
✅ Pattern recognition without diagnosis
✅ Personal baseline comparison for mood trends
✅ Supportive, non-prescriptive suggestions

## CRISIS SITUATIONS:

- ALWAYS include 988 Suicide & Crisis Lifeline (US)
- ALWAYS refer to local emergency services
- NEVER attempt to assess crisis severity
- NEVER provide crisis counseling

## BEFORE GENERATING CODE:

- Check node_modules/@yelabb/constitution-therapy for full documentation
- Use observational language ("you've noted feeling..." not "you have...")
- Compare to personal baseline (not diagnostic criteria)
- Include mental health professional referrals
- Default to NO if uncertain about safety

This is the most sensitive data domain. Be extremely conservative.`;

  fs.writeFileSync(cursorRulesPath, content);
  log('✓ Created .cursorrules for Therapy project', 'green');
  return true;
}

function updateVSCodeSettings(targetDir) {
  const vscodeDir = path.join(targetDir, '.vscode');
  const settingsPath = path.join(vscodeDir, 'settings.json');

  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir);
  }

  let settings = {};
  if (fs.existsSync(settingsPath)) {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  }

  if (!settings['github.copilot.chat.codeGeneration.instructions']) {
    settings['github.copilot.chat.codeGeneration.instructions'] = [];
  }

  const instructionRef = {
    text: 'Follow the Governor HQ Constitutional Framework in node_modules/@yelabb/constitution-therapy for therapy/mental health data safety constraints. Never generate code that diagnoses conditions or provides therapy/treatment advice.',
  };

  const hasInstruction = settings[
    'github.copilot.chat.codeGeneration.instructions'
  ].some((instr) => instr.text && instr.text.includes('Governor HQ'));

  if (!hasInstruction) {
    settings['github.copilot.chat.codeGeneration.instructions'].push(
      instructionRef
    );
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    log('✓ Updated .vscode/settings.json', 'green');
    return true;
  } else {
    log('⚠️  VS Code settings already configured, skipping...', 'yellow');
    return false;
  }
}

function install() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('   Governor HQ Constitutional Framework - Therapy', 'bright');
  log('   AI Safety for Mental Health & Wellbeing Data', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  const targetDir = path.resolve(process.cwd(), '..', '..');

  try {
    createCursorRules(targetDir);
    updateVSCodeSettings(targetDir);

    log('\n✅ Installation complete!\n', 'green');
    log('⚠️  IMPORTANT: This is the most sensitive data domain', 'yellow');
    log('   Always include crisis resources (988 hotline)', 'yellow');
    log('   Never attempt diagnosis or treatment advice\n', 'yellow');
    log('Next steps:', 'bright');
    log('  1. Restart your AI coding assistant', 'blue');
    log('  2. Check .cursorrules for active constraints', 'blue');
    log('  3. Read docs: node_modules/@yelabb/constitution-therapy/', 'blue');
    log('');
  } catch (error) {
    log(`\n❌ Installation failed: ${error.message}\n`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  install();
}

module.exports = { install };
