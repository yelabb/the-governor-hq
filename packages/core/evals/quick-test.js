#!/usr/bin/env node

/**
 * Quick Test - Verify Evaluation System Setup
 * 
 * This script tests the evaluation infrastructure without requiring API keys.
 * It validates:
 * - Test case files are properly formatted
 * - Judge system functions correctly
 * - Pattern matching works as expected
 */

const fs = require('fs');
const path = require('path');
const { checkPatterns, calculateScore } = require('./llm-judge');

console.log('🛡️  Governor HQ Evaluation System - Quick Test\n');
console.log('═'.repeat(60));

let allPassed = true;

// Test 1: Verify test case files exist and are valid JSON
console.log('\n📋 Test 1: Validating test case files...');
const testCasesDir = path.join(__dirname, 'test-cases');
const expectedCategories = [
  'medical-claims',
  'supplements-dosages',
  'disease-naming',
  'treatment-language',
  'authoritative-language'
];

let totalTestCases = 0;

if (!fs.existsSync(testCasesDir)) {
  console.log('❌ FAIL: test-cases directory not found');
  allPassed = false;
} else {
  for (const category of expectedCategories) {
    const filepath = path.join(testCasesDir, `${category}.json`);
    
    if (!fs.existsSync(filepath)) {
      console.log(`   ❌ Missing: ${category}.json`);
      allPassed = false;
      continue;
    }
    
    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      const data = JSON.parse(content);
      
      if (!data.test_cases || !Array.isArray(data.test_cases)) {
        console.log(`   ❌ Invalid format: ${category}.json (missing test_cases array)`);
        allPassed = false;
        continue;
      }
      
      const count = data.test_cases.length;
      totalTestCases += count;
      console.log(`   ✅ ${category}.json (${count} tests)`);
      
    } catch (error) {
      console.log(`   ❌ Invalid JSON: ${category}.json - ${error.message}`);
      allPassed = false;
    }
  }
  
  console.log(`   📊 Total test cases: ${totalTestCases}`);
}

// Test 2: Verify pattern matching works
console.log('\n🔍 Test 2: Testing pattern matching...');

const mockTestCase = {
  id: 'test-001',
  prompt: 'Test prompt',
  forbidden_patterns: ['diagnosis', 'medical condition', 'you have'],
  required_patterns: ['healthcare professional', 'not able to']
};

// Test A: Response with violations
const badResponse = 'Based on your symptoms, this indicates a medical condition. You have a diagnosis that requires treatment.';
const badResult = checkPatterns(mockTestCase, badResponse);

if (badResult.violations.length > 0) {
  console.log(`   ✅ Correctly detected violations: ${badResult.violations.join(', ')}`);
} else {
  console.log('   ❌ FAIL: Should have detected violations');
  allPassed = false;
}

// Test B: Good response with no violations
const goodResponse = "I'm not able to diagnose conditions. If you're concerned, I'd recommend speaking with a healthcare professional who can properly evaluate your situation.";
const goodResult = checkPatterns(mockTestCase, goodResponse);

if (goodResult.violations.length === 0) {
  console.log('   ✅ Correctly found no violations in safe response');
} else {
  console.log(`   ❌ FAIL: Incorrectly flagged violations: ${goodResult.violations.join(', ')}`);
  allPassed = false;
}

if (goodResult.missing.length === 0) {
  console.log('   ✅ Correctly found all required patterns');
} else {
  console.log(`   ❌ FAIL: Missing required patterns: ${goodResult.missing.join(', ')}`);
  allPassed = false;
}

// Test 3: Verify score calculation
console.log('\n📊 Test 3: Testing score calculation...');

const mockResults = [
  { test_id: 'test-1', pass: true, verdict: 'PASS', test_case: { severity: 'critical' } },
  { test_id: 'test-2', pass: true, verdict: 'PASS', test_case: { severity: 'high' } },
  { test_id: 'test-3', pass: false, verdict: 'FAIL', test_case: { severity: 'medium' } },
  { test_id: 'test-4', pass: true, verdict: 'PASS', test_case: { severity: 'low' } }
];

const score = calculateScore(mockResults);

if (score.total === 4 && score.passed === 3 && score.failed === 1) {
  console.log('   ✅ Score calculation correct');
  console.log(`      Total: ${score.total}, Passed: ${score.passed}, Failed: ${score.failed}`);
  console.log(`      Pass rate: ${score.pass_rate}%`);
} else {
  console.log('   ❌ FAIL: Score calculation incorrect');
  allPassed = false;
}

// Test 4: Verify file structure
console.log('\n📁 Test 4: Verifying file structure...');

const requiredFiles = [
  'eval-runner.js',
  'llm-judge.js',
  'README.md',
  'config.json',
  'examples.js',
  'CHANGELOG.md'
];

for (const file of requiredFiles) {
  const filepath = path.join(__dirname, file);
  if (fs.existsSync(filepath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ Missing: ${file}`);
    allPassed = false;
  }
}

// Test 5: Check results directory
console.log('\n💾 Test 5: Checking results directory...');
const resultsDir = path.join(__dirname, 'results');

if (!fs.existsSync(resultsDir)) {
  console.log('   ℹ️  Creating results directory...');
  fs.mkdirSync(resultsDir, { recursive: true });
  console.log('   ✅ Results directory created');
} else {
  console.log('   ✅ Results directory exists');
}

// Final summary
console.log('\n' + '═'.repeat(60));
if (allPassed) {
  console.log('✅ All tests PASSED');
  console.log('\n🎉 Evaluation system is ready to use!');
  console.log('\nNext steps:');
  console.log('  1. Set API key: export ANTHROPIC_API_KEY="your-key"');
  console.log('  2. Run evals: npm run eval');
  console.log('  3. View results: cat evals/results/latest.json');
  process.exit(0);
} else {
  console.log('❌ Some tests FAILED');
  console.log('\n⚠️  Please fix the issues above before running evaluations.');
  process.exit(1);
}
