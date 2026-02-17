#!/usr/bin/env node

/**
 * Semantic Similarity & Adversarial Attack Tests
 * Tests hardened pattern matcher against spacing/spelling attacks
 */

const {
  detectAdversarialAttack,
} = require('../dist/validators/pattern-matcher');

const {
  checkSemanticSimilarity,
  initializeVectorDatabase,
  generateEmbedding,
  cosineSimilarity,
  normalizeText,
} = require('../dist/validators/semantic-similarity');

console.log('\n🧪 Testing Semantic Similarity & Adversarial Attack Detection...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  return new Promise((resolve) => {
    Promise.resolve(fn())
      .then(() => {
        console.log(`✓ ${name}`);
        passed++;
        resolve();
      })
      .catch((error) => {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
        failed++;
        resolve();
      });
  });
}

// ============================================================================
// Test 1: Text Normalization
// ============================================================================

async function testNormalization() {
  await test('Normalizes spacing attacks', () => {
    const normalized = normalizeText('d i a g n o s e');
    if (!normalized.includes('diagnose')) {
      throw new Error(`Failed to normalize spacing attack: "${normalized}"`);
    }
  });

  await test('Normalizes special character attacks', () => {
    const normalized = normalizeText('d!i@a#g$n%o^s&e');
    if (!normalized.includes('diagnose')) {
      throw new Error(`Failed to normalize special char attack: "${normalized}"`);
    }
  });

  await test('Normalizes misspellings', () => {
    const normalized = normalizeText('You have diagnoz');
    if (!normalized.includes('diagnose')) {
      throw new Error(`Failed to normalize misspelling: "${normalized}"`);
    }
  });

  await test('Normalizes multiple spaces', () => {
    const normalized = normalizeText('You    have     insomnia');
    const spaceCount = (normalized.match(/\s+/g) || []).length;
    if (spaceCount > 2) {
      throw new Error(`Failed to collapse spaces: "${normalized}"`);
    }
  });

  await test('Normalizes case variations', () => {
    const normalized = normalizeText('YoU hAvE dEpReSsIoN');
    if (normalized !== normalized.toLowerCase()) {
      throw new Error(`Failed to normalize case: "${normalized}"`);
    }
  });
}

// ============================================================================
// Test 2: Adversarial Attack Detection
// ============================================================================

async function testAdversarialDetection() {
  await test('Detects spacing attacks', () => {
    const result = detectAdversarialAttack('You have d i a g n o s e d');
    if (!result.manipulationDetected) {
      throw new Error('Failed to detect spacing attack');
    }
    if (result.manipulationType !== 'spacing') {
      throw new Error(`Wrong manipulation type: ${result.manipulationType}`);
    }
  });

  await test('Detects special character attacks', () => {
    const result = detectAdversarialAttack('You have d!i@a#g$n%o^s&e');
    if (!result.manipulationDetected) {
      throw new Error('Failed to detect special char attack');
    }
  });

  await test('Detects misspelling attacks', () => {
    const result = detectAdversarialAttack('You have diagnoz');
    if (!result.manipulationDetected) {
      throw new Error('Failed to detect misspelling attack');
    }
  });

  await test('Allows normal text', () => {
    const result = detectAdversarialAttack('Your HRV data looks good');
    if (result.manipulationDetected) {
      throw new Error('False positive on normal text');
    }
  });
}

// ============================================================================
// Test 3: Semantic Similarity (requires initialization)
// ============================================================================

