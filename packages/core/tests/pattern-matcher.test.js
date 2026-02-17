#!/usr/bin/env node

/**
 * Pattern Matcher Tests
 * Tests fast regex and keyword validation (<10ms)
 */

const {
  checkForbiddenPatterns,
  checkPrescriptiveLanguage,
  checkMedicalKeywords,
  checkSuggestivePatterns,
  checkAlarmingPatterns,
  runPatternChecks,
  patternsToViolations,
  calculatePatternConfidence,
} = require('../dist/validators/pattern-matcher');

console.log('\n🧪 Testing Pattern Matcher...\n');

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
// Test 1: Forbidden Patterns - Medical Diagnoses
// ============================================================================

test('Detects "you have" diagnosis language', () => {
  const matches = checkForbiddenPatterns('You have insomnia.');
  if (matches.length === 0) {
    throw new Error('Failed to detect "you have" diagnosis');
  }
});

test('Detects "you may have" diagnosis language', () => {
  const matches = checkForbiddenPatterns('You may have sleep apnea.');
  if (matches.length === 0) {
    throw new Error('Failed to detect "you may have" diagnosis');
  }
});

test('Detects "diagnose" variations', () => {
  const texts = [
    'This could diagnose a condition.',
    'You are diagnosed with a disorder.',
    'The diagnosis shows problems.',
  ];
  
  for (const text of texts) {
    const matches = checkForbiddenPatterns(text);
    if (matches.length === 0) {
      throw new Error(`Failed to detect diagnosis in: "${text}"`);
    }
  }
});

// ============================================================================
// Test 2: Forbidden Patterns - Disease Names
// ============================================================================

test('Detects disease names', () => {
  const diseases = [
    'insomnia',
    'depression',
    'anxiety disorder',
    'sleep apnea',
    'cardiovascular disease',
    'diabetes',
    'hypertension',
  ];
  
  for (const disease of diseases) {
    const matches = checkForbiddenPatterns(`Your data suggests ${disease}.`);
    if (matches.length === 0) {
      throw new Error(`Failed to detect disease: ${disease}`);
    }
  }
});

test('Case-insensitive disease detection', () => {
  const texts = [
    'INSOMNIA', 
    'InsoMNIA', 
    'insomnia',
    'DEPRESSION',
  ];
  
  for (const text of texts) {
    const matches = checkForbiddenPatterns(text);
    if (matches.length === 0) {
      throw new Error(`Case-insensitive match failed for: ${text}`);
    }
  }
});

// ============================================================================
// Test 3: Forbidden Patterns - Treatment Language
// ============================================================================

test('Detects "cure" and variations', () => {
  const texts = [
    'This will cure your problem.',
    'Cures are available.',
    'It was cured.',
    'Curing this requires...',
  ];
  
  for (const text of texts) {
    const matches = checkForbiddenPatterns(text);
    if (matches.length === 0) {
      throw new Error(`Failed to detect "cure" in: "${text}"`);
    }
  }
});

test('Detects "treat" and variations', () => {
  const texts = [
    'This treats the condition.',
    'Treatment is needed.',
    'You need to treat this.',
  ];
  
  for (const text of texts) {
    const matches = checkForbiddenPatterns(text);
    if (matches.length === 0) {
      throw new Error(`Failed to detect "treat" in: "${text}"`);
    }
  }
});

test('Detects "prevent" and heal" language', () => {
  const matches1 = checkForbiddenPatterns('This prevents the condition.');
  const matches2 = checkForbiddenPatterns('It will heal over time.');
  
  if (matches1.length === 0 || matches2.length === 0) {
    throw new Error('Failed to detect prevent/heal language');
  }
});

// ============================================================================
// Test 4: Forbidden Patterns - Supplements & Medications
// ============================================================================

test('Detects supplement recommendations', () => {
  const texts = [
    'Take melatonin before bed.',
    'You need magnesium supplements.',
    'Try taking vitamin D.',
    'Dosage should be 5mg.',
  ];
  
  for (const text of texts) {
    const matches = checkForbiddenPatterns(text);
    if (matches.length === 0) {
      throw new Error(`Failed to detect supplement in: "${text}"`);
    }
  }
});

test('Detects dosage language', () => {
  const texts = [
    '5mg daily',
    '500 milligrams',
    'Increase dosage to 10mg',
  ];
  
  for (const text of texts) {
    const matches = checkForbiddenPatterns(text);
    if (matches.length === 0) {
      throw new Error(`Failed to detect dosage language: "${text}"`);
    }
  }
});

