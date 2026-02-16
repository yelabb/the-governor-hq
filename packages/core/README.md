# @yelabb/constitution-core

**Core AI Safety Infrastructure for Governor HQ Constitutional Framework**

This package contains shared safety rules, constraints, and utilities used across all domain-specific constitutions (wearables, BCI, therapy, etc.).

## What's Included

### Universal Safety Rules
- No medical diagnoses or claims
- No treatment recommendations
- No supplement or pharmaceutical guidance
- No disease naming or implications
- Privacy and data handling standards

### Language Constraints
- Avoid authoritative prescriptive language
- Use optional, suggestive phrasing
- Default to NO when uncertain
- Clear liability boundaries

### Shared Infrastructure
- MCP server base implementation
- Install script utilities
- Configuration file templates
- Type definitions

## Usage

This package is typically not installed directly. Instead, install a domain-specific constitution:

```bash
npm install --save-dev @yelabb/constitution-wearables
npm install --save-dev @yelabb/constitution-bci
npm install --save-dev @yelabb/constitution-therapy
```

## Core Principles

All domain-specific constitutions inherit these foundations:

1. **Personal Baseline First** - Systems must learn individual patterns before making suggestions
2. **Deviation-Driven** - Only act when meaningful change is detected
3. **Behavioral Focus** - Suggest actions, not medical interventions
4. **Non-Medical Scope** - Clear boundaries for consumer wellness products
5. **Optionality** - Users always have choice
6. **Safety First** - Default to NO when uncertain

## Documentation

- [Full Documentation](https://the-governor-hq.vercel.app)
- [GitHub Repository](https://github.com/yelabb/the-governor-hq)

## License

MIT
