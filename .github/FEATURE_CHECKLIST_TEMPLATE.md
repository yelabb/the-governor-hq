# Feature Implementation Checklist Template

Use this checklist for every new feature or significant change to ensure consistency and quality.

## Feature: [FEATURE NAME]
**Version Target:** [e.g., 3.2.0 → 3.3.0]
**Type:** [ ] Patch  [ ] Minor  [ ] Major
**Date Started:** [YYYY-MM-DD]

---

## ✅ Phase 1: Planning & Research

- [ ] Read relevant documentation (PUBLISHING.md, MONOREPO.md, etc.)
- [ ] Check for existing implementations or similar features
- [ ] Identify which packages are affected (core, bci, therapy, wearables)
- [ ] Review TypeScript types needed
- [ ] Plan testing strategy (mock + integration)

**Notes:**
```
[Your planning notes here]
```

---

## ✅ Phase 2: Implementation

### Core Implementation
- [ ] Create main module file(s) in appropriate package
- [ ] Add TypeScript types and interfaces
- [ ] Implement core functionality
- [ ] Add error handling with graceful fallbacks
- [ ] Add helpful console warnings/errors for users
- [ ] Remove all placeholder comments and TODOs

**Files Created/Modified:**
```
packages/core/src/[module-name].ts          [ ]
packages/core/src/validators/types.ts       [ ]
packages/core/src/index.ts                  [ ]
```

### Integration
- [ ] Integrate with existing systems (e.g., RuntimeValidator)
- [ ] Update configuration interfaces if needed
- [ ] Add feature flags or options for gradual rollout
- [ ] Ensure backward compatibility (or justify breaking change)

### Exports & Types
- [ ] Export new classes/functions from `src/index.ts`
- [ ] Export new types from `src/index.ts`
- [ ] Verify public API is clean and well-documented
- [ ] Update type definitions are generated correctly

---

## ✅ Phase 3: Build & Fix Errors

### TypeScript Compilation
- [ ] Run `npm run build` in packages/core
- [ ] Fix all TypeScript errors
  - [ ] No `unknown` type errors (add `as any` if needed)
  - [ ] No unused variable warnings
  - [ ] No missing property errors
- [ ] Verify dist/ folder generated correctly
- [ ] Check .d.ts files are accurate

### Cross-Package Build
- [ ] Build packages/bci: `cd packages/bci && npm run build`
- [ ] Build packages/therapy: `cd packages/therapy && npm run build`  
- [ ] Build packages/wearables: `cd packages/wearables && npm run build`
- [ ] Build root: `npm run build` (in project root)

**Build Output:**
```
[Paste any errors or warnings here]
```

---

## ✅ Phase 4: Testing

### Mock Tests (No External Dependencies)
- [ ] Create `tests/[feature]-mock.test.js`
- [ ] Test class/function creation
- [ ] Test configuration handling
- [ ] Test error cases and edge cases
- [ ] Verify graceful degradation (missing API keys, etc.)
- [ ] **RUN:** `node tests/[feature]-mock.test.js`

**Mock Test Results:**
```
[Paste test output here]
```

### Integration Tests (With External Dependencies)
- [ ] Create `tests/[feature].test.js`
- [ ] Test with real providers/services (if applicable)
- [ ] Test multiple scenarios (success, failure, edge cases)
- [ ] Document required environment variables
- [ ] **RUN:** `node tests/[feature].test.js` (with env vars set)

**Integration Test Results:**
```
[Paste test output here]
```

### End-to-End Tests
- [ ] Test via npm package commands
- [ ] Test via programmatic API
- [ ] Test via exported functions
- [ ] **RUN:** `npm test` (all tests)

---

## ✅ Phase 5: Documentation

### Code Documentation
- [ ] Add JSDoc comments to all public functions
- [ ] Document parameters with `@param`
- [ ] Document return types with `@returns`
- [ ] Add usage examples in comments

### README Updates
- [ ] Update packages/core/README.md with feature description
- [ ] Add usage examples
- [ ] Document configuration options
- [ ] Add troubleshooting section if needed
- [ ] Update feature list/table of contents

### Documentation Site
- [ ] Create/update .mdx pages if needed
- [ ] Add code examples
- [ ] Add configuration examples
- [ ] Update navigation (_meta.json files)

### Changelog
- [ ] Add entry to packages/core/CHANGELOG.md (if exists)
- [ ] Use format: `## [X.Y.Z] - YYYY-MM-DD`
- [ ] List new features, fixes, breaking changes

