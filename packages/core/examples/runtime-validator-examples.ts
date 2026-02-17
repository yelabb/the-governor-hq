/**
 * Runtime Validator Examples
 * Demonstrates the hard post-generation gate: LLM → Validator → Output
 */

import { createValidator, type ValidationResult } from '@the-governor-hq/constitution-core';

// ============================================================================
// Example 1: Basic Validation
// ============================================================================

async function example1_basicValidation() {
  console.log('\n=== Example 1: Basic Validation ===\n');
  
  const validator = createValidator({
    domain: 'wearables',
    onViolation: 'block'
  });
  
  // Unsafe content (medical claim)
  const unsafeText = 'Your HRV is low. You have sleep apnea. Take magnesium.';
  const result1 = validator.validateSync(unsafeText);
  
  console.log('Unsafe text validation:');
  console.log('  Safe:', result1.safe);
  console.log('  Output:', result1.output);
  console.log('  Violations:', result1.violations.length);
  console.log('  Safe alternative:', result1.safeAlternative);
  
  // Safe content (suggestive language)
  const safeText = 'Your HRV is 20% lower than your baseline. Consider discussing this with a healthcare professional.';
  const result2 = validator.validateSync(safeText);
  
  console.log('\nSafe text validation:');
  console.log('  Safe:', result2.safe);
  console.log('  Output:', result2.output);
  console.log('  Violations:', result2.violations.length);
}

// ============================================================================
// Example 2: Different Violation Actions
// ============================================================================

function example2_violationActions() {
  console.log('\n=== Example 2: Violation Actions ===\n');
  
  const unsafeText = 'You should take a magnesium supplement for better sleep.';
  
  // Block mode (production)
  const blockValidator = createValidator({ onViolation: 'block' });
  const blockResult = blockValidator.validateSync(unsafeText);
  console.log('Block mode:', blockResult.output);
  
  // Sanitize mode (attempt to fix)
  const sanitizeValidator = createValidator({ onViolation: 'sanitize' });
  const sanitizeResult = sanitizeValidator.validateSync(unsafeText);
  console.log('Sanitize mode:', sanitizeResult.output);
  
  // Warn mode (development)
  const warnValidator = createValidator({ onViolation: 'warn' });
  const warnResult = warnValidator.validateSync(unsafeText);
  console.log('Warn mode (allows but warns):', warnResult.output);
}

// ============================================================================
// Example 3: Custom Validation Rules
// ============================================================================

function example3_customRules() {
  console.log('\n=== Example 3: Custom Rules ===\n');
  
  const validator = createValidator({
    domain: 'wearables',
    onViolation: 'block',
    customRules: [
      {
        id: 'no-brand-names',
        description: 'Avoid mentioning specific product brands',
        severity: 'medium',
        check: (text) => /\b(Garmin|Apple Watch|Whoop|Oura)\b/i.test(text),
        violation: 'Specific product brand mentioned'
      },
      {
        id: 'no-percentages',
        description: 'Avoid specific percentage recommendations',
        severity: 'low',
        check: (text) => /increase by \d+%/i.test(text),
        violation: 'Specific percentage recommendation'
      }
    ]
  });
  
  const text1 = 'Your Garmin watch shows low HRV.';
  const result1 = validator.validateSync(text1);
  console.log('Brand name check:');
  console.log('  Safe:', result1.safe);
  console.log('  Violations:', result1.violations.map(v => v.rule));
  
  const text2 = 'Consider increasing your sleep by 15%.';
  const result2 = validator.validateSync(text2);
  console.log('\nPercentage check:');
  console.log('  Safe:', result2.safe);
  console.log('  Violations:', result2.violations.map(v => v.rule));
}

// ============================================================================
// Example 4: Environment-Based Configuration
// ============================================================================

function example4_environmentConfig() {
  console.log('\n=== Example 4: Environment Config ===\n');
  
  const validator = createValidator({
    domain: 'wearables',
    strictMode: process.env.NODE_ENV === 'production',
    onViolation: process.env.NODE_ENV === 'production' ? 'block' : 'warn',
    useLLMJudge: process.env.NODE_ENV === 'production',
  });
  
  console.log('Configuration:');
  console.log('  Environment:', process.env.NODE_ENV || 'development');
  console.log('  Strict mode:', validator.getConfig().strictMode);
  console.log('  On violation:', validator.getConfig().onViolation);
  console.log('  LLM judge:', validator.getConfig().useLLMJudge);
}

