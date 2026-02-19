#!/usr/bin/env node
"use strict";
/**
 * Governor HQ Constitutional Framework - BCI Package Quick Install
 * Sets up AI safety context for brain-computer interface data projects
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

- Check node_modules/@the-governor-hq/constitution-bci for full documentation
- Compare to personal baseline (not clinical norms)
- Use suggestive language ("might", "consider", "could")
- Include privacy protections for neural data
- Default to NO if uncertain about safety

Neural data is especially sensitive. When in doubt, be MORE conservative.`;
    fs.writeFileSync(cursorRulesPath, content);
    log('✓ Created .cursorrules for BCI project', 'green');
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
        text: 'Follow the Governor HQ Constitutional Framework in node_modules/@the-governor-hq/constitution-bci for BCI/neural data safety constraints. Never generate code that makes mental health diagnoses or emotion reading claims.',
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
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('   Governor HQ Constitutional Framework - BCI', 'bright');
    log('   AI Safety for Brain-Computer Interface Data', 'blue');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');
    // When invoked via npx or directly, cwd is the user's project root
    const targetDir = process.cwd();
    try {
        createCursorRules(targetDir);
        updateVSCodeSettings(targetDir);
        log('\n✅ Setup complete!\n', 'green');
        log('Next steps:', 'bright');
        log('  1. Restart your AI coding assistant', 'blue');
        log('  2. Check .cursorrules for active constraints', 'blue');
        log('  3. Read docs: node_modules/@the-governor-hq/constitution-bci/', 'blue');
        log('\n💡 Tip: Re-run this anytime with: npx governor-install-bci\n', 'yellow');
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