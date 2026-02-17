# 🚀 Quick Reference Guide - Governor HQ Development

**Keep this open while developing. Essential commands and checks at your fingertips.**

---

## 📋 Before Starting Any Feature

```bash
# 1. Check current versions are aligned
grep '"version"' packages/*/package.json

# 2. Ensure clean working tree
git status

# 3. Pull latest changes
git pull --tags

# 4. Check which version you're on
cat package.json | grep version
```

---

## 🔨 Development Flow

### 1. Create Your Feature
```bash
# Create new module in appropriate package
# packages/core/src/validators/[your-feature].ts

# Update types
# packages/core/src/validators/types.ts

# Export from index
# packages/core/src/index.ts
```

### 2. Fix TypeScript Errors (Common Fixes)
```typescript
// ❌ Wrong: 'data' is of type 'unknown'
const data = await response.json();

// ✅ Correct:
const data = await response.json() as any;

// ❌ Wrong: Unused variable warning
let someVar: string | undefined;

// ✅ Correct: Remove it or use it
// If intentionally unused: let _someVar: string | undefined;
```

### 3. Build & Test
```bash
# Build core package
cd packages/core
npm run build

# If errors, read carefully and fix
# Then build again until successful

# Test implementation
node tests/[your-feature]-mock.test.js

# If all good, build everything
cd ../..
npm run build
```

---

## 🧪 Testing Commands

```bash
# Mock tests (no API keys needed)
node packages/core/tests/[feature]-mock.test.js

# Integration tests (requires API keys)
node packages/core/tests/[feature].test.js

# All tests
npm test

# Specific package tests
cd packages/core && npm test
```

---

## 📦 Version Management

### Check Versions
```bash
# Quick check - all should match
grep '"version"' packages/*/package.json

# Detailed check
node scripts/version-lockstep.js
```

### Bump Versions
```bash
# Bug fixes (3.2.0 → 3.2.1)
node scripts/version-lockstep.js patch

# New features (3.2.0 → 3.3.0)
node scripts/version-lockstep.js minor

# Breaking changes (3.2.0 → 4.0.0)
node scripts/version-lockstep.js major

# Specific version
node scripts/version-lockstep.js 3.3.0
```

### Verify Cross-Package Dependencies
```bash
# Check core dependency in all packages
grep '@the-governor-hq/constitution-core' packages/*/package.json

# Should show EXACT versions (no ^)
# Example: "@the-governor-hq/constitution-core": "3.2.0"
```

---

## 🏗️ Build Commands

```bash
# Clean and build core
cd packages/core
npm run clean
npm run build

# Build all packages (from root)
npm run build

# Build individual packages
Push-Location packages/core; npm run build; Pop-Location
Push-Location packages/bci; npm run build; Pop-Location
Push-Location packages/therapy; npm run build; Pop-Location
Push-Location packages/wearables; npm run build; Pop-Location
```

---

## 📤 Publishing

### Pre-Publish Checklist (30 seconds)
```bash
# 1. All tests pass?
npm test

# 2. All versions aligned?
grep '"version"' packages/*/package.json

# 3. All builds successful?
npm run build

# 4. No uncommitted changes?
git status

# All ✅? Proceed to publish.
```

### Publish All Packages
```bash
# From root directory
npm run publish:all

# Authenticate if prompted
# Wait for all 4 packages to publish
```

### Tag and Push
```bash
# Replace X.Y.Z with your version
git add .
git commit -m "feat: your feature description"
git tag vX.Y.Z
git push --follow-tags
```

---

## 🔍 Debugging Common Issues

### "Cannot find module" errors
```bash
# Rebuild everything
npm run build

# Check dist/ folders exist
ls packages/core/dist
ls packages/bci/dist
ls packages/therapy/dist
ls packages/wearables/dist
```

### Version drift detected
```bash
# Reset all versions to same number
node scripts/version-lockstep.js 3.2.0

# Verify
grep '"version"' packages/*/package.json
```

