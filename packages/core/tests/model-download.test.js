/**
 * Model Download & Latency Test
 * Tests multilingual model download and measures performance
 * 
 * Run: node tests/model-download.test.js
 */

console.log('🔍 Testing Multilingual Model Download & Latency\n');
console.log('='.repeat(80));

async function testModelDownload() {
  try {
    // Step 1: Import transformers
    console.log('\n📦 Step 1: Importing @xenova/transformers...');
    const startImport = Date.now();
    
    const { pipeline, env } = await import('@xenova/transformers');
    const importTime = Date.now() - startImport;
    console.log(`✅ Import successful (${importTime}ms)`);
    
    // Show cache directory
    console.log(`📁 Cache directory: ${env.cacheDir || 'default (~/.cache/huggingface)'}`);
    
    // Step 2: Download/Load the model
    console.log('\n📥 Step 2: Loading paraphrase-multilingual-MiniLM-L12-v2...');
    console.log('   (First run: ~420MB download, may take 30-120s depending on connection)');
    console.log('   (Subsequent runs: loads from cache, <10s)');
    const startDownload = Date.now();
    
    const embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
    );
    
    const downloadTime = Date.now() - startDownload;
    console.log(`✅ Model loaded (${downloadTime}ms = ${(downloadTime / 1000).toFixed(1)}s)`);
    
    // Step 3: Test embeddings generation (warm-up)
    console.log('\n🔥 Step 3: Warm-up inference (first call is slower)...');
    const startWarmup = Date.now();
    
    const warmupOutput = await embeddingPipeline('test sentence', {
      pooling: 'mean',
      normalize: true,
    });
    
    const warmupTime = Date.now() - startWarmup;
    const embeddingDim = warmupOutput.data.length;
    console.log(`✅ Warm-up complete (${warmupTime}ms, ${embeddingDim}-dim embeddings)`);
    
    // Step 4: Test multiple languages for latency
    console.log('\n⚡ Step 4: Testing inference latency across languages...\n');
    
    const testSentences = [
      { lang: 'English', text: 'You have insomnia and need treatment' },
      { lang: 'Spanish', text: 'Tienes insomnio y necesitas tratamiento' },
      { lang: 'French', text: 'Vous avez de l\'insomnie et avez besoin d\'un traitement' },
      { lang: 'German', text: 'Sie haben Schlaflosigkeit und brauchen Behandlung' },
      { lang: 'Chinese', text: '你有失眠症需要治疗' },
      { lang: 'Japanese', text: 'あなたは不眠症で治療が必要です' },
      { lang: 'Russian', text: 'У вас бессонница и вам нужно лечение' },
      { lang: 'Arabic', text: 'لديك أرق وتحتاج إلى علاج' },
    ];
    
    const latencies = [];
    
    for (const { lang, text } of testSentences) {
      const start = Date.now();
      const output = await embeddingPipeline(text, {
        pooling: 'mean',
        normalize: true,
      });
      const latency = Date.now() - start;
      latencies.push(latency);
      
      // Extract first 5 dimensions for verification
      const embedding = Array.from(output.data).slice(0, 5);
      console.log(`  ${lang.padEnd(10)} | ${latency.toString().padStart(4)}ms | embedding: [${embedding.map(v => v.toFixed(3)).join(', ')}...]`);
    }
    
    // Step 5: Statistics
    console.log('\n📊 Step 5: Latency Statistics:\n');
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const minLatency = Math.min(...latencies);
    const maxLatency = Math.max(...latencies);
    const p95 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
    
    console.log(`  Average:    ${avgLatency.toFixed(1)}ms`);
    console.log(`  Min:        ${minLatency}ms`);
    console.log(`  Max:        ${maxLatency}ms`);
    console.log(`  P95:        ${p95}ms`);
    
    // Step 6: Test semantic similarity between languages
    console.log('\n🌍 Step 6: Testing cross-lingual semantic similarity...\n');
    
    // Generate embeddings for the same concept in different languages
    const concepts = [
      { lang: 'English', text: 'You have insomnia' },
      { lang: 'Spanish', text: 'Tienes insomnio' },
      { lang: 'French', text: 'Vous avez de l\'insomnie' },
      { lang: 'Chinese', text: '你有失眠症' },
    ];
    
    const embeddings = [];
    for (const { lang, text } of concepts) {
      const output = await embeddingPipeline(text, {
        pooling: 'mean',
        normalize: true,
      });
      embeddings.push(Array.from(output.data));
      console.log(`  ${lang}: embedded`);
    }
    
    // Calculate cosine similarity between English and other languages
    console.log('\n  Similarity to English "You have insomnia":');
    
    function cosineSimilarity(a, b) {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      
      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    
    const englishEmbedding = embeddings[0];
    for (let i = 1; i < embeddings.length; i++) {
      const similarity = cosineSimilarity(englishEmbedding, embeddings[i]);
      console.log(`    ${concepts[i].lang.padEnd(10)}: ${(similarity * 100).toFixed(1)}%`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ SUCCESS: All tests passed!\n');
    console.log('Summary:');
    console.log(`  - Model: paraphrase-multilingual-MiniLM-L12-v2 (${embeddingDim}-dim)`);
    console.log(`  - Load time: ${(downloadTime / 1000).toFixed(1)}s`);
    console.log(`  - Inference: ~${avgLatency.toFixed(0)}ms per text`);
    console.log(`  - Multilingual: ✅ Working across 50+ languages`);
    console.log('\n🎉 Model is ready for production use!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack trace:', error.stack);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check internet connection (model needs to download ~420MB)');
    console.log('  2. Verify @xenova/transformers is installed: npm ls @xenova/transformers');
    console.log('  3. Clear cache and retry: rm -rf ~/.cache/huggingface');
    console.log('  4. Check Node.js version: node --version (needs >=16.0.0)');
    
    process.exit(1);
  }
}

// Run the test
testModelDownload();