test('Detects medication language', () => {
  const matches1 = checkForbiddenPatterns('Take this medication.');
  const matches2 = checkForbiddenPatterns('Get a prescription.');
  
  if (matches1.length === 0 || matches2.length === 0) {
    throw new Error('Failed to detect medication language');
  }
});

// ============================================================================
// Test 5: Prescriptive Language
// ============================================================================

test('Detects "must" language', () => {
  const matches = checkPrescriptiveLanguage('You must rest immediately.');
  if (matches.length === 0) {
    throw new Error('Failed to detect "must"');
  }
});

test('Detects "should" language', () => {
  const matches = checkPrescriptiveLanguage('You should see a doctor.');
  if (matches.length === 0) {
    throw new Error('Failed to detect "should"');
  }
});

test('Detects "need to" language', () => {
  const matches = checkPrescriptiveLanguage('You need to exercise more.');
  if (matches.length === 0) {
    throw new Error('Failed to detect "need to"');
  }
});

test('Detects "have to" language', () => {
  const matches = checkPrescriptiveLanguage('You have to change your habits.');
  if (matches.length === 0) {
    throw new Error('Failed to detect "have to"');
  }
});

test('Detects multiple prescriptive patterns', () => {
  const matches = checkPrescriptiveLanguage('You must rest and you should eat well.');
  if (matches.length < 2) {
    throw new Error('Failed to detect multiple prescriptive patterns');
  }
});

// ============================================================================
// Test 6: Medical Keywords
// ============================================================================

test('Detects medical keywords', () => {
  const keywords = [
    'diagnosis',
    'clinical',
    'medical',
    'syndrome',
    'disorder',
    'treatment',
    'prescription',
  ];
  
  for (const keyword of keywords) {
    const matches = checkMedicalKeywords(`This is ${keyword} related.`);
    if (matches.length === 0) {
      throw new Error(`Failed to detect keyword: ${keyword}`);
    }
  }
});

test('Medical keywords are case-insensitive', () => {
  const matches1 = checkMedicalKeywords('DIAGNOSIS');
  const matches2 = checkMedicalKeywords('Diagnosis');
  const matches3 = checkMedicalKeywords('diagnosis');
  
  if (matches1.length === 0 || matches2.length === 0 || matches3.length === 0) {
    throw new Error('Medical keyword check not case-insensitive');
  }
});

test('Multiple medical keywords detected', () => {
  const matches = checkMedicalKeywords('Clinical diagnosis requires medical treatment.');
  if (matches.length < 3) {
    throw new Error('Failed to detect multiple medical keywords');
  }
});

// ============================================================================
// Test 7: Suggestive Patterns (Safe Language)
// ============================================================================

test('Detects safe suggestive language', () => {
  const safeTexts = [
    'You might consider resting.',
    'This could be helpful.',
    'You may want to track your sleep.',
    'When ready, try this option.',
  ];
  
  for (const text of safeTexts) {
    const hasSuggestive = checkSuggestivePatterns(text);
    if (!hasSuggestive) {
      throw new Error(`Failed to detect suggestive language: "${text}"`);
    }
  }
});

test('Detects healthcare professional references', () => {
  const texts = [
    'Discuss with your healthcare professional.',
    'Consult your doctor.',
    'Talk to a physician.',
  ];
  
  for (const text of texts) {
    const hasSuggestive = checkSuggestivePatterns(text);
    if (!hasSuggestive) {
      throw new Error(`Failed to detect healthcare professional reference: "${text}"`);
    }
  }
});

test('Returns false for non-suggestive text', () => {
  const hasSuggestive = checkSuggestivePatterns('Your data shows values.');
  if (hasSuggestive) {
    throw new Error('False positive for suggestive language');
  }
});

// ============================================================================
// Test 8: Alarming Patterns
// ============================================================================

test('Detects alarming language', () => {
  const alarmingTexts = [
    'WARNING: Critical condition detected.',
    'This is dangerous.',
    'Emergency action required.',
    'Urgent medical attention needed.',
    'Immediately see a doctor.',
    'Serious risk detected.',
  ];
  
  for (const text of alarmingTexts) {
    const matches = checkAlarmingPatterns(text);
    if (matches.length === 0) {
      throw new Error(`Failed to detect alarming language: "${text}"`);
    }
  }
});

test('Safe neutral language passes alarming check', () => {
  const safeTexts = [
    'Your pattern differs from baseline.',
    'Consider tracking this metric.',
    'This value has changed.',
  ];
  
  for (const text of safeTexts) {
    const matches = checkAlarmingPatterns(text);
    if (matches.length > 0) {
      throw new Error(`False positive for alarming language: "${text}"`);
    }
  }
});

