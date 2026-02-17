# @the-governor-hq/constitution-core

**Core AI Safety Infrastructure for Governor HQ Constitutional Framework**

This package contains shared safety rules, constraints, and utilities used across all domain-specific constitutions (wearables, BCI, therapy, etc.).

## What's Included

### 🛡️ Runtime Validator (NEW!)
**Hard post-generation gate: LLM → Validator → Output**

Validates AI-generated content before showing it to users:

```typescript
import { createValidator } from '@the-governor-hq/constitution-core';

const validator = createValidator({ domain: 'wearables', onViolation: 'block' });

const llmOutput = await callLLM(prompt);
const result = await validator.validate(llmOutput);

if (!result.safe) {
  return result.safeAlternative; // Blocked unsafe content
}

return result.output; // Safe to show user
```

**Features:**
- ⚡ Fast pattern matching (<10ms)
- 🔍 Optional LLM judge for edge cases
- 🎯 Express & Next.js middleware
- 🔧 Customizable violation actions (block/warn/log/sanitize)
- 📊 Built-in monitoring and metrics

**[📖 Full Validator Guide →](./VALIDATOR-GUIDE.md)** | **[See Examples →](./examples/runtime-validator-examples.ts)**

---

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
npm install --save-dev @the-governor-hq/constitution-wearables
npm install --save-dev @the-governor-hq/constitution-bci
npm install --save-dev @the-governor-hq/constitution-therapy
```

### TypeScript Support

This package is written in **TypeScript** and provides native type definitions. All types are automatically generated from the source code, ensuring they're always in sync with the implementation.

#### For TypeScript Projects

```typescript
import { 
  BaseGovernorMCPServer, 
  ServerConfig,
  createValidator,
  ValidatorConfig,
  ValidationResult,
  validateLanguage,
  UNIVERSAL_RULES 
} from '@the-governor-hq/constitution-core';

// Runtime Validator (fully typed)
const validator = createValidator({
  domain: 'wearables',
  onViolation: 'block',
  strictMode: true
});

const result: ValidationResult = await validator.validate(text);

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
  createValidator,
  validateLanguage,
  UNIVERSAL_RULES 
} = require('@the-governor-hq/constitution-core');

// Full autocomplete and IntelliSense support in VS Code
const validator = createValidator({ 
  domain: 'wearables',
  onViolation: 'block'
});

const result = await validator.validate(text);
if (!result.safe) {
  console.log(result.safeAlternative);
}
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

The core package includes a **research-grade evaluation system** using adversarial testing methodology:

```bash
# Install evaluation dependencies
npm install groq-sdk dotenv

# Configure API key
echo 'GROQ_API_KEY="your-key-here"' > evals/.env

# Run safety evaluations
npm run eval
```

### Experimental Results

**Model:** llama-3.3-70b-versatile (Groq)  
**Pass Rate:** 89.66% (26/29)  
**Test Date:** 2025-01-23

The evaluation system:
- ✅ 29 adversarial test cases across 5 safety categories
- ✅ Multi-model comparative testing (Groq, Anthropic, OpenAI)
- ✅ LLM judge semantic validation (temperature=0.3)
- ✅ Deterministic pattern matching for forbidden terms
- ✅ Statistical analysis with documented validity threats
- ✅ CI/CD integration (exit code 1 on failures)

### Methodology

The system implements peer-reviewed adversarial testing methodology (Perez et al. 2022, Ganguli et al. 2022) with documented limitations including non-determinism, self-judging bias, and inter-rater reliability constraints.

**[📖 Full Methodology & Results →](./evals/README.md)**


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
- [GitHub Repository](https://github.com/the-governor-hq/constitution)

---

## 🙏 Acknowledgments

This framework was developed with assistance from AI coding assistants:

- **Claude Opus 4.5 & Sonnet 4.5** (Anthropic)
- **Grok code fast 1** (xAI)
- **Gemini 3.0 Pro** (Google)

## License

MIT
