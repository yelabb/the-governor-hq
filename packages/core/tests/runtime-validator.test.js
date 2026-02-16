#!/usr/bin/env node

/**
 * Runtime Validator Tests
 * Tests the hard post-generation gate: LLM → Validator → Output
 */

const { 
  createValidator, 
  validateText,
  runPatternChecks 
} = require('../dist/validators/runtime-validator');

const { 
  checkForbiddenPatterns,
  checkPrescriptiveLanguage,
  checkMedicalKeywords 
} = require('../dist/validators/pattern-matcher');

const { 
  generateSafeAlternative 
} = require('../dist/validators/sanitizer');

console.log('\n🧪 Testing Runtime Validator...\n');

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
// Test 1: Pattern Matching
// ============================================================================

test('checkForbiddenPatterns detects medical claims', () => {
  const text = 'You have sleep apnea. Take magnesium.';
  const matches = checkForbiddenPatterns(text);
  if (matches.length === 0) throw new Error('Expected violations, got none');
});

test('checkPrescriptiveLanguage detects commanding language', () => {
  const text = 'You must rest. You should exercise.';
  const matches = checkPrescriptiveLanguage(text);
  if (matches.length === 0) throw new Error('Expected violations, got none');
});

test('checkMedicalKeywords detects medical terms', () => {
  const text = 'This diagnosis requires clinical treatment.';
  const matches = checkMedicalKeywords(text);
  if (matches.length === 0) throw new Error('Expected violations, got none');
});

test('Safe content passes pattern checks', () => {
  const text = 'Your HRV is lower than your baseline. Consider discussing with a healthcare professional.';
  const forbidden = checkForbiddenPatterns(text);
  const prescriptive = checkPrescriptiveLanguage(text);
  if (forbidden.length > 0 || prescriptive.length > 0) {
    throw new Error('Safe content was flagged as unsafe');
  }
});

// ============================================================================
// Test 2: Validator Creation
// ============================================================================

test('createValidator returns validator instance', () => {
  const validator = createValidator({ domain: 'wearables' });
  if (!validator) throw new Error('Validator not created');
  if (typeof validator.validateSync !== 'function') {
    throw new Error('Validator missing validateSync method');
  }
});

test('createValidator accepts configuration', () => {
  const validator = createValidator({
    domain: 'therapy',
    onViolation: 'block',
    strictMode: true
  });
  const config = validator.getConfig();
  if (config.domain !== 'therapy') throw new Error('Domain not set correctly');
  if (config.onViolation !== 'block') throw new Error('onViolation not set correctly');
});

// ============================================================================
// Test 3: Validation - Unsafe Content
// ============================================================================

test('Validator blocks medical claims', () => {
  const validator = createValidator({ domain: 'wearables', onViolation: 'block' });
  const result = validator.validateSync('You have insomnia. Take melatonin.');
  
  if (result.safe) throw new Error('Expected unsafe, got safe');
  if (result.violations.length === 0) throw new Error('Expected violations');
  if (!result.safeAlternative) throw new Error('Expected safe alternative');
});

test('Validator blocks supplement recommendations', () => {
  const validator = createValidator({ domain: 'wearables', onViolation: 'block' });
  const result = validator.validateSync('Take 5mg of magnesium before bed.');
  
  if (result.safe) throw new Error('Expected unsafe, got safe');
  if (result.violations.length === 0) throw new Error('Expected violations');
});

test('Validator blocks prescriptive language', () => {
  const validator = createValidator({ domain: 'core', onViolation: 'block' });
  const result = validator.validateSync('You must see a doctor immediately.');
  
  if (result.safe) throw new Error('Expected unsafe, got safe');
  if (result.violations.length === 0) throw new Error('Expected violations');
});

// ============================================================================
// Test 4: Validation - Safe Content
// ============================================================================

test('Validator allows safe suggestive language', () => {
  const validator = createValidator({ domain: 'wearables' });
  const result = validator.validateSync('Consider tracking your sleep patterns.');
  
  if (!result.safe) throw new Error('Expected safe, got unsafe');
  if (result.violations.length > 0) throw new Error('Unexpected violations');
});

test('Validator allows baseline comparisons', () => {
  const validator = createValidator({ domain: 'wearables' });
  const result = validator.validateSync('Your HRV is 20% lower than your personal baseline.');
  
  if (!result.safe) throw new Error('Expected safe, got unsafe');
});

test('Validator allows healthcare professional references', () => {
  const validator = createValidator({ domain: 'therapy' });
  const result = validator.validateSync('You might want to discuss this with a mental health professional.');
  
  if (!result.safe) throw new Error('Expected safe, got unsafe');
});

// ============================================================================
// Test 5: Violation Actions
// ============================================================================

test('Block mode returns blocked message', () => {
  const validator = createValidator({ domain: 'wearables', onViolation: 'block' });
  const result = validator.validateSync('You have sleep apnea.');
  
  if (!result.output.includes('blocked')) {
    throw new Error('Expected blocked message in output');
  }
});

