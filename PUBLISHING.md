# Publishing the Governor HQ Constitutional Framework to NPM

## Prerequisites

1. NPM account: https://www.npmjs.com/signup
2. Organization (optional): Create `@governor-hq` org on npm
3. Git repository configured in package.json
4. All files ready for publishing

## Pre-Publish Checklist

- [ ] Update version in `package.json`
- [ ] Test installation locally
- [ ] Verify all files are included (check `.npmignore`)
- [ ] Test MCP server works
- [ ] Test install script works
- [ ] Documentation is complete
- [ ] LICENSE file exists
- [ ] README.md is npm-ready (consider using NPM-README.md)

## Local Testing

```bash
# 1. Create a test project
mkdir test-governor-install
cd test-governor-install
npm init -y

# 2. Link your local package
cd ../docs
npm link

cd ../test-governor-install
npm link @governor-hq/constitution

# 3. Test the installation
ls -la .cursorrules
cat .vscode/settings.json
npm run ai:context

# 4. Unlink when done
npm unlink @governor-hq/constitution
cd ../docs
npm unlink
```

## Publishing Steps

### 1. Login to NPM

```bash
npm login
# Enter username, password, email, and 2FA if enabled
```

### 2. Verify Package Contents

```bash
# See what will be published
npm pack --dry-run

# This should show:
# - pages/ directory
# - mcp-server.js
# - mcp-config.json
# - install.js
# - .cursorrules
# - index.d.ts
# - README.md (or NPM-README.md renamed)
# - LICENSE
```

### 3. Version Bump

```bash
# For first release
npm version 1.0.0

# For future releases
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.1 -> 1.1.0
npm version major  # 1.1.0 -> 2.0.0
```

### 4. Publish to NPM

#### For Public Package (Free)

```bash
npm publish --access public
```

#### For Scoped Package (@governor-hq/constitution)

```bash
# First time (must specify public access)
npm publish --access public

# Subsequent publishes
npm publish
```

### 5. Verify Publication

```bash
# Check it's live
npm view @governor-hq/constitution

# Test installation in a new project
mkdir test-install
cd test-install
npm init -y
npm install --save-dev @governor-hq/constitution

# Verify files were created
ls -la .cursorrules .mcp-config.json
```

## Post-Publish

### 1. Tag the Release on GitHub

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. Create GitHub Release

- Go to GitHub repository
- Releases → Draft a new release
- Choose tag v1.0.0
- Title: "v1.0.0 - Initial Release"
- Description: Copy from CHANGELOG or write release notes

### 3. Update Documentation

- Add npm badge to README
- Update installation instructions if needed
- Announce on social media / community

### 4. Test End-to-End

Create a brand new project and follow the README:

```bash
mkdir fresh-test
cd fresh-test
npm init -y
npm install --save-dev @governor-hq/constitution

# Should auto-configure everything
ls -la .cursorrules
cat package.json  # Check for ai:context script
npm run ai:context  # Test MCP server
```

## Updating the Package

### For Bug Fixes

```bash
# Make fixes
git add .
git commit -m "fix: correct install script path"

# Bump patch version
npm version patch

# Publish
npm publish

# Push to git
git push --follow-tags
```

### For New Features

```bash
# Add feature
git add .
git commit -m "feat: add TypeScript utilities"

# Bump minor version
npm version minor

# Publish
npm publish

# Push to git
git push --follow-tags
```

## Troubleshooting

### "401 Unauthorized"

```bash
npm login
npm whoami  # Verify you're logged in
```

### "403 Forbidden"

- Check if package name is already taken
- For scoped packages, need access to the org
- Use `npm org ls @governor-hq` to check membership

### "Files not included in package"

```bash
# Check .npmignore
cat .npmignore

# Test what gets included
npm pack --dry-run

# Verify 'files' field in package.json
```

### "postinstall script fails"

```bash
# Test locally first
node install.js

# Check file paths are relative to package root
# Check Node.js compatibility (>=16.0.0)
```

## Maintenance

### Regular Updates

1. **Security audits**: `npm audit` monthly
2. **Dependency updates**: Keep Nextra/Next.js current
3. **Documentation updates**: As constraints evolve
4. **Community feedback**: Monitor GitHub issues

### Deprecating Old Versions

```bash
# Deprecate a version
npm deprecate @governor-hq/constitution@1.0.0 "Security vulnerability, upgrade to 1.0.1"

# Unpublish (only within 72h of publish)
npm unpublish @governor-hq/constitution@1.0.0
```

## Best Practices

1. **Semantic Versioning**: Follow semver strictly
2. **CHANGELOG**: Maintain CHANGELOG.md
3. **Breaking Changes**: Always major version bump
4. **Testing**: Test in clean environment before publish
5. **Communication**: Announce breaking changes in advance

## NPM Scripts for Automation

Add to `package.json`:

```json
{
  "scripts": {
    "prepublishOnly": "npm test && npm run build",
    "preversion": "npm test",
    "version": "git add .",
    "postversion": "git push && git push --tags",
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish"
  }
}
```

Usage:

```bash
npm run release:patch  # All-in-one: test, version, publish, push
```

## First Publish Checklist

Final check before `npm publish --access public`:

- [ ] Package name is available: `npm view @governor-hq/constitution`
- [ ] All tests pass: `npm test`
- [ ] Install script works: `node install.js`
- [ ] MCP server works: `node mcp-server.js`
- [ ] TypeScript definitions valid: `tsc --noEmit index.d.ts`
- [ ] README is clear and accurate
- [ ] LICENSE file present
- [ ] Version is 1.0.0
- [ ] Logged into npm: `npm whoami`

**Ready to publish?**

```bash
npm publish --access public
```

🎉 **Package published!** 

Next: Test installation, create GitHub release, announce to community.