// ============================================================================
// Example 5: Real-World AI Integration
// ============================================================================

async function example5_aiIntegration() {
  console.log('\n=== Example 5: AI Integration ===\n');
  
  const validator = createValidator({
    domain: 'wearables',
    onViolation: 'block'
  });
  
  // Simulate LLM call
  async function callLLM(prompt: string): Promise<string> {
    // This would be your actual LLM call (OpenAI, Anthropic, etc.)
    return 'Your sleep quality is poor. You likely have insomnia. Take 3mg of melatonin before bed.';
  }
  
  // Safe wrapper
  async function getSafeAIResponse(userPrompt: string): Promise<string> {
    const llmOutput = await callLLM(userPrompt);
    const result = await validator.validate(llmOutput);
    
    if (!result.safe) {
      console.log('❌ Blocked unsafe AI response:');
      console.log('   Original:', llmOutput);
      console.log('   Violations:', result.violations.map(v => v.message));
      console.log('   Returning safe alternative...');
      return result.safeAlternative || 'Unable to process request safely.';
    }
    
    console.log('✅ Safe AI response passed validation');
    return result.output;
  }
  
  const safeResponse = await getSafeAIResponse('Why is my sleep bad?');
  console.log('\nFinal output to user:', safeResponse);
}

// ============================================================================
// Example 6: Validation Metadata and Monitoring
// ============================================================================

function example6_metadata() {
  console.log('\n=== Example 6: Metadata & Monitoring ===\n');
  
  const validator = createValidator({
    domain: 'therapy',
    onViolation: 'block'
  });
  
  const text = 'You are showing signs of clinical depression. You need medication.';
  const result = validator.validateSync(text);
  
  // Log metadata for monitoring
  console.log('Validation Metadata:');
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    safe: result.safe,
    violationCount: result.violations.length,
    confidence: result.confidence,
    latencyMs: result.metadata.latencyMs,
    domain: result.metadata.domain,
    rulesChecked: result.metadata.rulesChecked,
  }, null, 2));
  
  // Send to analytics (hypothetical)
  if (!result.safe) {
    console.log('\n📊 Would send to analytics:', {
      event: 'validation_blocked',
      violations: result.violations.map(v => v.rule),
      severity: result.violations[0]?.severity,
    });
  }
}

// ============================================================================
// Example 7: Batch Validation
// ============================================================================

function example7_batchValidation() {
  console.log('\n=== Example 7: Batch Validation ===\n');
  
  const validator = createValidator({
    domain: 'wearables',
    onViolation: 'sanitize'
  });
  
  const responses = [
    'Your heart rate is elevated.',
    'You have cardiovascular disease.',
    'Consider tracking your activity levels.',
    'Take aspirin for your heart.',
    'Your baseline shows normal variation.',
  ];
  
  const results = responses.map(text => ({
    original: text,
    result: validator.validateSync(text)
  }));
  
  console.log('Batch Results:');
  results.forEach(({ original, result }, index) => {
    console.log(`\n${index + 1}. ${result.safe ? '✅' : '❌'} "${original}"`);
    if (!result.safe) {
      console.log(`   → "${result.output}"`);
      console.log(`   Violations: ${result.violations.map(v => v.rule).join(', ')}`);
    }
  });
  
  const safeCount = results.filter(r => r.result.safe).length;
  console.log(`\nSummary: ${safeCount}/${results.length} passed validation`);
}

// ============================================================================
// Run all examples
// ============================================================================

async function runAllExamples() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Governor HQ Runtime Validator - Examples                ║');
  console.log('║  Hard Post-Generation Gate: LLM → Validator → Output     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  await example1_basicValidation();
  example2_violationActions();
  example3_customRules();
  example4_environmentConfig();
  await example5_aiIntegration();
  example6_metadata();
  example7_batchValidation();
  
  console.log('\n✨ All examples completed!\n');
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  example1_basicValidation,
  example2_violationActions,
  example3_customRules,
  example4_environmentConfig,
  example5_aiIntegration,
  example6_metadata,
  example7_batchValidation,
};
