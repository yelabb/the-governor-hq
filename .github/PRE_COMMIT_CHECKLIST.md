# ⚡ 30-Second Pre-Commit Checklist

**Run these checks before EVERY commit. Takes 30 seconds, saves hours of debugging.**

---

## ✅ The Essentials (Must Pass All)

```bash
# 1️⃣ Build succeeds?
npm run build
# ✅ Should complete without errors

# 2️⃣ Tests pass?
npm test
# ✅ Should show all tests passing

# 3️⃣ Versions aligned?
grep '"version"' packages/*/package.json
# ✅ All should show SAME version number

# 4️⃣ No uncommitted changes?
git status
# ✅ Should be clean or show only intended changes
```

---

## 🎯 Quick Visual Check

Look for these patterns in your code:

### ❌ BAD - Don't Commit These:
```typescript
// TODO: implement this later
// LLM judge would go here
const data = await response.json();  // ← 'data' is type 'unknown'
let unusedVariable;  // ← declared but never read
console.log(secretKey);  // ← debug code left in
```

### ✅ GOOD - This is OK:
```typescript
// Fully implemented functions
const data = await response.json() as any;  // ← type assertion
const result = someFunction();  // ← actually used
// No debug console.logs
```

---

## 📦 Package.json Checks

```bash
# Each package should have EXACT same version
cat package.json | grep version
cat packages/core/package.json | grep version
cat packages/bci/package.json | grep version
cat packages/therapy/package.json | grep version
cat packages/wearables/package.json | grep version

# Cross-package dependencies should be EXACT (no ^)
grep '@the-governor-hq/constitution-core' packages/*/package.json
# Should show: "3.2.0" NOT "^3.2.0"
```

---

## 🚨 Critical Pre-Publish Checks

**Before running `npm run publish:all`:**

- [ ] `npm run build` ← Succeeds
- [ ] `npm test` ← All pass
- [ ] Versions aligned ← All match
- [ ] No TypeScript errors ← tsc clean
- [ ] Docs updated ← README reflects features
- [ ] Exports added ← New modules in index.ts
- [ ] Tests exist ← Both mock and integration
- [ ] No placeholders ← No TODO comments

**If ANY check fails → FIX IT before publishing**

---

## 💾 Commit Message Format

```bash
# Use this format:
git commit -m "type(scope): description"

# Examples:
git commit -m "feat(core): implement LLM judge with multi-provider support"
git commit -m "fix(validator): resolve TypeScript unknown type errors"
git commit -m "docs(readme): add LLM judge usage examples"
git commit -m "test(llm): add mock tests for CI pipeline"
git commit -m "chore(version): bump all packages to 3.2.0"
```

**Types:** feat, fix, docs, test, chore, refactor, perf
**Scopes:** core, bci, therapy, wearables, build, version

---

## 🏷️ Tagging Releases

```bash
# After publishing:
git tag v3.2.0
git push --follow-tags

# Verify tag exists:
git tag -l "v3.2.*"
```

---

## ⏱️ Time-Saving Shortcuts

### One-Command Check
```bash
npm test && npm run build && grep '"version"' packages/*/package.json
```
All green? ✅ Ready to commit.

### One-Command Publish Flow
```bash
node scripts/version-lockstep.js minor && \
npm run build && \
npm run publish:all
```
Then tag and push.

---

## 🔥 Emergency Rollback

Published something broken?

```bash
# Unpublish within 72 hours:
npm unpublish @the-governor-hq/constitution-core@3.2.0

# Or deprecate:
npm deprecate @the-governor-hq/constitution-core@3.2.0 "Use version 3.2.1 instead"

# Then fix and republish:
node scripts/version-lockstep.js patch
npm run build
npm run publish:all
```

---

## 📱 Keep This Handy

**Print this page or bookmark it.**

Most common mistakes:
1. ❌ Forgot to bump version
2. ❌ Forgot to build before publish
3. ❌ Versions not aligned
4. ❌ TypeScript errors not fixed
5. ❌ Tests not passing

**30 seconds of checking saves hours of debugging.**

---

*Checklist Version: 1.0*
*Last Updated: February 17, 2026*
