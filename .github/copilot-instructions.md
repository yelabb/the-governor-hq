# GitHub Copilot Instructions for Governor HQ Development

## 🎯 Critical Principles

### 1. **Always Implement, Never Just Comment**
- If a feature is advertised in docs/README, it MUST be fully implemented
- Placeholder comments like `// TODO: implement` or `// LLM judge would go here` are FORBIDDEN in published code
- If you see a placeholder, implement it before moving forward

### 2. **Lockstep Versioning is Sacred**
- ALL packages MUST share the SAME version number
- Never bump one package version without updating ALL others
- Use `node scripts/version-lockstep.js <patch|minor|major|X.Y.Z>` to update versions
- Verify version alignment before publishing: `grep -r "version" packages/*/package.json`

### 3. **Build-Test-Version-Publish Workflow**
Every feature addition MUST follow this sequence:
```bash
# 1. Implement the feature fully
# 2. Fix ALL TypeScript errors
npm run build  # In packages/core

# 3. Test the implementation
node tests/your-test.test.js
npm test

# 4. Update versions in lockstep
node scripts/version-lockstep.js <patch|minor|major|X.Y.Z>

# 5. Build ALL packages
npm run build  # Root level

# 6. Publish ALL packages together
npm run publish:all

# 7. Tag and push
git add .
git commit -m "feat: your feature description"
git tag vX.Y.Z
git push --follow-tags
```

## 📦 Monorepo Structure

### Package Dependencies
```
@the-governor-hq/constitution-core (3.2.0)
    ↓ exact dependency (no ^)
├── @the-governor-hq/constitution-wearables (3.2.0)
├── @the-governor-hq/constitution-bci (3.2.0)
└── @the-governor-hq/constitution-therapy (3.2.0)
```

