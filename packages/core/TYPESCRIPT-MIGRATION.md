# TypeScript Migration Guide

## Overview

The `@the-governor-hq/constitution-core` package has been migrated from JavaScript with manually maintained `.d.ts` files to native TypeScript. This provides better type safety, eliminates sync issues between implementation and types, and improves the developer experience.

## What Changed

### File Structure

**Before:**
```
packages/core/
├── index.js
├── index.d.ts (manually maintained)
├── base-mcp-server.js
└── package.json
```

**After:**
```
packages/core/
├── src/
│   ├── index.ts (TypeScript source)
│   └── base-mcp-server.ts (TypeScript source)
├── dist/ (auto-generated)
│   ├── index.js (compiled)
│   ├── index.d.ts (auto-generated)
│   ├── base-mcp-server.js (compiled)
│   └── base-mcp-server.d.ts (auto-generated)
├── tsconfig.json
└── package.json (updated)
```

### Package.json Changes

- `main`: `index.js` → `dist/index.js`
- `types`: `index.d.ts` → `dist/index.d.ts`
- Added `build` scripts
- Added TypeScript dev dependencies
- Added `prepublishOnly` hook to auto-build before publishing

## For Package Consumers

### No Breaking Changes

If you're consuming this package from JavaScript or TypeScript, **no changes are required**. The API remains the same.

```javascript
// Still works exactly the same
const { BaseGovernorMCPServer } = require('@the-governor-hq/constitution-core');
```

```typescript
// Still works, but now with better types
import { BaseGovernorMCPServer } from '@the-governor-hq/constitution-core';
```

### Enhanced Type Safety

TypeScript consumers now benefit from:
- **Stricter type checking** - The `ServerConfig` interface is fully typed and validated
- **Better autocomplete** - All properties and methods have complete type information
- **Inline documentation** - JSDoc comments are preserved and enriched with types

### Example: Better Error Catching

**Before (with manual .d.ts):**
```typescript
// May have missed a required property in the manually maintained types
const server = new BaseGovernorMCPServer({
  serverName: 'test',
  // Missing required fields - might not be caught by types
});
```

**After (with auto-generated types from TypeScript):**
```typescript
// TypeScript now catches ALL missing required fields at compile time
const server = new BaseGovernorMCPServer({
  serverName: 'test',
  // Error: Missing required properties: uriScheme, baseDir, resources, contextSummary
});
```

## For Package Maintainers

### Development Workflow

```bash
# Install dependencies (includes TypeScript)
npm install

# Build the package
npm run build

# Watch mode for development
npm run build:watch

# Clean build artifacts
npm run clean
```

### Making Changes

1. **Edit TypeScript source files** in `src/`
2. **Run `npm run build`** to compile
3. **Types are auto-generated** - no need to manually maintain `.d.ts` files
4. **Test in consuming packages** to verify changes

### Publishing

The `prepublishOnly` script automatically:
1. Cleans the `dist/` directory
2. Runs TypeScript compilation
3. Generates fresh `.d.ts` files
4. Validates all types

```bash
npm publish
# Automatically runs: npm run clean && npm run build
```

## Migrating Dependent Packages

### Recommended: Migrate to TypeScript

For packages like `@the-governor-hq/constitution-wearables`, `@the-governor-hq/constitution-bci`, etc., consider migrating to TypeScript as well for consistency.

**Benefits:**
- Type-safe configuration
- Better tooling support
- Compile-time error detection
- Easier refactoring

### Quick Migration Steps

1. **Add TypeScript configuration**
   ```bash
   # Create tsconfig.json similar to core package
   ```

2. **Rename .js files to .ts**
   ```bash
   mv mcp-server.js src/mcp-server.ts
   ```

3. **Add type annotations**
   ```typescript
   import { BaseGovernorMCPServer, ServerConfig } from '@the-governor-hq/constitution-core';
   
   const config: ServerConfig = {
     // Now fully type-checked!
   };
   ```

4. **Update package.json**
   - Add build scripts
   - Update main and types paths
   - Add TypeScript dependencies

5. **Build and test**
   ```bash
   npm run build
   npm test
   ```

## Benefits Summary

### For All Users
- ✅ **Always in sync** - Types match implementation perfectly
- ✅ **Better documentation** - Types serve as living documentation
- ✅ **IDE support** - Full autocomplete in VS Code, WebStorm, etc.

### For TypeScript Users
- ✅ **Compile-time safety** - Catch configuration errors before runtime
- ✅ **Refactoring confidence** - TypeScript guides safe changes
- ✅ **Type inference** - Less manual type annotations needed

### For JavaScript Users  
- ✅ **IntelliSense** - VS Code provides autocomplete from types
- ✅ **No changes required** - Works exactly as before
- ✅ **Optional types** - Can add JSDoc for some type checking

### For Package Maintainers
- ✅ **No manual `.d.ts` maintenance** - Eliminates sync bugs
- ✅ **Better refactoring** - Compiler catches breaking changes
- ✅ **Higher quality** - Type checking prevents common errors

## Troubleshooting

### "Cannot find module" errors

Make sure you've run `npm run build` before importing:
```bash
cd packages/core
npm run build
```

### TypeScript compilation errors

Check your `tsconfig.json` settings. The core package uses:
- `target: ES2020`
- `module: commonjs`  
- `strict: true`

### Type mismatches

If you see type errors after upgrading, it might be because the new types are more accurate. Review the error message - it's often catching a real bug!

## Questions?

- Check the [CHANGELOG.md](./CHANGELOG.md) for detailed changes
- Review the [README.md](./README.md) for usage examples
- Open an issue on GitHub for support
