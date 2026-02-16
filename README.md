<div align="center">
<img width="512" alt="image" src="https://github.com/user-attachments/assets/cb620a5c-c8db-4eba-9bea-b9995b4ccbe2" />

# The Governor HQ Constitutional Framework

### AI Safety Constitution for Wearable Data Projects

[![npm version](https://img.shields.io/npm/v/@yelabb/constitution?color=blue&style=flat-square)](https://www.npmjs.com/package/@yelabb/constitution)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yelabb/the-governor-hq?style=flat-square)](https://github.com/yelabb/the-governor-hq/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/yelabb/the-governor-hq/pulls)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple?style=flat-square)](https://modelcontextprotocol.io)

**A safety layer for AI agents working with wearable health data. Prescriptive, executable constraints that prevent medical claims and ensure ethical boundaries.**

[Quick Start](#-instant-setup-3-commands) • [Documentation](https://the-governor-hq.vercel.app) • [Examples](EXAMPLE.md) • [Report Issue](https://github.com/yelabb/the-governor-hq/issues)

</div>

---

## 🎯 Overview

This is an **AI Safety Constitution** — a set of hard constraints enforced when building products that process wearable health data. Born from The Governor (a personal recovery-aware AI coach), these principles now govern **all wearable data projects** to prevent AI systems from crossing safety boundaries.

### The Problem

AI coding assistants (Copilot, Claude, ChatGPT) can generate dangerous code when working with health data:
- ❌ Making medical claims or implied diagnoses
- ❌ Recommending supplements, dosages, or treatments  
- ❌ Using authoritative prescriptive language
- ❌ Crossing legal and ethical boundaries

### The Solution

**This framework is prescriptive and executable** — not decorative. When added to your AI agent's context, it:
- ✅ **Prevents medical claims** in generated code and text
- ✅ **Enforces baseline requirements** before recommendations
- ✅ **Controls language patterns** to avoid liability
- ✅ **Defines clear scope boundaries** for health data systems
- ✅ **Protects all stakeholders** — users, developers, and products

---

## ✨ Features

- **🔌 Universal AI Compatibility** — Works with Cursor, GitHub Copilot, Claude Desktop, ChatGPT, any MCP-compatible assistant
- **⚡ Zero Configuration** — Auto-configures on `npm install` in 3 seconds
- **🧪 Fully Tested** — 17 automated tests verify MCP server integrity  
- **📚 Comprehensive Docs** — Decision trees, code patterns, validation checklists
- **🛡️ Safety First** — Default-to-NO enforcement when uncertain
- **🎯 Domain Agnostic** — Applies to sleep, fitness, stress, activity, nutrition, any wearable data

---

## ⚡ Instant Setup (3 Commands)

**Make your AI assistant safety-aware in seconds:**

```bash
# Install as dev dependency
npm install --save-dev @yelabb/constitution

# Auto-configures: ✓ Cursor ✓ VS Code ✓ Copilot ✓ MCP
# Your AI is now context-aware instantly!
```

That's it! Your AI coding assistant now has the constitutional framework in context and will automatically apply safety constraints when generating health-related code.

### What Gets Configured

The install automatically creates:
- ✅ `.cursorrules` - Safety rules for Cursor AI
- ✅ `.vscode/settings.json` - Copilot instructions
- ✅ `.mcp-config.json` - MCP server for Claude/ChatGPT
- ✅ `package.json` - Adds `ai:context` script

### Using MCP (Claude Desktop, etc.)

```bash
# Start MCP server for external AI assistants
npm run ai:context
```

### Manual Setup (without npm)

```bash
# Clone alongside your project
git clone https://github.com/yelabb/the-governor-hq.git docs/constitution

# Copy rules to your project
cp docs/constitution/.cursorrules .
```

---

## 🚀 Quick Start

### Installation

```bash
npm install --save-dev @yelabb/constitution
```

**That's it!** Auto-configuration creates:
- `.cursorrules` — Safety rules for Cursor AI
- `.vscode/settings.json` — Copilot instructions
- `.mcp-config.json` — MCP server for Claude/ChatGPT
- `package.json` — Adds `ai:context` and `test` scripts

### Using MCP (Claude Desktop, External AI)

```bash
npm run ai:context
```

### Running Tests

```bash
npm test
```

### Manual Setup (No NPM)

```bash
git clone https://github.com/yelabb/the-governor-hq.git docs/constitution
cp docs/constitution/.cursorrules .
```

---

## 🏗️ How It Works

### 1. Context Injection
When installed, the framework automatically appears in your AI assistant's context through:
- **Cursor**: `.cursorrules` file provides instant constitutional awareness
- **VS Code/Copilot**: `.vscode/settings.json` includes instructions in every session
- **Claude/ChatGPT**: MCP server exposes resources via Model Context Protocol

### 2. Real-Time Validation
Before generating code, AI assistants consult the framework to:
- Check if feature requires personal baseline (30-90 days of data)
- Validate user-facing text against forbidden phrases
- Confirm scope boundaries (biometric feedback vs medical advice)
- Select appropriate language patterns (optional vs commanding)

### 3. Safety Enforcement
**Five absolute constraints** override all other instructions:
1. ❌ No medical claims, diagnoses, or treatment advice
2. ❌ No supplements, vitamins, or dosage recommendations
3. ❌ No disease names or medical condition mentions
4. ❌ No treatment language (cure, prevent, treat, heal)
5. ❌ No commanding language (must, should, need to)

### 4. Example: Code Generation

**Without Constitution:**
```typescript
// ⚠️ UNSAFE - Makes medical claim
if (hrv < 50) {
  notify("Low HRV detected. You may be getting sick. Take vitamin C and rest.")
}
```

**With Constitution:**
```typescript
// ✅ SAFE - Personal baseline, optional framing
if (hasBaseline && hrv < personalBaseline - 2*stdDev) {
  notify("Your HRV is lower than your recent norm. Consider lighter activity today if you feel off.")
}
```

---

## 📖 Documentation

### Quick Navigation

| For Developers | For AI Agents | Reference |
|---|---|---|
| [Getting Started](/pages/getting-started.mdx) | [AI Agent Guide](/pages/ai-agent-guide.mdx) | [Quick Reference](/pages/quick-reference.mdx) |
| [Complete Example](EXAMPLE.md) | [Hard Rules](/pages/constraints/hard-rules.mdx) | [Language Rules](/pages/constraints/language-rules.mdx) |
| [Publishing Guide](PUBLISHING.md) | [What We Don't Do](/pages/what-we-dont-do.mdx) | [Quick Start Card](QUICKSTART.txt) |

### Documentation Structure

<details>
<summary><b>📚 Core Concepts</b> — How the system works</summary>

- **[signals.mdx](/pages/core/signals.mdx)** — What data the system uses (and its limitations)
- **[baseline.mdx](/pages/core/baseline.mdx)** — How personal baselines are established (30-90 days)
- **[deviation-engine.mdx](/pages/core/deviation-engine.mdx)** — When and why agents activate

</details>

<details>
<summary><b>🤖 Agent Behaviors</b> — What recommendations are allowed</summary>

- **[recovery-agent.mdx](/pages/agents/recovery-agent.mdx)** — HRV-based recovery guidance
- **[stress-agent.mdx](/pages/agents/stress-agent.mdx)** — Stress load behavioral suggestions

</details>

<details>
<summary><b>🚫 Safety Constraints</b> — What must never happen</summary>

- **[hard-rules.mdx](/pages/constraints/hard-rules.mdx)** — 5 absolute non-negotiable boundaries
- **[language-rules.mdx](/pages/constraints/language-rules.mdx)** — Tone, wording, and phrasing controls

</details>

<details>
<summary><b>🎯 Scope & Identity</b> — What this system is (and isn't)</summary>

- **[positioning.mdx](/pages/positioning.mdx)** — Product identity principles
- **[what-we-dont-do.mdx](/pages/what-we-dont-do.mdx)** — Explicit prohibited behaviors

</details>

---

## 🎯 Use Cases

### Sleep & Recovery Apps
Personal recovery coach that learns your HRV baseline and suggests optimal training/rest timing.

### Fitness & Training Platforms
Training load monitoring that detects when you're deviating from your capacity baseline.

### Stress Management Tools
Stress pattern recognition that identifies when your physiological stress markers diverge from normal.

### Wellness Dashboards
Activity and readiness insights based on personal patterns, not population averages.

### Research Platforms
Biometric visualization tools with built-in safety constraints against medical interpretation.

---

## ❓ FAQ

<details>
<summary><b>Do I need to modify my codebase?</b></summary>

No. The framework works by being present in your AI assistant's context. It guides AI-generated code, but doesn't require changes to existing code.

</details>

<details>
<summary><b>Which AI assistants are supported?</b></summary>

- ✅ **Cursor** (via `.cursorrules`)
- ✅ **GitHub Copilot** (via `.vscode/settings.json`)
- ✅ **Claude Desktop** (via MCP server)
- ✅ **ChatGPT with MCP** (via MCP protocol)
- ✅ **Any MCP-compatible assistant**

</details>

<details>
<summary><b>Can I customize the constraints?</b></summary>

You can fork and modify, but **the 5 hard rules are non-negotiable** for liability protection. Language rules and scope boundaries can be tailored to your domain.

</details>

<details>
<summary><b>Do I need a personal baseline for all features?</b></summary>

Only for **recommendation features**. Visualization, data display, and statistical analysis don't require baselines. See [baseline.mdx](/pages/core/baseline.mdx) for details.

</details>

<details>
<summary><b>How do I verify the MCP server works?</b></summary>

```bash
npm test  # Runs 17 automated tests
npm run ai:context  # Starts MCP server manually
```

</details>

<details>
<summary><b>Is this open source?</b></summary>

Licensed under MIT. Use freely in commercial or personal projects. Attribution appreciated.

</details>

---

## 🧪 Testing

The framework includes comprehensive automated tests:

```bash
npm test
```

**Test Coverage:**
- ✅ Server initialization and configuration
- ✅ MCP protocol compliance (initialize, list, read)
- ✅ Resource file integrity and descriptions
- ✅ Critical constraint validation
- ✅ Language pattern enforcement
- ✅ Baseline requirement documentation
- ✅ Safety-first default behavior

All 17 tests must pass before deployment.

---

## 🤝 Contributing

We welcome contributions that strengthen safety constraints or improve clarity.

**Before contributing:**
1. Read [CONTRIBUTING.md](CONTRIBUTING.md) (coming soon)
2. Review [Hard Rules](/pages/constraints/hard-rules.mdx) — these are non-negotiable
3. Run tests: `npm test`
4. Open an issue for discussion before major changes

**Priority areas:**
- Additional test coverage
- Language validation patterns
- Real-world usage examples
- Integration guides for new AI tools

---

## 🤖 For AI Assistants

When integrated into your context, consult these resources:

| Situation | Consult |
|---|---|
| Generating code that processes biometric data | [Hard Rules](/pages/constraints/hard-rules.mdx) → [Quick Reference](/pages/quick-reference.mdx) |
| Writing user-facing text about health data | [Language Rules](/pages/constraints/language-rules.mdx) |
| Implementing recommendation features | [Baseline Requirements](/pages/core/baseline.mdx) |
| Uncertain if feature is in scope | [What We Don't Do](/pages/what-we-dont-do.mdx) |
| Need complete implementation guide | [AI Agent Guide](/pages/ai-agent-guide.mdx) |

**Default behavior:** When uncertain about safety boundaries → **DEFAULT TO NO**, then confirm with documentation.

---

## 📊 Core Principles

| Principle | Implementation |
|---|---|
| **Personal Baseline** | Learn *each user's* normal over 30-90 days |
| **Deviation-Driven** | Activate only when meaningful change detected |
| **Behavioral Guidance** | Suggest timing, rest, activity adjustments |
| **Non-Medical** | Zero diagnoses, supplements, or treatment protocols |
| **Optional Framing** | "Consider" and "might" — never "must" or "should" |
| **Safety First** | Default to NO when uncertain |

---

## 🛠️ Development

### Run Documentation Site Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to view the docs.

### Project Structure

```
├── pages/
│   ├── constraints/     # Safety rules (hard-rules, language-rules)
│   ├── core/           # System concepts (signals, baseline, deviation)
│   ├── agents/         # Allowed behaviors (recovery, stress)
│   ├── getting-started.mdx
│   ├── ai-agent-guide.mdx
│   └── quick-reference.mdx
├── mcp-server.js       # MCP protocol implementation
├── mcp-server.test.js  # Automated test suite (17 tests)
├── install.js          # Auto-configuration script
├── .cursorrules        # Cursor AI safety rules
└── index.d.ts          # TypeScript definitions
```

Built with [Nextra](https://nextra.site/) — a Next.js-based documentation framework.

---

## 📜 License

MIT License — © The Governor HQ. All rights reserved.

Use freely in commercial or personal projects. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

This framework was developed with assistance from AI coding assistants:

- **Claude Opus 4.5 & Sonnet 4.5** (Anthropic)
- **Grok code fast 1** (xAI)
- **Gemini 3.0 Pro** (Google)

All code was tested and validated by human developers.

---

## 🔗 Links

- 📖 **Documentation:** [https://the-governor-hq.vercel.app](https://the-governor-hq.vercel.app)
- 📦 **NPM Package:** [@yelabb/constitution](https://www.npmjs.com/package/@yelabb/constitution)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/yelabb/the-governor-hq/discussions)
- 🐛 **Issues:** [Issue Tracker](https://github.com/yelabb/the-governor-hq/issues)
- 🌐 **MCP Protocol:** [Model Context Protocol](https://modelcontextprotocol.io)

---

<div align="center">

**⚠️ This system does not provide medical advice.**

Built with ❤️ for safe AI-assisted development on wearable health data.

[⬆ Back to Top](#)

</div>