### Key Files to Check
- `packages/core/src/index.ts` - Core exports (check what's public API)
- `packages/core/package.json` - Core version and dependencies
- `packages/*/package.json` - Check peerDependencies match core version
- `scripts/version-lockstep.js` - Version management automation
- `PUBLISHING.md` - Publishing process documentation

## 🛠️ TypeScript Best Practices

### Common Errors to Avoid

#### Error: `'data' is of type 'unknown'`
**Wrong:**
```typescript
const data = await response.json();
return data.choices[0]?.message?.content;
```

**Correct:**
```typescript
const data = await response.json() as any;
return data.choices[0]?.message?.content || '';
```

#### Error: `variable is declared but never read`
**Solution:** Remove unused variables or prefix with `_` if intentionally unused

### Always Export New Features
When adding a new module (e.g., `llm-client.ts`):
1. Create the module in `packages/core/src/validators/`
2. Export from `packages/core/src/index.ts`
3. Export types separately
4. Update `package.json` files section if needed

## 🧪 Testing Requirements

### Before Publishing ANY Package:

1. **Unit Tests** - Test individual functions
   ```bash
   node tests/pattern-matcher.test.js
   node tests/runtime-validator.test.js
   ```

2. **Integration Tests** - Test end-to-end workflows
   ```bash
   node tests/llm-judge-mock.test.js  # No API key needed
   node tests/llm-judge.test.js       # Requires API keys
   ```

3. **Build Verification** - ALL packages must compile
   ```bash
   cd packages/core && npm run build
   cd packages/bci && npm run build
   cd packages/therapy && npm run build
   cd packages/wearables && npm run build
   ```

4. **Type Checking** - No TypeScript errors
   ```bash
   tsc --noEmit  # In each package
   ```

### Test File Naming Convention
- `*.test.js` - Regular tests
- `*-mock.test.js` - Tests that don't require external dependencies
- Place in `packages/core/tests/` directory

## 🚀 Feature Implementation Checklist

When implementing a new feature (like LLM judge), follow this checklist:

### Phase 1: Implementation
- [ ] Create the core module (e.g., `llm-client.ts`)
- [ ] Add proper TypeScript types (e.g., `LLMProvider`, `LLMClientConfig`)
- [ ] Integrate into existing systems (e.g., `RuntimeValidator`)
- [ ] Update type exports in `index.ts`
- [ ] Handle errors gracefully (fallbacks, warnings)
- [ ] Support multiple providers/options when applicable

### Phase 2: Testing
- [ ] Create mock tests (no external dependencies)
- [ ] Create integration tests (with external dependencies)
- [ ] Add test npm script to `package.json`
- [ ] Verify all TypeScript errors are fixed
- [ ] Run full build: `npm run build`
- [ ] Test in isolation: `node tests/your-test.test.js`

### Phase 3: Documentation
- [ ] Update README.md with new feature
- [ ] Add usage examples
- [ ] Document configuration options
- [ ] Update type documentation
- [ ] Add to CHANGELOG.md (if exists)

### Phase 4: Version & Publish
- [ ] Run version lockstep script
- [ ] Verify all package.json files updated
- [ ] Verify cross-package dependencies updated
- [ ] Build all packages: `npm run build`
- [ ] Publish all packages: `npm run publish:all`
- [ ] Create git tag: `git tag vX.Y.Z`
- [ ] Push with tags: `git push --follow-tags`

## 🎓 Lessons from LLM Judge Implementation (v3.2.0)

### What We Did Right
1. ✅ Created comprehensive LLM client supporting 3 providers (Groq, OpenAI, Anthropic)
2. ✅ Added graceful fallbacks when API key missing
3. ✅ Created mock tests that don't require API keys
4. ✅ Updated all package versions together (3.1.1 → 3.2.0)
5. ✅ Published all packages in one operation

### What We Fixed
1. ❌ **Placeholder code** - Removed `// LLM judge would go here` comments
2. ❌ **Type errors** - Fixed `data` being `unknown` type
3. ❌ **Unused variables** - Removed `llmJudgeReasoning` that wasn't used
4. ❌ **Missing exports** - Added `LLMClient`, `createLLMClient` to exports
5. ❌ **Version drift** - Used `version-lockstep.js` to sync versions

### Key Takeaways
- **Never advertise unimplemented features** - If README says "Optional LLM judge", it must work
- **Test with and without dependencies** - Mock tests for CI, integration tests for validation
- **Version management is critical** - One wrong version breaks dependent packages
- **TypeScript strictness helps** - Errors like `unknown` type catch real issues
- **Build before publish** - Always run full monorepo build to catch cross-package issues

## 🔍 Code Review Self-Checklist

Before committing ANY code, verify:

- [ ] No placeholder comments or TODOs in implementation code
- [ ] All TypeScript errors resolved (`npm run build` succeeds)
- [ ] All tests pass (both mock and integration if applicable)
- [ ] All advertised features are fully implemented
- [ ] Version numbers are aligned across packages
- [ ] Cross-package dependencies use exact versions (no `^`)
- [ ] New features exported from `index.ts`
- [ ] Error handling includes graceful fallbacks
- [ ] Console warnings inform users of missing config (don't just fail silently)

## 📝 Commit Message Convention

```
<type>(<scope>): <subject>

feat(core): implement LLM judge with Groq/OpenAI/Anthropic support
fix(validator): resolve TypeScript unknown type errors
chore(version): bump all packages to 3.2.0
test(llm-judge): add mock tests for CI pipeline
docs(readme): update LLM judge usage examples
```

**Types:** feat, fix, docs, test, chore, refactor, perf
**Scope:** core, bci, therapy, wearables, build, version

## 🚨 Common Pitfalls to Avoid

### 1. Version Drift
**Problem:** Core is 3.2.0, but wearables still depends on 3.1.1
**Solution:** Always use `version-lockstep.js` script

### 2. Incomplete Implementation
**Problem:** Feature advertised but only has placeholder comments
**Solution:** Finish implementation before documenting or publishing

### 3. Missing Type Assertions
**Problem:** `const data = await response.json()` → `data` is `unknown`
**Solution:** `const data = await response.json() as any`

### 4. Forgotten Exports
**Problem:** Created new module but forgot to export from `index.ts`
**Solution:** Check exports after creating any new file

### 5. Partial Publishing
**Problem:** Published core but forgot to publish dependent packages
**Solution:** Always use `npm run publish:all` at root level

### 6. Breaking Changes Without Major Version
**Problem:** Changed API but only bumped patch version
**Solution:** Follow semantic versioning strictly
- **Patch** (3.1.1 → 3.1.2): Bug fixes only
- **Minor** (3.1.2 → 3.2.0): New features, backward compatible
- **Major** (3.2.0 → 4.0.0): Breaking changes

## 🎯 AI Assistant Guidelines

When implementing features in this codebase:

1. **Always check for existing implementations** before creating new code
2. **Read related documentation** (PUBLISHING.md, MONOREPO.md, CONTRIBUTING.md)
3. **Follow the monorepo structure** - keep domain-specific code in domain packages
4. **Test locally before committing** - don't assume it works
5. **Update ALL affected files** - types, exports, tests, docs
6. **Keep versions synchronized** - use the lockstep script
7. **Build incrementally** - test after each major change
8. **Document as you go** - update README when adding features
9. **Think about users** - error messages should be helpful
10. **Clean up after yourself** - remove debug logs, unused imports

## 🔗 Quick Reference Commands

```bash
# Version Management
node scripts/version-lockstep.js patch    # Bug fixes
node scripts/version-lockstep.js minor    # New features
node scripts/version-lockstep.js major    # Breaking changes
node scripts/version-lockstep.js 3.2.0    # Specific version

# Building
npm run build                              # Build all (root + packages)
cd packages/core && npm run build          # Build core only

# Testing
npm test                                   # Run all tests
node tests/llm-judge-mock.test.js         # Run specific test

# Publishing
npm run publish:all                        # Publish all packages
git tag v3.2.0 && git push --follow-tags  # Tag release

# Development
npm run dev                                # Start docs site
npm run validate:safety                    # Run safety validation
```

## 📚 Required Reading

Before making changes, read:
1. [PUBLISHING.md](../PUBLISHING.md) - Version management & publishing process
2. [MONOREPO.md](../MONOREPO.md) - Package structure & relationships
3. [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
4. [packages/core/README.md](../packages/core/README.md) - Core package API

---

**Remember:** Quality over speed. It's better to implement one feature correctly than to rush and create broken placeholders that need fixing later.

*Last updated: February 17, 2026 (v3.2.0 - LLM Judge Implementation)*
