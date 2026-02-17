#!/usr/bin/env node

/**
 * Lockstep Version Management for Governor HQ Monorepo
 * 
 * Updates ALL package versions together (root + all workspace packages)
 * Usage: node scripts/version-lockstep.js <patch|minor|major|X.Y.Z>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const bumpType = process.argv[2];

if (!bumpType) {
  console.error('Usage: node scripts/version-lockstep.js <patch|minor|major|X.Y.Z>');
  console.error('Example: node scripts/version-lockstep.js patch');
  console.error('Example: node scripts/version-lockstep.js 3.2.0');
  process.exit(1);
}

// Package paths
const packages = [
  'package.json',
  'packages/core/package.json',
  'packages/bci/package.json',
  'packages/therapy/package.json',
  'packages/wearables/package.json'
];

/**
 * Parse semantic version and bump it
 */
function bumpVersion(currentVersion, type) {
  // If type is a specific version (e.g., "3.2.0"), use it directly
  if (/^\d+\.\d+\.\d+$/.test(type)) {
    return type;
  }

  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${type}. Use patch, minor, major, or X.Y.Z`);
  }
}

// Read current version from root package.json
const rootPkgPath = path.join(__dirname, '..', 'package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
const currentVersion = rootPkg.version;

// Calculate new version
const newVersion = bumpVersion(currentVersion, bumpType);

console.log(`\n🔄 Lockstep Version Bump: ${currentVersion} → ${newVersion}\n`);

// Update all packages
packages.forEach(pkgPath => {
  const fullPath = path.join(__dirname, '..', pkgPath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Package not found: ${pkgPath}`);
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const oldVersion = pkg.version;
  
  // Update version
  pkg.version = newVersion;
  
  // Update core dependency references to exact version
  if (pkg.dependencies && pkg.dependencies['@the-governor-hq/constitution-core']) {
    pkg.dependencies['@the-governor-hq/constitution-core'] = newVersion;
  }
  
  if (pkg.peerDependencies && pkg.peerDependencies['@the-governor-hq/constitution-core']) {
    pkg.peerDependencies['@the-governor-hq/constitution-core'] = newVersion;
  }
  
  fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n');
  
  console.log(`✅ ${pkgPath}: ${oldVersion} → ${newVersion}`);
});

console.log(`\n✨ All packages updated to ${newVersion}\n`);
console.log('Next steps:');
console.log('  1. npm run build           # Build all packages');
console.log('  2. npm test                # Test all packages');
console.log('  3. git add .');
console.log(`  4. git commit -m "chore: bump version to ${newVersion}"`);
console.log(`  5. git tag v${newVersion}`);
console.log('  6. npm run publish:all     # Publish all packages');
console.log('  7. git push --follow-tags\n');
