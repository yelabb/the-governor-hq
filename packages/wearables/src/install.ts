#!/usr/bin/env node

/**
 * Governor HQ Constitutional Framework - Quick Install
 * Sets up AI safety context for wearable data projects
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
  const sourcePath = path.join(__dirname, '.cursorrules');

  if (fs.existsSync(cursorRulesPath)) {
    log('⚠️  .cursorrules already exists, skipping...', 'yellow');
    return false;
  }

  const content = fs.readFileSync(sourcePath, 'utf-8');
  fs.writeFileSync(cursorRulesPath, content);
  log('✓ Created .cursorrules', 'green');
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

  // Add Copilot instructions reference
  if (!settings['github.copilot.chat.codeGeneration.instructions']) {
    settings['github.copilot.chat.codeGeneration.instructions'] = [];
  }

  const instructionRef = {
    text: 'Follow the Governor HQ Constitutional Framework in node_modules/@the-governor-hq/constitution-wearables for wearable health data safety constraints. Check hard-rules.mdx before generating health-related code.',
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

function createMCPConfig(targetDir: string): boolean {
  const mcpConfigPath = path.join(targetDir, '.mcp-config.json');

  if (fs.existsSync(mcpConfigPath)) {
    log('⚠️  .mcp-config.json already exists, skipping...', 'yellow');
    return false;
  }

  const config = {
    mcpServers: {
      'governor-hq-constitution': {
        command: 'node',
        args: ['./node_modules/@the-governor-hq/constitution-wearables/dist/mcp-server.js'],
        description: 'AI Safety Constitution for Wearable Data Projects',
        enabled: true,
      },
    },
  };

  fs.writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2));
  log('✓ Created .mcp-config.json', 'green');
  return true;
}

interface PackageJson {
  scripts?: Record<string, string>;
  [key: string]: any;
}

function updatePackageJson(targetDir: string): boolean {
  const packageJsonPath = path.join(targetDir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    log('⚠️  No package.json found, skipping...', 'yellow');
    return false;
  }

  const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  if (!packageJson.scripts['ai:context']) {
    packageJson.scripts['ai:context'] =
      'node ./node_modules/@the-governor-hq/constitution-wearables/dist/mcp-server.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log('✓ Added ai:context script to package.json', 'green');
    return true;
  } else {
    log('⚠️  package.json already has ai:context script, skipping...', 'yellow');
    return false;
  }
}

function printSuccessMessage(): void {
  log('\n' + '='.repeat(60), 'bright');
  log('🎉 Governor HQ Constitutional Framework Installed!', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  log('Your AI assistants are now safety-aware for wearable data projects.\n');

  log('✅ What was configured:', 'blue');
  log('   • .cursorrules - Cursor AI safety rules');
  log('   • .vscode/settings.json - GitHub Copilot instructions');
  log('   • .mcp-config.json - MCP server configuration');
  log('   • package.json - Added ai:context script\n');

  log('📖 Quick Reference:', 'blue');
  log(
    '   • Hard Rules: node_modules/@the-governor-hq/constitution-wearables/pages/constraints/hard-rules.mdx'
  );
  log(
    '   • Quick Ref: node_modules/@the-governor-hq/constitution-wearables/pages/quick-reference.mdx'
  );
  log(
    '   • Full Guide: node_modules/@the-governor-hq/constitution-wearables/pages/ai-agent-guide.mdx\n'
  );

  log('🚀 Next Steps:', 'blue');
  log('   1. Restart your AI assistant (Cursor, VS Code, etc.)');
  log('   2. Start coding - safety constraints are now active');
  log('   3. For MCP support: npm run ai:context\n');

  log('💡 Pro Tip:', 'yellow');
  log(
    '   When using ChatGPT/Claude, paste this in your first message:\n'
  );
  log('   "I\'m using the Governor HQ Constitutional Framework', 'bright');
  log('   for wearable health data safety. Check node_modules/', 'bright');
  log('   @the-governor-hq/constitution-wearables/pages/constraints/hard-rules.mdx', 'bright');
  log('   before generating any health-related code."\n', 'bright');

  log('='.repeat(60) + '\n', 'bright');
}

export function install(): void {
  log('\n🛡️  Installing Governor HQ Constitutional Framework...\n', 'bright');

  const targetDir = process.cwd();

  try {
    let changes = 0;

    if (createCursorRules(targetDir)) changes++;
    if (updateVSCodeSettings(targetDir)) changes++;
    if (createMCPConfig(targetDir)) changes++;
    if (updatePackageJson(targetDir)) changes++;

    if (changes === 0) {
      log(
        '\n⚠️  All configuration files already exist. No changes made.',
        'yellow'
      );
      log(
        'To reinstall, remove existing config files and run install again.\n',
        'yellow'
      );
    } else {
      printSuccessMessage();
    }
  } catch (error) {
    log(`\n❌ Installation failed: ${(error as Error).message}\n`, 'red');
    process.exit(1);
  }
}

// Run install if called directly
if (require.main === module) {
  install();
}