---

## ✅ Phase 6: Version Management

### Lockstep Version Bump
- [ ] Decide version type: Patch | Minor | Major
- [ ] **RUN:** `node scripts/version-lockstep.js [type or version]`
- [ ] Verify all package.json files updated:
  - [ ] root package.json
  - [ ] packages/core/package.json
  - [ ] packages/bci/package.json
  - [ ] packages/therapy/package.json
  - [ ] packages/wearables/package.json

### Dependency Verification
- [ ] Check core dependency in packages/bci/package.json
- [ ] Check core dependency in packages/therapy/package.json
- [ ] Check core dependency in packages/wearables/package.json
- [ ] Verify EXACT versions (no `^` prefix)
- [ ] Run `grep -r '"version"' packages/*/package.json` to verify alignment

**Version Alignment Check:**
```
[Paste grep output here to verify all versions match]
```

---

## ✅ Phase 7: Final Build & Test

### Clean Build All Packages
- [ ] **RUN:** `npm run clean` in packages/core
- [ ] **RUN:** `npm run build` in packages/core
- [ ] **RUN:** `npm run clean` in packages/bci
- [ ] **RUN:** `npm run build` in packages/bci
- [ ] **RUN:** `npm run clean` in packages/therapy
- [ ] **RUN:** `npm run build` in packages/therapy
- [ ] **RUN:** `npm run clean` in packages/wearables
- [ ] **RUN:** `npm run build` in packages/wearables

### Final Test Run
- [ ] **RUN:** `npm test` (from root)
- [ ] All tests pass ✅
- [ ] No TypeScript errors ✅
- [ ] No ESLint errors (if applicable) ✅

**Final Test Output:**
```
[Paste final test results here]
```

---

## ✅ Phase 8: Publishing

### Pre-Publish Verification
- [ ] All files committed (check `git status`)
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Version numbers aligned
- [ ] No `console.log` debug statements left in code

### NPM Publishing
- [ ] **RUN:** `npm run publish:all` (from root)
- [ ] Authenticate with npm if prompted
- [ ] Verify all 4 packages published successfully:
  - [ ] @the-governor-hq/constitution-core@X.Y.Z
  - [ ] @the-governor-hq/constitution-bci@X.Y.Z
  - [ ] @the-governor-hq/constitution-therapy@X.Y.Z
  - [ ] @the-governor-hq/constitution-wearables@X.Y.Z

**NPM Publish Output:**
```
[Paste publish confirmation here]
```

### Git Tagging
- [ ] **RUN:** `git add .`
- [ ] **RUN:** `git commit -m "feat: [description]"`
- [ ] **RUN:** `git tag vX.Y.Z`
- [ ] **RUN:** `git push --follow-tags`
- [ ] Verify tag on GitHub

---

## ✅ Phase 9: Post-Publish Verification

### NPM Registry Check
- [ ] Visit https://www.npmjs.com/package/@the-governor-hq/constitution-core
- [ ] Verify new version appears
- [ ] Check all files included in tarball
- [ ] Verify README renders correctly

### Installation Test
- [ ] Create new test directory
- [ ] **RUN:** `npm install @the-governor-hq/constitution-core@X.Y.Z`
- [ ] Test import: `const { RuntimeValidator } = require('@the-governor-hq/constitution-core')`
- [ ] Test new feature works as expected

### GitHub Release
- [ ] Create release on GitHub for vX.Y.Z
- [ ] Add release notes from CHANGELOG
- [ ] Attach any relevant files
- [ ] Mark as pre-release if beta

---

## 📊 Summary

**Feature:** [FEATURE NAME]
**Version:** [X.Y.Z]
**Date Completed:** [YYYY-MM-DD]
**Time Spent:** [X hours]

**Key Changes:**
- [List major changes]
- [List files added]
- [List files modified]

**Known Issues / Future Work:**
- [List any known limitations]
- [List potential improvements]

**Lessons Learned:**
- [What went well?]
- [What could be improved?]
- [Any gotchas to remember?]

---

## 🎉 Completion Checklist

Final verification before marking complete:

- [ ] All phases completed
- [ ] All packages published to npm
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Git tagged and pushed
- [ ] NPM packages verified
- [ ] Team notified (if applicable)

**Status:** [ ] In Progress  [ ] Complete  [ ] Blocked

**Blocked By:** [If blocked, explain why]

---

*Template Version: 1.0 (Last updated: February 17, 2026)*
*Created for Governor HQ v3.2.0+ releases*