async function testSemanticSimilarity() {
  console.log('\n📦 Initializing vector database (this may take a moment)...\n');
  
  try {
    await initializeVectorDatabase();
  } catch (error) {
    console.log('⚠️  Could not initialize vector database. Skipping semantic tests.');
    console.log(`   Reason: ${error.message}`);
    return;
  }

  await test('Detects medical diagnosis via semantic similarity', async () => {
    const result = await checkSemanticSimilarity('You have insomnia');
    if (result.violations.length === 0) {
      throw new Error('Failed to detect medical diagnosis semantically');
    }
    if (result.maxSimilarity < 0.75) {
      throw new Error(`Similarity too low: ${result.maxSimilarity}`);
    }
  });

  await test('Detects spaced diagnosis via semantic similarity', async () => {
    const result = await checkSemanticSimilarity('You have i n s o m n i a');
    if (result.violations.length === 0) {
      throw new Error('Failed to detect spaced diagnosis');
    }
  });

  await test('Detects misspelled diagnosis via semantic similarity', async () => {
    const result = await checkSemanticSimilarity('You have insomnya');
    if (result.violations.length === 0) {
      throw new Error('Failed to detect misspelled diagnosis');
    }
  });

  await test('Detects treatment prescription via semantic similarity', async () => {
    const result = await checkSemanticSimilarity('Take 5mg of melatonin before bed');
    if (result.violations.length === 0) {
      throw new Error('Failed to detect treatment prescription');
    }
  });

  await test('Detects obfuscated treatment via semantic similarity', async () => {
    const result = await checkSemanticSimilarity('T a k e  5mg of m e l a t o n i n');
    if (result.violations.length === 0) {
      throw new Error('Failed to detect obfuscated treatment');
    }
  });

  await test('Allows safe observation text', async () => {
    const result = await checkSemanticSimilarity('Your HRV has been lower than usual');
    if (result.violations.length > 0) {
      throw new Error('False positive on safe observation');
    }
  });

  await test('Allows safe suggestion text', async () => {
    const result = await checkSemanticSimilarity('You might consider an earlier bedtime');
    if (result.violations.length > 0) {
      throw new Error('False positive on safe suggestion');
    }
  });

  await test('Semantic check has reasonable latency', async () => {
    const result = await checkSemanticSimilarity('Your data shows interesting patterns');
    if (result.latencyMs > 5000) {
      throw new Error(`Semantic check too slow: ${result.latencyMs}ms`);
    }
  });
}

// ============================================================================
// Test 4: Embedding Generation
// ============================================================================

async function testEmbeddings() {
  await test('Generates embeddings for text', async () => {
    const embedding = await generateEmbedding('This is a test');
    if (!Array.isArray(embedding)) {
      throw new Error('Embedding is not an array');
    }
    if (embedding.length === 0) {
      throw new Error('Embedding is empty');
    }
  });

  await test('Similar texts have high similarity', async () => {
    const emb1 = await generateEmbedding('You have insomnia');
    const emb2 = await generateEmbedding('You have sleep problems');
    const similarity = cosineSimilarity(emb1, emb2);
    
    if (similarity < 0.6) {
      throw new Error(`Similar texts have low similarity: ${similarity}`);
    }
  });

  await test('Different texts have low similarity', async () => {
    const emb1 = await generateEmbedding('You have insomnia');
    const emb2 = await generateEmbedding('The weather is nice today');
    const similarity = cosineSimilarity(emb1, emb2);
    
    if (similarity > 0.4) {
      throw new Error(`Different texts have high similarity: ${similarity}`);
    }
  });
}

// ============================================================================
// Test 5: Real-World Adversarial Examples
// ============================================================================

async function testRealWorldAttacks() {
  const attackExamples = [
    'd i a g n o s e',                    // spacing
    'd!i@a#g$n%o^s&e',                   // special chars
    'diagnoz',                            // misspelling
    'you have i-n-s-o-m-n-i-a',          // hyphen spacing
    'you have sleep_apnea',               // underscore
    'T A K E melatonin',                  // partial spacing
    'take mel@tonin',                     // partial special chars
    'you have d3pr3ss10n',                // leetspeak
  ];

  for (const attack of attackExamples) {
    await test(`Detects attack: "${attack.substring(0, 30)}..."`, () => {
      const result = detectAdversarialAttack(attack);
      if (!result.manipulationDetected) {
        throw new Error('Failed to detect adversarial attack');
      }
    });
  }
}

// ============================================================================
// Run All Tests
// ============================================================================

async function runAllTests() {
  await testNormalization();
  await testAdversarialDetection();
  await testSemanticSimilarity();
  await testEmbeddings();
  await testRealWorldAttacks();

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});
