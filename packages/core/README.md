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

### TypeScript Support

This package is written in **TypeScript** and provides native type definitions. All types are automatically generated from the source code, ensuring they're always in sync with the implementation.

#### For TypeScript Projects

```typescript
import { 
  BaseGovernorMCPServer, 
  ServerConfig,
  validateLanguage,
  UNIVERSAL_RULES 
} from '@yelabb/constitution-core';

// ServerConfig is fully typed
const config: ServerConfig = {
  serverName: 'my-constitution',
  uriScheme: 'my-uri',
  baseDir: __dirname,
  resources: {
    'hard-rules': './rules.md'
  },
  contextSummary: 'My context'
};

const server = new BaseGovernorMCPServer(config);
```

#### For JavaScript Projects

```javascript
const { 
  BaseGovernorMCPServer, 
  validateLanguage,
  UNIVERSAL_RULES 
} = require('@yelabb/constitution-core');

// Full autocomplete and IntelliSense support in VS Code
const config = {
  serverName: 'my-constitution',
  uriScheme: 'my-uri',
  baseDir: __dirname,
  resources: {
    'hard-rules': './rules.md'
  },
  contextSummary: 'My context'
};

const server = new BaseGovernorMCPServer(config);
```

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Watch mode for development
npm run build:watch

# Clean build artifacts
npm run clean
```

The build process:
- Compiles TypeScript sources from `src/` to `dist/`
- Generates `.d.ts` type definition files
- Creates source maps for debugging
- Validates type correctness at compile time

## Safety Evaluations

The core package includes an **automated red teaming system** that validates safety constraints:

```bash
# Install evaluation dependencies
npm install @anthropic-ai/sdk

# Set API key
export ANTHROPIC_API_KEY="your-key-here"

# Run safety evaluations
npm run eval

# Run specific category
npm run eval:medical
npm run eval:supplements

# Run only critical tests
npm run eval:critical
```

The evaluation system:
- ✅ Tests 28+ adversarial scenarios
- ✅ Uses LLM judges for semantic validation
- ✅ Verifies forbidden pattern detection
- ✅ Generates detailed compliance reports
- ✅ Integrates with CI/CD pipelines

**[📖 Full Evaluation Documentation →](./evals/README.md)**


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
