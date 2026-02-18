# Changelog - @the-governor-hq/constitution-core

All notable changes to the core package will be documented in this file.

## [3.3.3] - 2026-02-18

### 🔧 Improvement: Signal-Based Adversarial Detection

**Breaking behavior change:** `detectAdversarialAttack()` no longer auto-generates a critical violation when `normalizeText()` changes the string. Normalization diffs are common in benign text (emoji, symbols, formatting, copy/paste) and were causing noisy false-positive blocks.

#### Changed
- **Adversarial detection is now a signal, not an auto-violation**:
  - Always recorded in `ValidationResult.metadata.adversarialSignal`
  - Applies a graduated confidence penalty (0.05–0.15) based on manipulation type
  - Only escalated to a critical violation when the normalized text reveals a **new** forbidden pattern/semantic hit that the original text didn't trigger (correlation gate)
  
- **`detectAdversarialAttack()` return type extended**:
  - New `confidencePenalty` field (0 for clean text, 0.05 misspelling, 0.12 special-chars, 0.15 spacing)
  
- **`ValidationResult.metadata` extended**:
  - New `adversarialSignal?: AdversarialSignal` field with `detected`, `manipulationType`, `confidencePenalty`, and `correlatedWithForbiddenHit`

- **`validateSync()` now includes adversarial signal + correlation gating** (previously only `validate()` checked adversarial)

#### New Type
- `AdversarialSignal` interface exported from `@the-governor-hq/constitution-core`

#### Impact
- Benign text with emoji, symbols, or unusual formatting **no longer blocked**
- Genuine obfuscation attacks (spacing/special-chars hiding forbidden terms) **still caught and blocked as critical**
- Confidence score slightly reduced for manipulated text even when not escalated

## [3.1.1] - 2026-02-17

### 🐛 Bug Fixes

#### Fixed ES Module Import Error
- **Issue**: `@xenova/transformers` is an ES Module and cannot be loaded with CommonJS `require()`
- **Solution**: Changed to use dynamic `import()` via Function constructor to preserve ES Module compatibility
- **Impact**: Fixes CI/CD test failures with error `ERR_REQUIRE_ESM`
- **Files Modified**: `src/validators/semantic-similarity.ts`
- **Technical Details**: TypeScript's CommonJS output was converting static imports to `require()`, which doesn't work with ESM-only packages. Now using `new Function('specifier', 'return import(specifier)')` to preserve dynamic import syntax in compiled output.

## [3.1.0] - 2026-02-17

### 🛡️ Feature: Hardened Pattern Matcher with Semantic Similarity

**Major Enhancement:** Added semantic similarity embeddings to prevent adversarial attacks that bypass regex patterns.

#### Added
- **Semantic Similarity Module** (`src/validators/semantic-similarity.ts`):
  - Text embedding generation using `@xenova/transformers`
  - Cosine similarity calculation between vectors
  - Vector database of forbidden medical concepts (14 pre-computed embeddings)
  - Batch processing support for efficiency
  - `initializeVectorDatabase()` for startup initialization
  
- **Adversarial Attack Detection**:
  - `normalizeText()` - Removes spacing, special characters, and misspellings
  - `detectAdversarialAttack()` - Identifies manipulation attempts
  - Detects: spacing attacks, special character insertion, misspellings
  
- **Hardened Pattern Checks**:
  - `runHardenedChecks()` - Combines regex + semantic validation
  - `runSemanticChecks()` - Async semantic similarity matching
  - `semanticToViolations()` - Convert semantic matches to violation objects
  
- **Configuration Options**:
  - `useSemanticSimilarity` - Enable/disable semantic matching
  - `semanticThreshold` - Similarity threshold (0-1, default: 0.75)
  
- **New Dependencies**:
  - `@xenova/transformers` ^2.17.1 - For embedding model (all-MiniLM-L6-v2)

#### Enhanced
- **Runtime Validator**:
  - Now supports async semantic validation
  - Automatically detects and flags adversarial manipulations
  - Metadata includes semantic similarity scores
  
- **Pattern Matcher**:
  - Improved text normalization
  - Better special character handling
  - Enhanced misspelling detection

- **Type Definitions**:
  - `SemanticCheckResult` - Semantic validation results
  - `SemanticViolation` - Individual semantic matches
  - `ForbiddenConcept` - Vector database concept structure
  - Updated `ValidationResult.metadata` with semantic fields