test('Sanitize mode attempts to fix content', () => {
  const validator = createValidator({ domain: 'wearables', onViolation: 'sanitize' });
  const result = validator.validateSync('You should exercise more.');
  
  // Should attempt to replace "should" with "could"
  if (result.output === 'You should exercise more.') {
    throw new Error('Expected sanitized output');
  }
});

test('Warn mode allows content but logs', () => {
  const validator = createValidator({ domain: 'wearables', onViolation: 'warn' });
  const result = validator.validateSync('You have insomnia.');
  
  // Warn mode doesn't block, just warns
  if (result.output !== 'You have insomnia.') {
    throw new Error('Warn mode should allow original content');
  }
});

// ============================================================================
// Test 6: Custom Rules
// ============================================================================

test('Custom rules are executed', () => {
  const validator = createValidator({
    domain: 'wearables',
    customRules: [
      {
        id: 'no-xyz',
        description: 'Block XYZ',
        severity: 'high',
        check: (text) => text.includes('XYZ'),
        violation: 'XYZ detected'
      }
    ]
  });
  
  const result = validator.validateSync('This contains XYZ content.');
  if (result.safe) throw new Error('Custom rule should have caught violation');
  if (!result.violations.some(v => v.rule === 'no-xyz')) {
    throw new Error('Custom rule violation not found');
  }
});

// ============================================================================
// Test 7: Metadata
// ============================================================================

test('Validation result includes metadata', () => {
  const validator = createValidator({ domain: 'wearables' });
  const result = validator.validateSync('Test message.');
  
  if (!result.metadata) throw new Error('Missing metadata');
  if (typeof result.metadata.latencyMs !== 'number') throw new Error('Missing latencyMs');
  if (typeof result.metadata.rulesChecked !== 'number') throw new Error('Missing rulesChecked');
  if (result.metadata.domain !== 'wearables') throw new Error('Wrong domain in metadata');
});

test('Validation is fast (<100ms)', () => {
  const validator = createValidator({ domain: 'wearables' });
  const result = validator.validateSync('Your sleep quality is lower than usual.');
  
  if (result.metadata.latencyMs > 100) {
    throw new Error(`Validation too slow: ${result.metadata.latencyMs}ms`);
  }
});

// ============================================================================
// Test 8: Sanitizer
// ============================================================================

test('generateSafeAlternative creates safe message', () => {
  const patterns = {
    forbidden: ['diagnose', 'treatment'],
    required: [],
    prescriptive: [],
    medical: ['medical']
  };
  
  const safe = generateSafeAlternative('', patterns, 'wearables');
  if (!safe) throw new Error('No safe alternative generated');
  if (safe.length < 10) throw new Error('Safe alternative too short');
});

// ============================================================================
// Test 9: Domain-Specific Validation
// ============================================================================

test('Wearables domain validation works', () => {
  const validator = createValidator({ domain: 'wearables' });
  const unsafe = validator.validateSync('Your heart rate indicates disease.');
  const safe = validator.validateSync('Your heart rate is elevated compared to your baseline.');
  
  if (unsafe.safe) throw new Error('Wearables should block disease mention');
  if (!safe.safe) throw new Error('Wearables should allow baseline comparison');
});

test('Therapy domain validation works', () => {
  const validator = createValidator({ domain: 'therapy' });
  const unsafe = validator.validateSync('You have clinical depression.');
  const safe = validator.validateSync('Your mood patterns show variation.');
  
  if (unsafe.safe) throw new Error('Therapy should block diagnosis');
  if (!safe.safe) throw new Error('Therapy should allow pattern observation');
});

test('BCI domain validation works', () => {
  const validator = createValidator({ domain: 'bci' });
  const unsafe = validator.validateSync('This brain activity indicates a neurological condition.');
  const safe = validator.validateSync('This brain activity pattern differs from your baseline.');
  
  if (unsafe.safe) throw new Error('BCI should block medical claims');
  if (!safe.safe) throw new Error('BCI should allow pattern observation');
});

// ============================================================================
// Test 10: Edge Cases
// ============================================================================

test('Empty string validation', () => {
  const validator = createValidator({ domain: 'core' });
  const result = validator.validateSync('');
  if (!result.safe) throw new Error('Empty string should be safe');
});

test('Very long text validation', () => {
  const validator = createValidator({ domain: 'wearables' });
  const longText = 'Your data shows normal variation. '.repeat(100);
  const result = validator.validateSync(longText);
  if (!result.safe) throw new Error('Long safe text should pass');
});

test('Mixed safe and unsafe content', () => {
  const validator = createValidator({ domain: 'wearables' });
  const result = validator.validateSync('Your HRV is lower. You have heart disease.');
  
  if (result.safe) throw new Error('Mixed content with violations should fail');
  if (result.violations.length === 0) throw new Error('Should detect violations in mixed content');
});

// ============================================================================
// Results
// ============================================================================

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Tests: ${passed} passed, ${failed} failed`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

process.exit(failed > 0 ? 1 : 0);
