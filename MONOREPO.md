# Governor HQ Monorepo Architecture

## Overview

The Governor HQ Constitutional Framework is organized as a **monorepo** with domain-specific packages. Each package provides AI safety constraints tailored to a specific health data domain.

## Repository Structure

```
the-governor-hq/
├── packages/
│   ├── core/              # @the-governor-hq/constitution-core
│   │   ├── index.js       # Shared safety rules & utilities
│   │   ├── index.d.ts     # TypeScript definitions
│   │   ├── package.json
│   │   └── README.md
│   ├── wearables/         # @the-governor-hq/constitution-wearables
│   │   ├── pages/         # Domain-specific documentation
│   │   ├── mcp-server.js  # MCP server implementation
│   │   ├── install.js     # Auto-configuration script
│   │   ├── .cursorrules   # Cursor AI rules
│   │   ├── package.json
│   │   └── README.md
│   ├── bci/               # @the-governor-hq/constitution-bci
│   │   ├── package.json
│   │   └── README.md
│   └── therapy/           # @the-governor-hq/constitution-therapy
│       ├── package.json
│       └── README.md
├── pages/                 # Shared documentation site (Nextra)
├── package.json           # Root workspace config
├── theme.config.tsx       # Documentation theme
└── README.md              # Main README

```

## Package Relationships

```
┌─────────────────────────────────────────────┐
│         @the-governor-hq/constitution-core           │
│  Universal safety rules & infrastructure    │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┼───────┐
       │       │       │
       ▼       ▼       ▼
┌──────────┐ ┌─────┐ ┌─────────┐
│ wearables│ │ bci │ │ therapy │
└──────────┘ └─────┘ └─────────┘
```

All domain-specific packages depend on `@the-governor-hq/constitution-core`.

## Package Roles

### `@the-governor-hq/constitution-core`

**Purpose:** Shared safety infrastructure used by all domains

**Contains:**
- Universal safety rules (no medical claims, no diagnoses, etc.)
- Language constraints (avoid prescriptive language)
- Product principles (baseline-first, deviation-driven)
- Validation utilities (`validateLanguage`, `validateScope`)
- Type definitions

**Published independently:** Yes  
**Users install directly:** Usually not (auto-installed by domain packages)

### `@the-governor-hq/constitution-wearables`

**Purpose:** Safety constraints for smartwatch/fitness tracker data

**Contains:**
- Wearable-specific documentation (HRV, sleep, activity)
- MCP server with wearable data context
- Install scripts for auto-configuration
- `.cursorrules` for Cursor AI
- Tests for wearable data scenarios

**Published independently:** Yes  
**Users install directly:** Yes  
**Status:** ✅ Production ready

### `@the-governor-hq/constitution-bci`

**Purpose:** Safety constraints for brain-computer interface data

**Contains:**
- BCI-specific rules (no mental state diagnosis, no emotion reading)
- EEG/fNIRS data guidelines
- Neurofeedback safety boundaries
- Privacy requirements for neural data

**Published independently:** Yes  
**Users install directly:** Yes  
**Status:** 🚧 In development

### `@the-governor-hq/constitution-therapy`

**Purpose:** Safety constraints for therapy and mental health data

**Contains:**
- Therapy-specific rules (no diagnoses, no crisis intervention)
- Mood tracking guidelines
- Professional referral requirements
- Crisis safety protocols (988, emergency resources)

**Published independently:** Yes  
**Users install directly:** Yes  
**Status:** 🚧 In development

## Workspace Configuration

The root `package.json` uses npm workspaces:

```json
{
  "name": "@the-governor-hq/governor-hq-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

This allows:
- Shared dependencies via hoisting
- Cross-package development
- Single `npm install` at root
- Workspace-aware commands

## Development Workflow

### Initial Setup

```bash
# Clone the repo
git clone https://github.com/the-governor-hq/constitution.git
cd the-governor-hq/docs

# Install all packages
npm install
```

### Working on Packages

```bash
# Run tests across all packages
npm test --workspaces

# Build documentation site
npm run build

# Start dev server
npm run dev
```

### Publishing Packages

```bash
# Publish all packages (requires npm auth)
npm publish --workspaces --access public

# Or publish individually
cd packages/core
npm publish --access public

cd ../wearables
npm publish --access public
```

### Version Bumping

```bash
# Bump version in specific package
cd packages/wearables
npm version patch  # 1.0.0 -> 1.0.1

# Bump across all packages (manual - update each package.json)
```

## Adding a New Domain Package

Want to add a new health data domain (e.g., nutrition, genomics, lab results)? Follow these steps:

### 1. Create Package Directory

```bash
mkdir -p packages/your-domain
cd packages/your-domain
```

### 2. Create `package.json`

```json
{
  "name": "@the-governor-hq/constitution-your-domain",
  "version": "1.0.0",
  "description": "AI Safety Constitution for [Your Domain] Data Projects",
  "main": "mcp-server.js",
  "types": "index.d.ts",
  "scripts": {
    "ai:context": "node mcp-server.js",
    "postinstall": "node install.js"
  },
  "keywords": [
    "ai-safety",
    "your-domain",
    "health-data",
    "constitutional-framework"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/the-governor-hq/constitution",
    "directory": "packages/your-domain"
  },
  "author": "Governor HQ",
  "license": "MIT",
  "dependencies": {
    "@the-governor-hq/constitution-core": "^1.0.0"
  }
}
```

### 3. Create `README.md`

Document:
- What data types are covered
- Domain-specific safety rules
- Allowed vs forbidden use cases
- Example applications
- Privacy considerations

See [`packages/bci/README.md`](packages/bci/README.md) as a template.

### 4. Create Documentation

Add domain-specific docs in `pages/your-domain/`:

```
pages/your-domain/
├── _meta.json
├── signals.mdx          # What data is available
├── constraints.mdx      # Specific safety boundaries
└── examples.mdx         # Code examples
```

### 5. Create `.cursorrules`

Define domain-specific rules for Cursor AI. Inherit from core rules and add domain constraints.

### 6. Create `install.js`

Auto-configuration script that runs on `npm install`:
- Copy `.cursorrules` to project root
- Update `.vscode/settings.json`
- Create `.mcp-config.json`

See [`packages/wearables/install.js`](packages/wearables/install.js) as reference.

### 7. Create `mcp-server.js`

MCP server that exposes your documentation as resources. See [`packages/wearables/mcp-server.js`](packages/wearables/mcp-server.js) as reference.

### 8. Write Tests

Create domain-specific tests:
```bash
touch mcp-server.test.js
```

### 9. Update Root README

Add your package to the main README's package list with install instructions and npm badge.

### 10. Publish

```bash
npm publish --access public
```

## Design Principles

### Domain Isolation
Each domain has unique data types and safety constraints. Keep packages independent.

### Core Inheritance
All domains inherit universal safety rules from `@the-governor-hq/constitution-core`.

### User Choice
Users should install only the domains they need, not everything.

### Consistency
All packages follow the same structure and patterns for predictability.

### Documentation First
Every domain must have comprehensive docs explaining its safety model.

## Questions?

- 💬 [GitHub Discussions](https://github.com/the-governor-hq/constitution/discussions)
- 🐛 [Issue Tracker](https://github.com/the-governor-hq/constitution/issues)

## License

MIT
