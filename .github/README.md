# 📚 Governor HQ Development Documentation

This directory contains essential guidelines and templates for developing, testing, and publishing the Governor HQ Constitutional Framework.

## 📄 Files Overview

### [copilot-instructions.md](copilot-instructions.md)
**Primary guide for GitHub Copilot and AI assistants**

Comprehensive instructions covering:
- Build-Test-Version-Publish workflow
- TypeScript best practices
- Testing requirements
- Version management (lockstep)
- Common pitfalls and solutions
- Lessons learned from past implementations

**When to use:** Read this before starting any development work. GitHub Copilot will automatically reference this file.

---

### [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
**Quick reference guide for active development**

Keep this open while coding for instant access to:
- Essential commands
- Common TypeScript error fixes
- Build and test commands
- Version management commands
- Pre-publish checklist
- Debugging tips

**When to use:** Keep open in a second monitor/tab while developing. Quick lookups for commands and checks.

---

### [FEATURE_CHECKLIST_TEMPLATE.md](FEATURE_CHECKLIST_TEMPLATE.md)
**Step-by-step checklist for feature implementation**

Complete checklist with 9 phases:
1. Planning & Research
2. Implementation
3. Build & Fix Errors
4. Testing
5. Documentation
6. Version Management
7. Final Build & Test
8. Publishing
9. Post-Publish Verification

**When to use:** Copy this template for each new feature. Track progress and ensure nothing is missed.

---

## 🚀 Quickstart for New Contributors

1. **Read first:** [copilot-instructions.md](copilot-instructions.md)
2. **Reference while coding:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)  
3. **Track your work:** Copy [FEATURE_CHECKLIST_TEMPLATE.md](FEATURE_CHECKLIST_TEMPLATE.md)

## 🔄 Development Workflow at a Glance

```bash
# 1. Implement feature
# ... write code ...

# 2. Build & fix errors
npm run build

# 3. Test
npm test

# 4. Update versions (all packages together)
node scripts/version-lockstep.js minor  # or patch/major

# 5. Build everything
npm run build

# 6. Publish all packages
npm run publish:all

# 7. Tag and push
git add .
git commit -m "feat: description"
git tag vX.Y.Z
git push --follow-tags
```

## ⚠️ Critical Rules

### 🔒 Lockstep Versioning
ALL packages MUST share the same version number. Use `scripts/version-lockstep.js` to update versions.

### 🚫 No Placeholders in Production
If a feature is documented in README, it MUST be fully implemented. No `// TODO` or placeholder comments in published code.

### ✅ Always Test Before Publishing
Run `npm test` and `npm run build` before every publish. No exceptions.

## 📖 Related Documentation

- [PUBLISHING.md](../PUBLISHING.md) - Detailed publishing process
- [MONOREPO.md](../MONOREPO.md) - Monorepo architecture
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [packages/core/README.md](../packages/core/README.md) - Core package API

## 🆘 Need Help?

1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common issues
2. Read [copilot-instructions.md](copilot-instructions.md) for detailed guidance
3. Review related documentation in the root directory
4. Check `git log` for similar past changes
5. Open a GitHub issue if stuck

## 📝 Template Usage Example

When starting a new feature:

```bash
# 1. Copy the template
cp .github/FEATURE_CHECKLIST_TEMPLATE.md .github/my-feature-checklist.md

# 2. Fill in the header
# Edit my-feature-checklist.md with your feature name, version, etc.

# 3. Work through each phase, checking boxes as you go

# 4. Keep the completed checklist for reference
# (Don't commit individual feature checklists to the repo)
```

## 🎯 Quality Standards

Before marking any task complete:

- [ ] All TypeScript errors resolved
- [ ] All tests passing (both mock and integration)
- [ ] All packages built successfully
- [ ] Version numbers aligned across all packages
- [ ] Documentation updated
- [ ] No placeholder comments in code
- [ ] New features exported from index.ts

---

**Remember:** Quality over speed. It's better to implement one feature correctly than to rush and create broken placeholders.

*Documentation Version: 1.0*
*Last Updated: February 17, 2026*
*For Governor HQ v3.2.0+*
