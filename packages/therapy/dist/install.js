#!/usr/bin/env node
"use strict";
/**
 * Governor HQ Constitutional Framework - Therapy Package Quick Install
 * Sets up AI safety context for therapy and mental health data projects
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = install;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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

- Check node_modules/@the-governor-hq/constitution-therapy for full documentation
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
        text: 'Follow the Governor HQ Constitutional Framework in node_modules/@the-governor-hq/constitution-therapy for therapy/mental health data safety constraints. Never generate code that diagnoses conditions or provides therapy/treatment advice.',
    };
    const hasInstruction = settings['github.copilot.chat.codeGeneration.instructions'].some((instr) => instr.text && instr.text.includes('Governor HQ'));
    if (!hasInstruction) {
        settings['github.copilot.chat.codeGeneration.instructions'].push(instructionRef);
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        log('✓ Updated .vscode/settings.json', 'green');
        return true;
    }
    else {
        log('⚠️  VS Code settings already configured, skipping...', 'yellow');
        return false;
    }
}
function install() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('   Governor HQ Constitutional Framework - Therapy', 'bright');
    log('   AI Safety for Mental Health & Wellbeing Data', 'blue');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');
    // When invoked via npx or directly, cwd is the user's project root
    const targetDir = process.cwd();
    try {
        createCursorRules(targetDir);
        updateVSCodeSettings(targetDir);
        log('\n✅ Setup complete!\n', 'green');
        log('⚠️  IMPORTANT: This is the most sensitive data domain', 'yellow');
        log('   Always include crisis resources (988 hotline)', 'yellow');
        log('   Never attempt diagnosis or treatment advice\n', 'yellow');
        log('Next steps:', 'bright');
        log('  1. Restart your AI coding assistant', 'blue');
        log('  2. Check .cursorrules for active constraints', 'blue');
        log('  3. Read docs: node_modules/@the-governor-hq/constitution-therapy/', 'blue');
        log('\n💡 Tip: Re-run this anytime with: npx governor-install-therapy\n', 'yellow');
    }
    catch (error) {
        log(`\n❌ Installation failed: ${error.message}\n`, 'red');
        process.exit(1);
    }
}
if (require.main === module) {
    install();
}
//# sourceMappingURL=install.js.map