// ============================================================================
// Test 9: Run All Pattern Checks
// ============================================================================

test('runPatternChecks returns complete result', () => {
  const result = runPatternChecks('You must take supplements to treat your condition.');
  
  if (!result.forbidden) throw new Error('Missing forbidden field');
  if (!result.required) throw new Error('Missing required field');
  if (!result.prescriptive) throw new Error('Missing prescriptive field');
  if (!result.medical) throw new Error('Missing medical field');
});

test('runPatternChecks detects all violation types', () => {
  const result = runPatternChecks(
    'You must take magnesium to treat your medical condition.'
  );
  
  if (result.forbidden.length === 0) {
    throw new Error('Failed to detect forbidden patterns');
  }
  if (result.prescriptive.length === 0) {
    throw new Error('Failed to detect prescriptive language');
  }
  if (result.medical.length === 0) {
    throw new Error('Failed to detect medical keywords');
  }
});

test('runPatternChecks on safe text', () => {
  const result = runPatternChecks(
    'You might consider resting when your HRV is lower than your baseline.'
  );
  
  if (result.forbidden.length > 0) {
    throw new Error('Safe text flagged as forbidden');
  }
  if (result.prescriptive.length > 0) {
    throw new Error('Safe text flagged as prescriptive');
  }
  if (result.required.length === 0) {
    throw new Error('Failed to detect suggestive language');
  }
});

// ============================================================================
// Test 10: Patterns to Violations
// ============================================================================

test('patternsToViolations converts to violation objects', () => {
  const patterns = {
    forbidden: ['diagnose'],
    required: [],
    prescriptive: ['must'],
    medical: ['clinical'],
  };
  
  const violations = patternsToViolations(patterns);
  
  if (violations.length === 0) {
    throw new Error('No violations generated');
  }
  
  const hasRuleField = violations.every(v => typeof v.rule === 'string');
  const hasSeverityField = violations.every(v => typeof v.severity === 'string');
  const hasMessageField = violations.every(v => typeof v.message === 'string');
  
  if (!hasRuleField || !hasSeverityField || !hasMessageField) {
    throw new Error('Violation objects missing required fields');
  }
});

test('patternsToViolations sets correct severity levels', () => {
  const patterns = {
    forbidden: ['cure'],
    required: [],
    prescriptive: ['should'],
    medical: ['diagnosis'],
  };
  
  const violations = patternsToViolations(patterns);
  
  const criticalViolation = violations.find(v => v.rule === 'forbidden-patterns');
  const highViolation = violations.find(v => v.rule === 'medical-keywords');
  const mediumViolation = violations.find(v => v.rule === 'prescriptive-language');
  
  if (criticalViolation?.severity !== 'critical') {
    throw new Error('Forbidden patterns should be critical severity');
  }
  if (highViolation?.severity !== 'high') {
    throw new Error('Medical keywords should be high severity');
  }
  if (mediumViolation?.severity !== 'medium') {
    throw new Error('Prescriptive language should be medium severity');
  }
});

test('patternsToViolations includes matched patterns', () => {
  const patterns = {
    forbidden: ['diagnose', 'treat'],
    required: [],
    prescriptive: [],
    medical: [],
  };
  
  const violations = patternsToViolations(patterns);
  const forbiddenViolation = violations.find(v => v.rule === 'forbidden-patterns');
  
  if (!forbiddenViolation?.matched) {
    throw new Error('Violation missing matched field');
  }
  if (forbiddenViolation.matched.length !== 2) {
    throw new Error('Matched patterns count incorrect');
  }
});

// ============================================================================
// Test 11: Confidence Calculation
// ============================================================================

test('calculatePatternConfidence starts at 1.0 for safe text', () => {
  const patterns = {
    forbidden: [],
    required: ['suggestive-language'],
    prescriptive: [],
    medical: [],
  };
  
  const confidence = calculatePatternConfidence(patterns);
  if (confidence < 1.0) {
    throw new Error('Safe text should have high confidence');
  }
});

test('calculatePatternConfidence decreases with violations', () => {
  const safePatterns = {
    forbidden: [],
    required: [],
    prescriptive: [],
    medical: [],
  };
  
  const unsafePatterns = {
    forbidden: ['cure'],
    required: [],
    prescriptive: ['must'],
    medical: ['diagnosis'],
  };
  
  const safeConfidence = calculatePatternConfidence(safePatterns);
  const unsafeConfidence = calculatePatternConfidence(unsafePatterns);
  
  if (unsafeConfidence >= safeConfidence) {
    throw new Error('Unsafe text should have lower confidence');
  }
});

