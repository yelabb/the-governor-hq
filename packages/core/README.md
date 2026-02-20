# @the-governor-hq/constitution-core

**Core AI Safety Infrastructure for Governor HQ Constitutional Framework**

This package contains shared safety infrastructure used across all domain-specific constitutions (wearables, BCI, therapy). It provides runtime validators, middleware, CLI tools, and MCP servers for comprehensive safety enforcement.

---

## 🛠️ Tools Included

### 1. Runtime Validator
**Hard post-generation gate: LLM → Validator → Output**

Fast pattern matching (<10ms) with optional LLM judge for edge cases:

```typescript
import { createValidator } from '@the-governor-hq/constitution-core';

const validator = createValidator({ 
  domain: 'wearables', 
  onViolation: 'block' 
});

const result = await validator.validate(aiGeneratedText);

if (!result.safe) {
  console.log('Blocked:', result.violations);
  return result.safeAlternative;
}

return result.output;
```

**Features:**
- ⚡ <10ms validation speed (regex mode)
- 🛡️ **Hardened Pattern Matcher** with semantic similarity (prevents spacing/spelling attacks)
- 🔍 Optional LLM judge for edge cases
- 🎯 Multiple violation actions (block, warn, log) - **sanitize deprecated**
- 📊 Built-in confidence scoring
- 🔧 Custom rules support

> **⚠️ Note**: `onViolation: 'sanitize'` is deprecated as of v3.3.0. Use `'block'` instead. Auto-sanitizing medical advice is unsafe.

[📖 Full Validator Guide →](https://the-governor-hq.vercel.app/packages/core/runtime-validation)
[🛡️ Hardened Pattern Matcher →](https://the-governor-hq.vercel.app/packages/core/hardened-pattern-matcher)

### 2. API Middleware
**Automatic validation for Express and Next.js**

Express example:
```typescript
import { governorValidator } from '@the-governor-hq/constitution-core/middleware';

app.post('/api/chat', 
  governorValidator({ domain: 'wearables', onViolation: 'block' }),
  async (req, res) => {
    const aiResponse = await callLLM(req.body.message);
    res.json({ message: aiResponse }); // Auto-validated
  }
);
```

Next.js example:
```typescript
import { withGovernor } from '@the-governor-hq/constitution-core/middleware';

export default withGovernor(
  async (req, res) => {
    const aiResponse = await callLLM(req.body.message);
    res.json({ message: aiResponse });
  },
  { domain: 'therapy', onViolation: 'block' } // Use 'block' instead of deprecated 'sanitize'
);
```

[📖 Middleware Guide →](https://the-governor-hq.vercel.app/packages/core/middleware)

### 3. Hardened Pattern Matcher
**Semantic similarity to prevent adversarial attacks + multilingual support**

Traditional regex patterns can be bypassed with spacing (`d i a g n o s e`), special characters (`d!i@a#g$n%o^s&e`), misspellings (`diagnoz`), or **non-English text** (`tienes insomnio`). The hardened pattern matcher uses **multilingual semantic similarity embeddings** to catch these attacks:

```typescript
import { createValidator } from '@the-governor-hq/constitution-core';

const validator = createValidator({
  domain: 'wearables',
  useSemanticSimilarity: false,  // Default: lightweight mode (no ML model)
  semanticThreshold: 0.75,       // Only used if useSemanticSimilarity: true
});

// 🪶 Lightweight Mode (Default):
// - Ultra-fast (<10ms), no ML model, English-only
// - Best for: Small Node.js projects, serverless, development

// 🛡️ Enhanced Mode (Opt-in):
// - Multilingual (50+ languages), adversarial protection
// - ~420MB ML model, 100-300ms latency
// - Enable with: useSemanticSimilarity: true
// - Best for: Production with non-English users, security-critical apps

// ❌ All blocked by lightweight mode (English):
await validator.validate('You have insomnia');                // Direct medical claim
await validator.validate('Take melatonin 5mg before bed');    // Supplement recommendation
await validator.validate('你有失眠症');                             // Chinese
```

**How it works:**
1. **Text normalization** removes obfuscation (preserves Unicode for multilingual)
2. **Language detection** identifies input language (50+ languages supported)
3. **Adversarial signal** records manipulation metadata + applies confidence penalty  
4. **Cross-lingual semantic matching** compares text embeddings against forbidden medical concepts
5. **Correlation gate** — adversarial detection only escalates to a critical violation when the normalized text reveals a forbidden hit that the original didn't (i.e. the manipulation was hiding something)

**Multilingual Support (v3.3.0+):**
- ✅ **50+ languages** supported automatically (Spanish, French, German, Chinese, Arabic, Japanese, Russian, etc.)
- ✅ **No per-language patterns** needed - uses cross-lingual embedding model
- ✅ **Forbidden concepts in English** map to semantic equivalents in any language
- ✅ **Code-switching detection** catches mixed-language attacks

**Performance:**
- First use: 10-30s (multilingual model download, ~420MB)
- Subsequent: 150-400ms per validation
- Regex-only: <10ms (fast-path for English optimization)

[🛡️ Hardened Pattern Matcher Guide →](https://the-governor-hq.vercel.app/packages/core/hardened-pattern-matcher)

### 4. CLI Validator
**Command-line validation for CI/CD pipelines**

```bash
# Validate a file
npx governor-validate src/components/InsightCard.tsx

# Validate all TypeScript files
npx governor-validate "src/**/*.{ts,tsx}"

# Exit code 1 if violations found (perfect for CI)
```

### 5. MCP Server Base Class
**Foundation for domain-specific MCP servers**

```typescript
import { BaseGovernorMCPServer } from '@the-governor-hq/constitution-core';

const server = new BaseGovernorMCPServer({
  serverName: 'my-constitution',
  uriScheme: 'my-uri',
  baseDir: __dirname,
  resources: {
    'hard-rules': './rules.md',
    'language-rules': './language.md'
  },
  contextSummary: 'Domain-specific safety rules'
});

server.start();
```

### 6. Evaluation System
**Red-teaming framework with 28+ adversarial test cases**

```bash
cd packages/core
npm run eval

# Output:
# ✓ 26/29 test cases passed (89.66%)
# ✗ Disease naming violation detected
# ✗ Cardiovascular claims not blocked
```

LLM-as-judge methodology with multi-model testing.

[📖 Eval System Guide →](./evals/README.md)

---

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
