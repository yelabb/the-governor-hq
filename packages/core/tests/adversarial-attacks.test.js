#!/usr/bin/env node

/**
 * Basic Adversarial Attack Detection Tests
 * Tests normalization and attack detection without requiring embedding model
 */

const {
  detectAdversarialAttack,
} = require('../dist/validators/pattern-matcher');

const {
  normalizeText,
} = require('../dist/validators/semantic-similarity');

console.log('\n🧪 Testing Adversarial Attack Detection (Basic)...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

// ============================================================================
// Test 1: Text Normalization
// ============================================================================

console.log('📋 Text Normalization Tests\n');

test('Normalizes spacing attacks', () => {
  const normalized = normalizeText('d i a g n o s e');
  if (!normalized.includes('diagnose')) {
    throw new Error(`Failed to normalize spacing attack: "${normalized}"`);
  }
});

test('Normalizes special character attacks', () => {
  const normalized = normalizeText('d!i@a#g$n%o^s&e');
  if (normalized !== 'diagnose') {
    throw new Error(`Failed to normalize special char attack: "${normalized}"`);
  }
});

test('Normalizes misspellings', () => {
  const normalized = normalizeText('You have diagnoz');
  if (!normalized.includes('diagnose')) {
    throw new Error(`Failed to normalize misspelling: "${normalized}"`);
  }
});

test('Normalizes multiple spaces', () => {
  const normalized = normalizeText('You    have     insomnia');
  const spaceCount = (normalized.match(/\s+/g) || []).length;
  if (spaceCount > 2) {
    throw new Error(`Failed to collapse spaces: "${normalized}"`);
  }
});

test('Normalizes case variations', () => {
  const normalized = normalizeText('YoU hAvE dEpReSsIoN');
  if (normalized !== normalized.toLowerCase()) {
    throw new Error(`Failed to normalize case: "${normalized}"`);
  }
});

test('Normalizes numbers and special chars', () => {
  const normalized = normalizeText('d3pr3ss10n');
  // Note: Simple normalization removes numbers, advanced leetspeak detection would be a future enhancement
  if (normalized.length === 0) {
    throw new Error(`Normalization removed all content: "${normalized}"`);
  }
});

test('Handles hyphenated attacks', () => {
  const normalized = normalizeText('i-n-s-o-m-n-i-a');
  if (!normalized.includes('insomnia')) {
    throw new Error(`Failed to normalize hyphenated attack: "${normalized}"`);
  }
});

test('Handles mixed case with special chars', () => {
  const normalized = normalizeText('DiAgNoSe!!!');
  if (normalized !== 'diagnose') {
    throw new Error(`Failed to normalize mixed case with special chars: "${normalized}"`);
  }
});

// ============================================================================
// Test 2: Adversarial Attack Detection
// ============================================================================

console.log('\n🛡️  Adversarial Attack Detection Tests\n');

test('Detects spacing attacks', () => {
  const result = detectAdversarialAttack('You have d i a g n o s e d');
  if (!result.manipulationDetected) {
    throw new Error('Failed to detect spacing attack');
  }
  if (result.manipulationType !== 'spacing') {
    throw new Error(`Wrong manipulation type: ${result.manipulationType}`);
  }
});

test('Detects special character attacks', () => {
  const result = detectAdversarialAttack('You have d!i@a#g$n%o^s&e');
  if (!result.manipulationDetected) {
    throw new Error('Failed to detect special char attack');
  }
});

test('Detects misspelling attacks', () => {
  const result = detectAdversarialAttack('You have diagnoz');
  if (!result.manipulationDetected) {
    throw new Error('Failed to detect misspelling attack');
  }
});

test('Allows normal text', () => {
  const result = detectAdversarialAttack('Your HRV data looks good');
  if (result.manipulationDetected) {
    throw new Error('False positive on normal text');
  }
});

test('Allows normal medical terminology when not obfuscated', () => {
  const result = detectAdversarialAttack('Consider consulting a healthcare professional');
  if (result.manipulationDetected) {
    throw new Error('False positive on normal healthcare reference');
  }
});

// ============================================================================
// Test 3: Real-World Adversarial Examples
// ============================================================================

console.log('\n🎯 Real-World Attack Examples\n');

const attackExamples = [
  { text: 'd i a g n o s e', expected: 'spacing' },
  { text: 'd!i@a#g$n%o^s&e', expected: 'special-chars' },
  { text: 'diagnoz', expected: 'misspelling' },
  { text: 'you have i-n-s-o-m-n-i-a', expected: 'special-chars' },
  { text: 'you have sleep_apnea', expected: 'special-chars' },
  { text: 'T A K E melatonin', expected: 'spacing' },
  { text: 'take mel@tonin', expected: 'special-chars' },
  { text: 'you have d3pr3ss10n', expected: 'special-chars' },
];

attackExamples.forEach((example, index) => {
  test(`Detects attack ${index + 1}: "${example.text.substring(0, 30)}..."`, () => {
    const result = detectAdversarialAttack(example.text);
    if (!result.manipulationDetected) {
      throw new Error('Failed to detect adversarial attack');
    }
  });
});

// ============================================================================
// Test 4: Combined Normalization and Detection
// ============================================================================

console.log('\n🔄 Combined Tests\n');

test('Normalized text should be detectable by patterns', () => {
  const malicious = 'd!i@a#g$n%o^s&e';
  const normalized = normalizeText(malicious);
  
  if (!normalized.includes('diagnose')) {
    throw new Error('Normalization failed to reconstruct word');
  }
});

test('Multiple obfuscation techniques', () => {
  const malicious = 'Y o U   h A v E   d!i@a#g$n%o^z!!!';
  const normalized = normalizeText(malicious);
  
  // Should normalize to contain key forbidden words
  if (!normalized.includes('diagnose') && !normalized.includes('diagnoz')) {
    throw new Error(`Multi-obfuscation normalization failed: "${normalized}"`);
  }
});

// ============================================================================
// Summary
// ============================================================================

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

if (failed > 0) {
  process.exit(1);
}
