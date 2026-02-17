/**
 * Mock Test for LLM Judge Implementation
 * Verifies structure and integration without requiring API keys
 */

const { RuntimeValidator } = require('../dist/validators/runtime-validator');
const { createLLMClient } = require('../dist/validators/llm-client');

console.log('🧪 LLM Judge Mock Test Suite');
console.log('═'.repeat(60));

// Test 1: Verify LLM client can be created
console.log('\n✓ Test 1: LLM Client Creation');
try {
  const groqClient = createLLMClient({
    provider: 'groq',
    apiKey: 'test-key-123',
  });
  console.log('  ✅ Groq client created successfully');

  const openaiClient = createLLMClient({
    provider: 'openai',
    apiKey: 'test-key-456',
  });
  console.log('  ✅ OpenAI client created successfully');

  const anthropicClient = createLLMClient({
    provider: 'anthropic',
    apiKey: 'test-key-789',
  });
  console.log('  ✅ Anthropic client created successfully');
} catch (error) {
  console.error('  ❌ Failed:', error.message);
  process.exit(1);
}

// Test 2: Verify Runtime Validator integration
console.log('\n✓ Test 2: Runtime Validator Integration');
try {
  // Test without LLM judge (should work)
  const validator1 = new RuntimeValidator({
    useLLMJudge: false,
  });
  console.log('  ✅ Validator created without LLM judge');

  // Test with LLM judge but no API key (should warn and fall back)
  const validator2 = new RuntimeValidator({
    useLLMJudge: true,
  });
  console.log('  ✅ Validator gracefully handles missing API key');

  // Test with LLM judge and API key (should initialize)
  const validator3 = new RuntimeValidator({
    useLLMJudge: true,
    llmProvider: 'groq',
    apiKey: 'test-key',
  });
  const config = validator3.getConfig();
  if (config.useLLMJudge && config.llmProvider === 'groq') {
    console.log('  ✅ Validator configured with LLM judge');
  } else {
    console.error('  ❌ LLM judge not properly configured');
    process.exit(1);
  }
} catch (error) {
  console.error('  ❌ Failed:', error.message);
  process.exit(1);
}

// Test 3: Verify synchronous validation still works
console.log('\n✓ Test 3: Synchronous Validation (Pattern Matching)');
try {
  const validator = new RuntimeValidator({
    useLLMJudge: false,
  });

  const testCases = [
    {
      text: 'You might consider tracking your sleep and discussing it with your doctor.',
      shouldPass: true,
    },
    {
      text: 'You have sleep apnea and should take melatonin.',
      shouldPass: false,
    },
  ];

  let passed = 0;
  for (const tc of testCases) {
    const result = validator.validateSync(tc.text);
    if (result.safe === tc.shouldPass) {
      passed++;
      console.log(`  ✅ Test case ${passed}: ${result.safe ? 'PASS' : 'FAIL'} (expected)`);
    } else {
      console.error(`  ❌ Test case failed: expected ${tc.shouldPass}, got ${result.safe}`);
      process.exit(1);
    }
  }

  console.log(`  ✅ All ${passed} synchronous validation tests passed`);
} catch (error) {
  console.error('  ❌ Failed:', error.message);
  process.exit(1);
}

// Test 4: Verify type exports
console.log('\n✓ Test 4: Type Exports');
try {
  const exports = require('../dist/index');
  
  const requiredExports = [
    'RuntimeValidator',
    'createValidator',
    'validateText',
    'LLMClient',
    'createLLMClient',
  ];

  for (const exp of requiredExports) {
    if (!exports[exp]) {
      console.error(`  ❌ Missing export: ${exp}`);
      process.exit(1);
    }
  }
  
  console.log('  ✅ All required exports present');
} catch (error) {
  console.error('  ❌ Failed:', error.message);
  process.exit(1);
}

console.log('\n' + '═'.repeat(60));
console.log('✅ All mock tests passed!');
console.log('\n💡 To test with real LLM providers, set environment variables:');
console.log('   - GROQ_API_KEY (recommended, fastest and cheapest)');
console.log('   - OPENAI_API_KEY');
console.log('   - ANTHROPIC_API_KEY');
console.log('\nThen run: npm run test:llm');
console.log('═'.repeat(60));
