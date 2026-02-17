#!/usr/bin/env node

/**
 * Pre-Publish Verification Script
 * 
 * Runs all critical checks before publishing to npm
 * Usage: node scripts/pre-publish-check.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running Pre-Publish Verification Checks...\n');

let hasErrors = false;

// Helper to run command and capture output
function run(command, description, options = {}) {
  process.stdout.write(`Checking: ${description}... `);
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    console.log('✅');
    return output;
  } catch (error) {
    console.log('❌');
    if (!options.silent) {
      console.error(`\n  Error: ${error.message}\n`);
    }
    hasErrors = true;
    return null;
  }
}

// Helper to compare versions
function checkVersions() {
  const packagePaths = [
    'package.json',
    'packages/core/package.json',
    'packages/bci/package.json',
    'packages/therapy/package.json',
    'packages/wearables/package.json'
  ];

  const versions = {};
  packagePaths.forEach(pkgPath => {
    const fullPath = path.join(process.cwd(), pkgPath);
    if (fs.existsSync(fullPath)) {
      const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      versions[pkgPath] = pkg.version;
    }
  });

  const uniqueVersions = [...new Set(Object.values(versions))];
  
  if (uniqueVersions.length > 1) {
    console.log('❌ Version Mismatch Detected!');
    console.log('\n  Package versions:');
    Object.entries(versions).forEach(([pkg, ver]) => {
      console.log(`    ${pkg}: ${ver}`);
    });
    console.log('\n  ⚠️  All packages must have the same version!');
    console.log('  Run: node scripts/version-lockstep.js <version>\n');
    hasErrors = true;
    return false;
  } else {
    console.log(`✅ All packages aligned at version ${uniqueVersions[0]}`);
    return true;
  }
}

// Helper to check dependency versions
function checkDependencies() {
  process.stdout.write('Checking: Cross-package dependency versions... ');
  
  const dependentPackages = [
    'packages/bci/package.json',
    'packages/therapy/package.json',
    'packages/wearables/package.json'
  ];

  const corePackage = JSON.parse(fs.readFileSync('packages/core/package.json', 'utf8'));
  const coreVersion = corePackage.version;

  let dependencyIssues = [];

  dependentPackages.forEach(pkgPath => {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    // Check dependencies
    if (pkg.dependencies && pkg.dependencies['@the-governor-hq/constitution-core']) {
      const depVersion = pkg.dependencies['@the-governor-hq/constitution-core'];
      if (depVersion !== coreVersion) {
        dependencyIssues.push(`${pkgPath} dependencies: ${depVersion} (should be ${coreVersion})`);
      }
      if (depVersion.startsWith('^') || depVersion.startsWith('~')) {
        dependencyIssues.push(`${pkgPath} uses range ${depVersion} (should be exact version)`);
      }
    }

    // Check peerDependencies
    if (pkg.peerDependencies && pkg.peerDependencies['@the-governor-hq/constitution-core']) {
      const peerVersion = pkg.peerDependencies['@the-governor-hq/constitution-core'];
      if (peerVersion !== coreVersion) {
        dependencyIssues.push(`${pkgPath} peerDependencies: ${peerVersion} (should be ${coreVersion})`);
      }
    }
  });

  if (dependencyIssues.length > 0) {
    console.log('❌');
    console.log('\n  Dependency version issues found:');
    dependencyIssues.forEach(issue => console.log(`    - ${issue}`));
    console.log('\n  Run: node scripts/version-lockstep.js <version>\n');
    hasErrors = true;
    return false;
  } else {
    console.log('✅');
    return true;
  }
}

// Helper to check for common code issues
function checkCodeQuality() {
  process.stdout.write('Checking: Code quality (no TODOs/placeholders)... ');
  
  const foldersToCheck = [
    'packages/core/src',
    'packages/bci/src',
    'packages/therapy/src',
    'packages/wearables/src'
  ];

  const issues = [];

  foldersToCheck.forEach(folder => {
    if (!fs.existsSync(folder)) return;

    const checkFile = (filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for TODO comments
        if (line.includes('// TODO:') || line.includes('// FIXME:')) {
          issues.push(`${filePath}:${index + 1} - TODO/FIXME comment found`);
        }
        
        // Check for common placeholder patterns
        if (line.includes('would go here') || line.includes('placeholder')) {
          issues.push(`${filePath}:${index + 1} - Placeholder comment found`);
        }

        // Check for debug console.logs (be lenient)
        if (line.includes('console.log') && !line.includes('console.error') && !line.includes('console.warn')) {
          // Only flag if it looks like debug code
          if (line.includes('DEBUG:') || line.includes('TEST:')) {
            issues.push(`${filePath}:${index + 1} - Debug console.log found`);
          }
        }
      });
    };

    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.js')) {
          checkFile(fullPath);
        }
      });
    };

    scanDir(folder);
  });

  if (issues.length > 0) {
    console.log('⚠️');
    console.log('\n  Code quality issues found (warnings):');
    issues.slice(0, 5).forEach(issue => console.log(`    - ${issue}`));
    if (issues.length > 5) {
      console.log(`    ... and ${issues.length - 5} more`);
    }
    console.log('  Note: These are warnings, not blocking errors\n');
    // Don't set hasErrors for these warnings
    return true;
  } else {
    console.log('✅');
    return true;
  }
}

// Main checks
console.log('═'.repeat(60));
console.log('1. VERSION ALIGNMENT');
console.log('═'.repeat(60));
checkVersions();

console.log('\n' + '═'.repeat(60));
console.log('2. DEPENDENCY VERSIONS');
console.log('═'.repeat(60));
checkDependencies();

console.log('\n' + '═'.repeat(60));
console.log('3. BUILD VERIFICATION');
console.log('═'.repeat(60));

// Try to build all packages
['core', 'bci', 'therapy', 'wearables'].forEach(pkg => {
  run(
    `cd packages/${pkg} && npm run build`,
    `Building @the-governor-hq/constitution-${pkg}`,
    { silent: true }
  );
});

console.log('\n' + '═'.repeat(60));
console.log('4. TEST EXECUTION');
console.log('═'.repeat(60));

// Run tests
run('npm test', 'Running all tests', { silent: false });

console.log('\n' + '═'.repeat(60));
console.log('5. CODE QUALITY');
console.log('═'.repeat(60));
checkCodeQuality();

// Final summary
console.log('\n' + '═'.repeat(60));
console.log('SUMMARY');
console.log('═'.repeat(60));

if (hasErrors) {
  console.log('\n❌ Pre-publish checks FAILED');
  console.log('\nPlease fix the errors above before publishing.\n');
  process.exit(1);
} else {
  console.log('\n✅ All pre-publish checks PASSED');
  console.log('\nYou are ready to publish!');
  console.log('\nNext steps:');
  console.log('  1. npm run publish:all');
  console.log('  2. git add .');
  console.log('  3. git commit -m "feat: your description"');
  console.log('  4. git tag vX.Y.Z');
  console.log('  5. git push --follow-tags\n');
  process.exit(0);
}
