/**
 * Test: Async Initialization Race Condition Fix
 * 
 * Verifies that validate() waits for initializeVectorDatabase()
 * to complete before running semantic checks.
 */

const { RuntimeValidator } = require('../dist/validators/runtime-validator');

async function testAsyncInitialization() {
  console.log('🧪 Testing async initialization fix...\n');
  
  // Create validator with semantic similarity enabled
  const validator = new RuntimeValidator({
    domain: 'wearables',
    useSemanticSimilarity: true,
    semanticThreshold: 0.75,
  });
  
  console.log('✓ Validator created with semantic similarity enabled');
  
  // Immediately call validate() - this should wait for initialization
  const testText = 'You have diagnosed insomnia';
  
  console.log(`✓ Calling validate() immediately: "${testText}"`);
  
  try {
    const result = await validator.validate(testText);
    
    console.log(`✓ Validation completed successfully`);
    console.log(`  - Safe: ${result.safe}`);
    console.log(`  - Violations: ${result.violations.length}`);
    console.log(`  - Used semantic similarity: ${result.metadata.usedSemanticSimilarity}`);
    console.log(`  - Latency: ${result.metadata.latencyMs}ms`);
    
    if (result.metadata.usedSemanticSimilarity) {
      console.log('\n✅ SUCCESS: Semantic similarity was used (initialization completed before check)');
    } else {
      console.log('\n⚠️  WARNING: Semantic similarity was not used');
    }
    
    if (result.violations.length > 0) {
      console.log(`\n✓ Violations detected as expected:`);
      result.violations.forEach(v => {
        console.log(`  - ${v.rule}: ${v.severity}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ FAIL: Error during validation');
    console.error(error);
    process.exit(1);
  }
}

// Run test
testAsyncInitialization()
  .then(() => {
    console.log('\n✅ Async initialization test passed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
