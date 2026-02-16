#!/usr/bin/env node

/**
 * Governor HQ Constitutional Framework - BCI Package Quick Install
 * Sets up AI safety context for brain-computer interface data projects
 */

import * as fs from 'fs';
import * as path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message: string, color: keyof typeof COLORS = 'reset'): void {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function createCursorRules(targetDir: string): boolean {
  const cursorRulesPath = path.join(targetDir, '.cursorrules');
  
  if (fs.existsSync(cursorRulesPath)) {
    log('⚠️  .cursorrules already exists, skipping...', 'yellow');
    return false;
  }

  const content = `# Governor HQ Constitutional Framework - BCI Data Safety Rules

You are working on a project that processes brain-computer interface (BCI) data including EEG, fNIRS, and neurofeedback signals.

## ABSOLUTE CONSTRAINTS:

1. ❌ NO mental health diagnoses or cognitive assessments
2. ❌ NO emotion reading claims ("you are feeling anxious/happy")
3. ❌ NO brain state diagnosis (ADHD, depression, autism detection)
4. ❌ NO medical claims about neural patterns
5. ❌ NO "mind reading" or "thought detection" language
6. ❌ NO commanding language (must, should, need to)

## ALLOWED SCOPE:

✅ Attention/focus pattern observation (not diagnosis)
✅ Relaxation/meditation state detection
✅ Personal baseline comparison for neurofeedback
✅ Brain wave frequency observation
✅ Sleep stage estimation (consumer wellness context)

## BEFORE GENERATING CODE:

- Check node_modules/@yelabb/constitution-bci for full documentation
- Compare to personal baseline (not clinical norms)
- Use suggestive language ("might", "consider", "could")
- Include privacy protections for neural data
- Default to NO if uncertain about safety

Neural data is especially sensitive. When in doubt, be MORE conservative.`;

  fs.writeFileSync(cursorRulesPath, content);
  log('✓ Created .cursorrules for BCI project', 'green');
  return true;
}

interface VSCodeSettings {
  'github.copilot.chat.codeGeneration.instructions'?: Array<{ text: string }>;
  [key: string]: any;
}

function updateVSCodeSettings(targetDir: string): boolean {
  const vscodeDir = path.join(targetDir, '.vscode');
  const settingsPath = path.join(vscodeDir, 'settings.json');

  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir);
  }

  let settings: VSCodeSettings = {};
  if (fs.existsSync(settingsPath)) {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  }

  if (!settings['github.copilot.chat.codeGeneration.instructions']) {
    settings['github.copilot.chat.codeGeneration.instructions'] = [];
  }

  const instructionRef = {
    text: 'Follow the Governor HQ Constitutional Framework in node_modules/@yelabb/constitution-bci for BCI/neural data safety constraints. Never generate code that makes mental health diagnoses or emotion reading claims.',
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

function install(): void {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('   Governor HQ Constitutional Framework - BCI', 'bright');
  log('   AI Safety for Brain-Computer Interface Data', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  const targetDir = path.resolve(process.cwd(), '..', '..');

  try {
    createCursorRules(targetDir);
    updateVSCodeSettings(targetDir);

    log('\n✅ Installation complete!\n', 'green');
    log('Next steps:', 'bright');
    log('  1. Restart your AI coding assistant', 'blue');
    log('  2. Check .cursorrules for active constraints', 'blue');
    log('  3. Read docs: node_modules/@yelabb/constitution-bci/', 'blue');
    log('');
  } catch (error) {
    log(`\n❌ Installation failed: ${(error as Error).message}\n`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  install();
}

export { install };
