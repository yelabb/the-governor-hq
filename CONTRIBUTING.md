# Contributing to Governor HQ Constitutional Framework

Thank you for your interest in contributing! This framework protects users and developers by enforcing safety constraints in AI-generated health code.

## 🎯 Contribution Focus Areas

We welcome contributions in these areas:

### 1. **Test Coverage**
- Additional MCP server tests
- Integration tests with AI assistants
- Language validation test cases
- End-to-end workflow tests

### 2. **Language Validation Patterns**
- New forbidden phrase patterns
- Safe alternative suggestions
- Real-world examples of violations
- Language rule refinements

### 3. **Documentation**
- Clarity improvements
- Additional code examples
- Integration guides for new AI tools
- Translation to other languages

### 4. **Real-World Examples**
- Before/after code comparisons
- Case studies from actual projects
- Common pitfall demonstrations
- Best practice patterns

## 🚫 Non-Negotiable Rules

The **5 hard rules** are absolute and cannot be modified:

1. ❌ No medical claims, diagnoses, or treatment advice
2. ❌ No supplements, vitamins, or dosage recommendations
3. ❌ No disease names or medical condition mentions
4. ❌ No treatment language (cure, prevent, treat, heal)
5. ❌ No commanding language (must, should, need to)

**Do not submit PRs that weaken these constraints.**

## 📋 Before Contributing

### 1. Check Existing Issues
- Search [open issues](https://github.com/yelabb/the-governor-hq/issues) to avoid duplicates
- Comment on issues you'd like to work on
- Wait for maintainer approval before starting work

### 2. Read the Documentation
- Review [Hard Rules](/pages/constraints/hard-rules.mdx)
- Understand [Language Rules](/pages/constraints/language-rules.mdx)
- Check [What We Don't Do](/pages/what-we-dont-do.mdx)

### 3. Run Tests
```bash
npm test
```

All 17 tests must pass before submitting.

## 🔧 Development Workflow

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/the-governor-hq.git
cd the-governor-hq/docs
npm install
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `fix/typo-in-language-rules`
- `feature/add-fitness-agent-docs`
- `test/mcp-protocol-compliance`

### 3. Make Changes

- Write clear, concise documentation
- Follow existing formatting conventions
- Add tests for new functionality
- Update relevant documentation

### 4. Test Locally

```bash
# Run tests
npm test

# Run documentation site
npm run dev

# Test MCP server
npm run ai:context
```

### 5. Commit with Clear Messages

```bash
git commit -m "feat: add validation tests for language rules"
```

Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## ✅ Pull Request Guidelines

### PR Title Format
Use conventional commit format:
- `feat: add stress monitoring examples`
- `fix: correct typo in baseline documentation`
- `test: add MCP resource validation tests`

### PR Description Should Include

```markdown
## What
Brief description of the change

## Why
Explanation of the motivation/reasoning

## How
Technical approach taken

## Testing
How you tested the changes

## Checklist
- [ ] Tests added/updated
- [ ] Docs updated
- [ ] All tests passing (`npm test`)
- [ ] Follows existing conventions
- [ ] Does not weaken hard rules
```

## 🧪 Testing Requirements

All contributions must include tests when applicable:

### For New Features
- Unit tests for functionality
- Integration tests if appropriate
- Documentation examples

### For Bug Fixes
- Test that reproduces the bug
- Verification the fix resolves it

### For Documentation
- Verify examples work as written
- Check links are valid
- Ensure formatting is correct

## 📝 Documentation Standards

### Markdown Format
- Use clear headings hierarchy
- Include code examples with syntax highlighting
- Add tables for structured comparisons
- Use callouts for important notes

### Code Examples
Always show **both unsafe and safe** versions:

```typescript
// ❌ UNSAFE - Medical claim
if (hrv < 50) {
  alert("Low HRV may indicate illness");
}

// ✅ SAFE - Personal baseline, optional framing
if (hrv < personalBaseline - 2*stdDev) {
  notify("Your HRV is lower than usual. Consider lighter activity if you feel off.");
}
```

### Writing Tone
- Clear and direct
- Technical but accessible
- Safety-focused
- No marketing fluff

## 🐛 Reporting Issues

### Bug Reports

Include:
- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)

### Feature Requests

Include:
- Use case description
- Why it's needed
- How it aligns with safety constraints
- Proposed implementation (if any)

### Security Issues

**Do not open public issues for security vulnerabilities.**

Email security concerns to: [security contact - add email]

## 🔍 Code Review Process

Maintainers will review PRs for:

1. **Safety Compliance** — Does not weaken constraints
2. **Test Coverage** — Adequate tests included
3. **Code Quality** — Clear, maintainable, idiomatic
4. **Documentation** — Changes are documented
5. **Breaking Changes** — Properly communicated

## ⏱️ Response Times

- Initial PR review: Within 3-5 business days
- Follow-up on comments: Within 2-3 business days
- Issue triage: Within 1 week

*These are goals, not guarantees. We're a small team.*

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be:
- Listed in release notes
- Acknowledged in documentation
- Added to CONTRIBUTORS.md (coming soon)

## ❓ Questions?

- 💬 [GitHub Discussions](https://github.com/yelabb/the-governor-hq/discussions)
- 🐛 [Issue Tracker](https://github.com/yelabb/the-governor-hq/issues)

---

## 🎯 Priority Contributions

These are especially valuable right now:

1. **Integration guides** for additional AI tools (Windsurf, Zed, etc.)
2. **Language validation patterns** from real-world violations
3. **Test coverage** for edge cases
4. **Real-world case studies** demonstrating framework effectiveness
5. **Translations** to other languages

---

Thank you for helping make AI-assisted health code development safer for everyone! 🛡️
