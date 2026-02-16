# @yelabb/constitution-wearables

**AI Safety Constitution for Wearable/Smartwatch Data Projects**

A safety layer for AI agents working with consumer wearable health data (Garmin, Apple Watch, Whoop, Oura, Fitbit, etc.). Prescriptive, executable constraints that prevent medical claims and ensure ethical boundaries.

## Quick Start

```bash
npm install --save-dev @yelabb/constitution-wearables
```

**That's it!** Auto-configuration creates:
- `.cursorrules` — Safety rules for Cursor AI
- `.vscode/settings.json` — Copilot instructions
- `.mcp-config.json` — MCP server for Claude/ChatGPT
- `package.json` — Adds `ai:context` script

## What It Does

When added to your AI agent's context, this framework:
- ✅ **Prevents medical claims** in generated code and text
- ✅ **Enforces baseline requirements** before recommendations
- ✅ **Controls language patterns** to avoid liability
- ✅ **Defines clear scope boundaries** for wearable data systems
- ✅ **Protects all stakeholders** — users, developers, and products

## Wearable Data Types Covered

- **Sleep tracking** - Duration, stages, quality metrics
- **Heart rate variability (HRV)** - Recovery and stress signals
- **Resting heart rate** - Baseline cardiovascular data
- **Activity tracking** - Steps, distance, intensity
- **Training load** - Workout impact and recovery needs
- **Readiness scores** - Multi-signal wellness indicators
- **Stress metrics** - Physiological stress markers
- **VO2 Max estimates** - Cardio fitness proxies

## Using MCP (Claude Desktop, etc.)

```bash
npm run ai:context
```

## Core Principles for Wearable Data

| Principle | Detail |
|---|---|
| **Personal baseline** | Systems must learn each user's normal over time (30–90 days) |
| **Deviation-driven** | Recommendations only when meaningful change is detected |
| **Behavioral suggestions** | Timing adjustments, rest cues, activity modifications — not medical interventions |
| **Non-medical** | No diagnoses, no supplements, no treatment protocols, no disease names |
| **Optionality** | "Consider" and "might help" — never "you must" or "you should" |
| **Safety first** | When in doubt about a feature, default to NO until confirmed safe |

## Documentation

- 📖 [Full Documentation](https://the-governor-hq.vercel.app)
- 🐙 [GitHub Repository](https://github.com/yelabb/the-governor-hq)
- 💬 [Discussions](https://github.com/yelabb/the-governor-hq/discussions)

## Related Packages

- [`@yelabb/constitution-core`](../core) - Core safety infrastructure (auto-installed)
- [`@yelabb/constitution-bci`](../bci) - Brain-computer interface data
- [`@yelabb/constitution-therapy`](../therapy) - Therapy and mental health data

## License

MIT