#### Tests
- **New Test Suite** (`tests/adversarial-attacks.test.js`):
  - 23 tests covering normalization, detection, and real-world attacks
  - Tests spacing attacks: `d i a g n o s e`
  - Tests special characters: `d!i@a#g$n%o^s&e`
  - Tests misspellings: `diagnoz`, `tratment`
  - All tests passing ✅
  
- **Semantic Similarity Tests** (`tests/semantic-similarity.test.js`):
  - Full embedding and vector database tests
  - Requires model download on first run

#### Documentation
- **New Guide**: `pages/hardened-pattern-matcher.mdx`
  - Complete usage guide with examples
  - Performance benchmarks
  - Migration guide from regex-only
  - Advanced usage patterns
  - FAQ and troubleshooting
  
- **Updated README**:
  - Added hardened pattern matcher section
  - Performance comparison table
  - Quick start examples

#### Performance
- **Regex-only mode**: <10ms (unchanged)
- **Semantic mode (first use)**: 2-5s (model download, ~80MB)
- **Semantic mode (subsequent)**: 100-300ms per validation
- **Model size**: ~80MB (cached locally)

#### Breaking Changes
- None - Semantic similarity is **opt-in** via config
- Default behavior (regex-only) unchanged
- Existing code continues to work without modifications

#### Migration Example
```typescript
// Before (regex only)
const validator = createValidator({ domain: 'wearables' });
const result = validator.validateSync(text);

// After (hardened)
const validator = createValidator({
  domain: 'wearables',
  useSemanticSimilarity: true,  // Opt-in
});
const result = await validator.validate(text);  // Now async
```

#### Attack Prevention Examples
```typescript
// ❌ All now blocked by semantic similarity:
'You have d i a g n o s e d insomnia'     // Spacing attack
'Take mel@tonin 5mg before bed'          // Special chars + dosage
'You have diagnoz of anxeity'            // Misspellings
'T A K E  s u p p l e m e n t s'        // Spaced prescription
```

---

## [2.0.0] - 2026-02-16

### 🎉 Major: TypeScript Migration

**Breaking Change:** Migrated from JavaScript with manual `.d.ts` files to native TypeScript.

#### Changed
- **Converted source files to TypeScript:**
  - `base-mcp-server.js` → `src/base-mcp-server.ts`
  - `index.js` → `src/index.ts`
- **Auto-generated type definitions:** Type definitions are now automatically generated from TypeScript source during build
- **Build process:** Added TypeScript compilation step (`npm run build`)
- **Package structure:**
  - Source files moved to `src/` directory
  - Compiled output in `dist/` directory
  - Source maps included for debugging

#### Added
- **Strong type safety:**
  - `ServerConfig` interface for MCP server configuration
  - `MCPRequest` and `MCPResponse` interfaces for JSON-RPC
  - `ResourceInfo` and `ResourceContent` interfaces
  - Enhanced type checking for all public APIs
- **Development tools:**
  - TypeScript compiler configuration (`tsconfig.json`)
  - Build scripts: `build`, `build:watch`, `clean`
  - `prepublishOnly` hook for automatic builds
- **Developer experience:**
  - Native IDE autocomplete support
  - Compile-time type checking
  - Better error messages
  - Source map support for debugging

#### Benefits
- ✅ **No more manual `.d.ts` maintenance** - types are always in sync with implementation
- ✅ **Guaranteed type safety** - configuration objects are strictly validated at compile time
- ✅ **Better documentation** - JSDoc comments are preserved and enhanced with type information
- ✅ **Improved developer experience** - other packages consuming this library get full autocomplete and type checking

#### Migration Guide
For packages depending on `@the-governor-hq/constitution-core`:
- No breaking changes to the runtime API
- Type definitions are enhanced but backward compatible
- Update imports if using TypeScript (no changes needed for JavaScript)

```typescript
// Before (still works)
const { BaseGovernorMCPServer } = require('@the-governor-hq/constitution-core');

// After (TypeScript - recommended)
import { BaseGovernorMCPServer, ServerConfig } from '@the-governor-hq/constitution-core';
```

## [1.0.0] - 2026-02-15

### Added
- Initial release of core AI safety infrastructure
- `BaseGovernorMCPServer` abstract class for MCP servers
- Universal safety rules shared across all domains
- Language constraint validation
- Product principles framework
- Validation utilities (`validateLanguage`, `validateScope`)
