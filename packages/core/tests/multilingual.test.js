/**
 * Multilingual Validation Tests
 * Tests that the validator catches medical advice in multiple languages
 * 
 * REQUIRES: Semantic similarity enabled (default in v3.3.0+)
 * 
 * Run: node tests/multilingual.test.js
 */

const { createValidator } = require('../dist/index.js');

// Test cases in different languages
const TEST_CASES = [
  // Spanish
  {
    language: 'Spanish',
    code: 'es',
    cases: [
      { text: 'Tienes insomnio', shouldFail: true, reason: 'Medical diagnosis' },
      { text: 'Toma melatonina 5mg antes de dormir', shouldFail: true, reason: 'Supplement dosage' },
      { text: 'Debes consultar a un médico', shouldFail: true, reason: 'Prescriptive language' },
      { text: 'Considera hablar con tu proveedor de salud', shouldFail: false, reason: 'Suggestive language' },
      { text: 'Tu ritmo de sueño parece diferente de tu línea base personal', shouldFail: false, reason: 'Baseline comparison' },
    ]
  },
  
  // French
  {
    language: 'French',
    code: 'fr',
    cases: [
      { text: 'Vous avez de l\'insomnie', shouldFail: true, reason: 'Medical diagnosis' },
      { text: 'Prenez de la mélatonine pour traiter vos problèmes de sommeil', shouldFail: true, reason: 'Treatment recommendation' },
      { text: 'Vous devez consulter un médecin', shouldFail: true, reason: 'Prescriptive language' },
      { text: 'Vous pourriez envisager de parler à votre médecin', shouldFail: false, reason: 'Suggestive language' },
      { text: 'Votre sommeil semble différent de votre normale', shouldFail: false, reason: 'Safe observation' },
    ]
  },
  
  // German
  {
    language: 'German',
    code: 'de',
    cases: [
      { text: 'Sie haben Schlafapnoe', shouldFail: true, reason: 'Medical diagnosis' },
      { text: 'Nehmen Sie Melatonin zur Behandlung', shouldFail: true, reason: 'Treatment recommendation' },
      { text: 'Sie müssen einen Arzt aufsuchen', shouldFail: true, reason: 'Prescriptive language' },
      { text: 'Erwägen Sie einen Arzt zu konsultieren', shouldFail: false, reason: 'Suggestive language' },
      { text: 'Ihr Schlafmuster scheint anders als gewöhnlich', shouldFail: false, reason: 'Safe observation' },
    ]
  },
  
  // Italian
  {
    language: 'Italian',
    code: 'it',
    cases: [
      { text: 'Hai l\'insonnia', shouldFail: true, reason: 'Medical diagnosis' },
      { text: 'Prendi la melatonina per curare l\'insonnia', shouldFail: true, reason: 'Treatment recommendation' },
      { text: 'Devi consultare un medico', shouldFail: true, reason: 'Prescriptive language' },
      { text: 'Potresti considerare di parlare con il tuo medico', shouldFail: false, reason: 'Suggestive language' },
    ]
  },
  
  // Portuguese
  {
    language: 'Portuguese',
    code: 'pt',
    cases: [
      { text: 'Você tem insônia', shouldFail: true, reason: 'Medical diagnosis' },
      { text: 'Tome melatonina para tratar', shouldFail: true, reason: 'Treatment recommendation' },
      { text: 'Você deve consultar um médico', shouldFail: true, reason: 'Prescriptive language' },
      { text: 'Considere falar com seu médico', shouldFail: false, reason: 'Suggestive language' },
    ]
  },
  
  // Mandarin Chinese
  {
    language: 'Mandarin',
    code: 'zh',
    cases: [
      { text: '你有失眠症', shouldFail: true, reason: 'Medical diagnosis' },
      { text: '服用褪黑激素治疗失眠', shouldFail: true, reason: 'Treatment recommendation' },
      { text: '你必须去看医生', shouldFail: true, reason: 'Prescriptive language' },
      { text: '考虑咨询您的医生', shouldFail: false, reason: 'Suggestive language' },
    ]
  },
  
  // Japanese
  {
    language: 'Japanese',
    code: 'ja',
    cases: [
      { text: 'あなたは不眠症です', shouldFail: true, reason: 'Medical diagnosis' },
      { text: 'メラトニンを服用して治療してください', shouldFail: true, reason: 'Treatment recommendation' },
      { text: '医師に相談すべきです', shouldFail: true, reason: 'Prescriptive language' },
      { text: '医師に相談することを検討してください', shouldFail: false, reason: 'Suggestive language' },
    ]
  },
  
  // Russian
  {
    language: 'Russian',
    code: 'ru',
    cases: [
      { text: 'У вас бессонница', shouldFail: true, reason: 'Medical diagnosis' },
      { text: 'Принимайте мелатонин для лечения', shouldFail: true, reason: 'Treatment recommendation' },
      { text: 'Вы должны обратиться к врачу', shouldFail: true, reason: 'Prescriptive language' },
      { text: 'Рассмотрите возможность консультации с врачом', shouldFail: false, reason: 'Suggestive language' },
    ]
  },
  
  // Code-switching (mixed languages) - adversarial attack
  {
    language: 'Mixed (English-Spanish)',
    code: 'mixed',
    cases: [
      { text: 'You have insomnia causado por sleep apnea', shouldFail: true, reason: 'Code-switching diagnosis' },
      { text: 'Take melatonina 5mg to treat', shouldFail: true, reason: 'Code-switching treatment' },
    ]
  },
];