### TypeScript errors won't go away
```bash
# Clean everything
cd packages/core
npm run clean
npm run build

# Still failing? Check:
# 1. Did you export from index.ts?
# 2. Did you add 'as any' for unknown types?
# 3. Did you remove unused variables?
```

### Publish fails with "version already exists"
```bash
# You forgot to bump version!
node scripts/version-lockstep.js patch  # or minor/major

# Then rebuild and publish
npm run build
npm run publish:all
```

---

## 📝 File Export Checklist

When you create a new module, export it:

```typescript
// packages/core/src/index.ts

// Export the class/function
export { YourFeature, createYourFeature } from './validators/your-feature';

// Export the types
export type { YourFeatureConfig, YourFeatureResult } from './validators/your-feature';
```

Check exports worked:
```bash
# Build and check dist/index.d.ts
npm run build
cat dist/index.d.ts | grep -i "yourfeature"
```

---

## 🎯 Essential File Locations

| What | Where |
|------|-------|
| Core exports | `packages/core/src/index.ts` |
| Type definitions | `packages/core/src/validators/types.ts` |
| Runtime validator | `packages/core/src/validators/runtime-validator.ts` |
| Tests | `packages/core/tests/*.test.js` |
| Version script | `scripts/version-lockstep.js` |
| Publishing guide | `PUBLISHING.md` |
| Monorepo docs | `MONOREPO.md` |
| Contributing | `CONTRIBUTING.md` |

---

## ⚡ Speed Tips

### Fast Iteration Loop
```bash
# Terminal 1: Auto-rebuild on save
cd packages/core
npm run build:watch

# Terminal 2: Run tests
node tests/your-test.test.js
# Re-run after changes
```

### Quick Version Bump & Publish
```bash
# One-liner for patch release
node scripts/version-lockstep.js patch && npm run build && npm run publish:all

# Then tag
git add . && git commit -m "fix: description" && git tag vX.Y.Z && git push --follow-tags
```

### Check Everything Before Committing
```bash
# One command to rule them all
npm test && npm run build && grep '"version"' packages/*/package.json
# All green? You're good to commit.
```

---

## 🚨 Critical Warnings

### ⚠️ NEVER DO THESE:

1. ❌ Bump version in only one package.json
2. ❌ Publish packages individually (use `npm run publish:all`)  
3. ❌ Use `^3.2.0` in dependencies (use exact: `3.2.0`)
4. ❌ Leave placeholder comments in published code
5. ❌ Commit with TypeScript errors
6. ❌ Publish without testing
7. ❌ Forget to export new modules from index.ts
8. ❌ Skip the build step before publishing

### ✅ ALWAYS DO THESE:

1. ✅ Use `version-lockstep.js` for version bumps
2. ✅ Run `npm test` before publishing
3. ✅ Run `npm run build` before publishing
4. ✅ Export new features from `src/index.ts`
5. ✅ Create both mock and integration tests
6. ✅ Update documentation when adding features
7. ✅ Tag releases with `git tag vX.Y.Z`
8. ✅ Use exact versions for @the-governor-hq packages

---

## 📞 When Stuck

1. **Read the error message carefully** - TypeScript errors are detailed
2. **Check this guide** - Most issues covered here
3. **Check existing code** - Similar patterns already exist
4. **Read docs** - PUBLISHING.md, MONOREPO.md, CONTRIBUTING.md
5. **Check git history** - `git log packages/core/src/validators/`
6. **Start over** - Sometimes easier to rebuild from scratch

---

## 🎓 Remember

> **Quality over speed.**
> 
> It's better to implement one feature correctly than to rush and create broken placeholders that need fixing later.

**When in doubt:**
- Build → Test → Version → Publish
- All packages together
- No placeholders
- Document everything

---

*Quick Reference v1.0 - Updated February 17, 2026*
*For Governor HQ v3.2.0+*
