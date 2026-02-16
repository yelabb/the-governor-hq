# Changelog - @yelabb/constitution-core

All notable changes to the core package will be documented in this file.

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
For packages depending on `@yelabb/constitution-core`:
- No breaking changes to the runtime API
- Type definitions are enhanced but backward compatible
- Update imports if using TypeScript (no changes needed for JavaScript)

```typescript
// Before (still works)
const { BaseGovernorMCPServer } = require('@yelabb/constitution-core');

// After (TypeScript - recommended)
import { BaseGovernorMCPServer, ServerConfig } from '@yelabb/constitution-core';
```

## [1.0.0] - 2026-02-15

### Added
- Initial release of core AI safety infrastructure
- `BaseGovernorMCPServer` abstract class for MCP servers
- Universal safety rules shared across all domains
- Language constraint validation
- Product principles framework
- Validation utilities (`validateLanguage`, `validateScope`)