test('calculatePatternConfidence never goes below 0', () => {
  const worstPatterns = {
    forbidden: ['a', 'b', 'c', 'd', 'e'],
    required: [],
    prescriptive: ['x', 'y', 'z'],
    medical: ['m', 'n', 'o'],
  };
  
  const confidence = calculatePatternConfidence(worstPatterns);
  if (confidence < 0) {
    throw new Error('Confidence should not be negative');
  }
});

test('calculatePatternConfidence never exceeds 1.0', () => {
  const bestPatterns = {
    forbidden: [],
    required: ['a', 'b', 'c'],
    prescriptive: [],
    medical: [],
  };
  
  const confidence = calculatePatternConfidence(bestPatterns);
  if (confidence > 1.0) {
    throw new Error('Confidence should not exceed 1.0');
  }
});

// ============================================================================
// Test 12: Performance
// ============================================================================

test('Pattern checks are fast (<10ms)', () => {
  const text = 'You should take supplements to treat your medical condition immediately.';
  
  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    runPatternChecks(text);
  }
  const elapsed = Date.now() - start;
  const avgTime = elapsed / 100;
  
  if (avgTime > 10) {
    throw new Error(`Pattern checks too slow: ${avgTime}ms average`);
  }
});

test('Large text validation is reasonably fast', () => {
  const largeText = 'Your data shows normal variation. '.repeat(100);
  
  const start = Date.now();
  runPatternChecks(largeText);
  const elapsed = Date.now() - start;
  
  if (elapsed > 50) {
    throw new Error(`Large text validation too slow: ${elapsed}ms`);
  }
});

// ============================================================================
// Test 13: Edge Cases
// ============================================================================

test('Empty string returns empty results', () => {
  const result = runPatternChecks('');
  
  if (result.forbidden.length > 0 || result.prescriptive.length > 0) {
    throw new Error('Empty string should have no violations');
  }
});

test('Handles special characters', () => {
  const text = 'You should $#@! exercise!';
  const result = runPatternChecks(text);
  
  if (result.prescriptive.length === 0) {
    throw new Error('Should still detect patterns with special characters');
  }
});

test('Word boundary detection works', () => {
  // "cure" should match but "secure" should not
  const secure = checkForbiddenPatterns('This is a secure connection.');
  const cure = checkForbiddenPatterns('This will cure you.');
  
  if (secure.length > 0) {
    throw new Error('False positive: "secure" detected as "cure"');
  }
  if (cure.length === 0) {
    throw new Error('Failed to detect actual "cure"');
  }
});

// ============================================================================
// Test 14: Real-World Examples
// ============================================================================

test('Real unsafe example: medical diagnosis', () => {
  const text = 'Based on your HRV data, you have cardiovascular disease. You should take magnesium supplements immediately.';
  const results = runPatternChecks(text);
  
  if (result.forbidden.length === 0) {
    throw new Error('Failed to detect real medical diagnosis');
  }
  if (results.prescriptive.length === 0) {
    throw new Error('Failed to detect prescriptive language');
  }
});

test('Real safe example: baseline comparison', () => {
  const text = 'Your HRV is 15% lower than your personal baseline. You might consider lighter activity today. When you\'re ready, discuss patterns with your healthcare professional.';
  const results = runPatternChecks(text);
  
  if (results.forbidden.length > 0) {
    throw new Error('Safe baseline comparison flagged as unsafe');
  }
  if (results.required.length === 0) {
    throw new Error('Failed to detect suggestive language in safe example');
  }
});

test('Real unsafe example: supplement recommendation', () => {
  const text = 'Take 5mg of melatonin 30 minutes before bed to treat your insomnia.';
  const results = runPatternChecks(text);
  
  if (results.forbidden.length === 0) {
    throw new Error('Failed to detect supplement dosage recommendation');
  }
});

test('Real safe example: optional framing', () => {
  const text = 'Consider tracking your sleep patterns. This might help you understand variations. Not medical advice.';
  const results = runPatternChecks(text);
  
  if (results.forbidden.length > 0 || results.prescriptive.length > 0) {
    throw new Error('Safe optional framing flagged incorrectly');
  }
});

// ============================================================================
// Results
// ============================================================================

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Tests: ${passed} passed, ${failed} failed`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

process.exit(failed > 0 ? 1 : 0);