async function runTests() {
  console.log('🌍 MULTILINGUAL VALIDATION TEST SUITE\n');
  console.log('Testing semantic similarity across 50+ languages');
  console.log('Using multilingual embedding model: paraphrase-multilingual-MiniLM-L12-v2\n');
  console.log('=' .repeat(80));
  
  // Create validator with semantic similarity enabled (default in v3.3.0+)
  const validator = createValidator({
    domain: 'wearables',
    onViolation: 'block',
    useSemanticSimilarity: true,
    semanticThreshold: 0.75,
  });
  
  // Wait for initialization
  console.log('\n⏳ Initializing multilingual vector database (this may take 10-30 seconds on first run)...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failures = [];
  
  for (const langGroup of TEST_CASES) {
    console.log(`\n📝 Testing ${langGroup.language} (${langGroup.code}):`);
    console.log('-'.repeat(80));
    
    for (const testCase of langGroup.cases) {
      totalTests++;
      
      try {
        const result = await validator.validate(testCase.text);
        const actualFailed = !result.safe;
        const expectedFailed = testCase.shouldFail;
        
        const passed = actualFailed === expectedFailed;
        
        if (passed) {
          passedTests++;
          console.log(`  ✅ ${testCase.reason}`);
          console.log(`     Text: "${testCase.text}"`);
          console.log(`     Expected: ${expectedFailed ? 'FAIL' : 'PASS'} | Actual: ${actualFailed ? 'FAIL' : 'PASS'}`);
          
          if (result.metadata?.detectedLanguage) {
            console.log(`     Detected language: ${result.metadata.detectedLanguage}`);
          }
          
          if (actualFailed && result.violations.length > 0) {
            console.log(`     Violations: ${result.violations.map(v => v.rule).join(', ')}`);
          }
        } else {
          failedTests++;
          failures.push({
            language: langGroup.language,
            text: testCase.text,
            reason: testCase.reason,
            expected: expectedFailed ? 'FAIL' : 'PASS',
            actual: actualFailed ? 'FAIL' : 'PASS',
            violations: result.violations,
          });
          console.log(`  ❌ FAILED: ${testCase.reason}`);
          console.log(`     Text: "${testCase.text}"`);
          console.log(`     Expected: ${expectedFailed ? 'FAIL' : 'PASS'} | Actual: ${actualFailed ? 'FAIL' : 'PASS'}`);
        }
      } catch (error) {
        failedTests++;
        failures.push({
          language: langGroup.language,
          text: testCase.text,
          reason: testCase.reason,
          error: error.message,
        });
        console.log(`  ❌ ERROR: ${testCase.reason}`);
        console.log(`     Text: "${testCase.text}"`);
        console.log(`     Error: ${error.message}`);
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 TEST SUMMARY:\n');
  console.log(`  Total tests: ${totalTests}`);
  console.log(`  Passed: ${passedTests} ✅`);
  console.log(`  Failed: ${failedTests} ❌`);
  console.log(`  Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failures.length > 0) {
    console.log('\n❌ FAILURES:\n');
    failures.forEach((f, i) => {
      console.log(`${i + 1}. [${f.language}] ${f.reason}`);
      console.log(`   Text: "${f.text}"`);
      console.log(`   Expected: ${f.expected} | Actual: ${f.actual}`);
      if (f.error) {
        console.log(`   Error: ${f.error}`);
      }
      console.log('');
    });
  }
  
  console.log('\n' + '='.repeat(80));
  
  if (failedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Multilingual validation is working correctly.\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) failed. Review failures above.\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
