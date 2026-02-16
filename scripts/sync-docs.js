#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Sync package documentation to main pages folder
 * This ensures all package-specific docs are included in the main site build
 */

const PACKAGES_DIR = path.join(__dirname, '..', 'packages');
const TARGET_PAGES_DIR = path.join(__dirname, '..', 'pages', 'packages');

// Package names to sync
const PACKAGES = ['wearables', 'bci', 'therapy', 'core'];

/**
 * Recursively copy directory contents
 */
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Clean target directory
 */
function cleanTarget() {
  if (fs.existsSync(TARGET_PAGES_DIR)) {
    fs.rmSync(TARGET_PAGES_DIR, { recursive: true, force: true });
  }
}

/**
 * Main sync function
 */
function syncDocs() {
  console.log('🔄 Syncing package documentation...\n');

  // Clean old synced docs
  cleanTarget();

  // Sync each package
  for (const pkg of PACKAGES) {
    const pkgPagesDir = path.join(PACKAGES_DIR, pkg, 'pages');
    
    // Check if package has a pages directory
    if (!fs.existsSync(pkgPagesDir)) {
      console.log(`⏭️  Skipping ${pkg} (no pages directory)`);
      continue;
    }

    const targetDir = path.join(TARGET_PAGES_DIR, pkg);
    
    try {
      copyDir(pkgPagesDir, targetDir);
      console.log(`✅ Synced ${pkg} docs`);
    } catch (error) {
      console.error(`❌ Error syncing ${pkg}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✨ Documentation sync complete!\n');
}

// Run the sync
syncDocs();
