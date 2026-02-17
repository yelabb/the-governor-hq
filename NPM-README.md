# Instant AI Safety for Wearable Data Projects

[![npm version](https://badge.fury.io/js/%40governor-hq%2Fconstitution.svg)](https://www.npmjs.com/package/@governor-hq/constitution)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Make your AI coding assistant safety-aware for wearable health data in 3 seconds.**

## ⚡ Quick Install

```bash
npm install --save-dev @the-governor-hq/constitution
```

**Done!** Your AI assistant (Cursor, Copilot, Claude, ChatGPT) now has safety context for wearable data development.

## What It Does

Automatically configures AI assistants to:
- ❌ Never generate medical claims or diagnoses
- ❌ Never suggest supplements or treatments
- ❌ Never use commanding language
- ✅ Always use personal baselines (not population averages)
- ✅ Always use optional framing ("consider", "might")
- ✅ Always gate recommendations behind baseline stability

## How It Works

On install, the framework:

1. **Creates `.cursorrules`** - Cursor AI safety rules
2. **Updates `.vscode/settings.json`** - Copilot instructions
3. **Creates `.mcp-config.json`** - MCP server config
4. **Adds scripts** - `npm run ai:context` for MCP

Your AI coding assistant automatically follows these rules when generating code.

## Supported AI Tools

✅ **Cursor** - Works instantly via `.cursorrules`  
✅ **GitHub Copilot** - Works via VS Code settings  
✅ **Claude Desktop** - Use `npm run ai:context` for MCP  
✅ **ChatGPT** - Use MCP or manual context paste  
✅ **Any AI with MCP support** - Full integration

## Example Usage

### Before (Unsafe)
```typescript
// AI might generate this WITHOUT the framework:
function getSleepAdvice(hrv: number) {
  if (hrv < 50) {
    return "Your HRV is dangerously low. You should take magnesium supplements and avoid all exercise.";
  }
}
```

### After (Safe)
```typescript
// With framework active, AI generates:
function getSleepAdvice(user: User) {
  if (user.baselineStatus !== 'STABLE') {
    return null; // No advice during learning phase
  }
  
  if (user.currentHRV < user.personalBaseline.hrv * 0.8) {
    return "Your HRV has been lower than your recent baseline. " +
           "This pattern sometimes appears during demanding periods. " +
           "When you're ready, an earlier wind-down might help. " +
           "Based on your personal trends. Not medical advice.";
  }
}
```

## Quick Reference

### The 5 Absolute Rules

1. 🚫 **No Medical Claims** - Never diagnose or treat
2. 🚫 **No Supplements** - Zero tolerance
3. 🚫 **No Disease Names** - Never mention conditions
4. 🚫 **No Treatment Language** - No "cure", "prevent", "heal"
5. 🚫 **No Commanding** - Use "consider", not "should"

### Required Patterns

```typescript
// 1. Always gate on baseline
if (user.baselineStatus !== 'STABLE') return null;

// 2. Always compare to personal baseline
const deviation = user.current / user.personalBaseline;

// 3. Always use optional language
"You might consider..." // not "You should..."

// 4. Always include disclaimer
"Based on your personal trends. Not medical advice."
```

## Documentation

Full documentation available at: [https://the-governor-hq.vercel.app](https://the-governor-hq.vercel.app)

- **[Quick Reference](pages/quick-reference.mdx)** - One-page cheat sheet
- **[AI Agent Guide](pages/ai-agent-guide.mdx)** - Complete implementation guide
- **[Hard Rules](pages/constraints/hard-rules.mdx)** - Absolute boundaries
- **[Language Rules](pages/constraints/language-rules.mdx)** - Text validation

## MCP Usage

For AI assistants with MCP support (Claude, ChatGPT, etc.):

```bash
# Start MCP server
npm run ai:context

# Or use in Node.js
const { GovernorHQMCPServer } = require('@governor-hq/constitution');
const server = new GovernorHQMCPServer();
server.start();
```

Add to your Claude Desktop config (`~/Library/Application Support/Claude/config.json`):

```json
{
  "mcpServers": {
    "governor-hq": {
      "command": "node",
      "args": ["./node_modules/@governor-hq/constitution/mcp-server.js"]
    }
  }
}
```

## Manual Configuration

If you prefer manual setup:

### Cursor
```bash
# Copy .cursorrules to your project
cp node_modules/@governor-hq/constitution/.cursorrules .
```

### VS Code / Copilot
Add to `.vscode/settings.json`:
```json
{
  "github.copilot.chat.codeGeneration.instructions": [{
    "text": "Follow the Governor HQ Constitutional Framework in node_modules/@governor-hq/constitution for wearable health data safety."
  }]
}
```

### ChatGPT / Claude (without MCP)
Paste this in your first message:
```
I'm using the Governor HQ Constitutional Framework for wearable health data safety.
Before generating any health-related code, check these rules:

1. No medical claims, diagnoses, or treatments
2. No supplements or dosages
3. No disease names
4. Personal baseline required (not population averages)
5. Optional language only ("consider", "might")

Full rules: node_modules/@governor-hq/constitution/pages/constraints/hard-rules.mdx
```

## Use Cases

✅ **Sleep tracking apps**  
✅ **Recovery optimization tools**  
✅ **Fitness and training load systems**  
✅ **HRV monitoring applications**  
✅ **Stress and readiness scoring**  
✅ **Activity pattern analysis**  
✅ **Any wearable biometric feedback system**

## Why This Matters

Without safety constraints, AI coding assistants will generate code that:
- Makes medical claims (legal liability)
- Recommends supplements (requires medical license)
- Uses diagnostic language (FDA regulatory risk)
- Commands users to take health actions (ethical issues)

**This framework prevents those risks automatically.**

## License

MIT - See [LICENSE](LICENSE) file

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

## Support

- 📖 [Full Documentation](https://the-governor-hq.vercel.app)
- 💬 [GitHub Discussions](https://github.com/the-governor-hq/constitution/discussions)
- 🐛 [Issue Tracker](https://github.com/the-governor-hq/constitution/issues)

---

**Built with ❤️ for safe AI-assisted development on health data.**
