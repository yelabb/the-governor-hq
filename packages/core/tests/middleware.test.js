#!/usr/bin/env node

/**
 * Middleware Tests
 * Tests Express and Next.js middleware for Governor HQ Validator
 */

const { 
  governorValidator, 
  validateField,
  validationErrorHandler 
} = require('../dist/middleware/express');

const { 
  withGovernor 
} = require('../dist/middleware/nextjs');

console.log('\n🧪 Testing Middleware (Express + Next.js)...\n');

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

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

// ============================================================================
// Mock Objects for Testing
// ============================================================================

function createMockRequest() {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
  };
}

function createMockResponse() {
  let jsonData = null;
  let statusCode = 200;
  
  const res = {
    statusCode,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(data) {
      jsonData = data;
      return res;
    },
    getJsonData() {
      return jsonData;
    },
    getStatusCode() {
      return res.statusCode;
    },
  };
  
  return res;
}

function createMockNext() {
  let called = false;
  let error = null;
  
  return function next(err) {
    called = true;
    if (err) error = err;
    return { called, error };
  };
}

// ============================================================================
// Express Middleware Tests
// ============================================================================

test('governorValidator is a function', () => {
  if (typeof governorValidator !== 'function') {
    throw new Error('governorValidator should be a function');
  }
});

test('governorValidator returns middleware function', () => {
  const middleware = governorValidator({ domain: 'wearables' });
  if (typeof middleware !== 'function') {
    throw new Error('Should return middleware function');
  }
});

testAsync('governorValidator attachesvalidator to request', async () => {
  const middleware = governorValidator({ domain: 'wearables' });
  const req = createMockRequest();
  const res = createMockResponse();
  const next = createMockNext();
  
  await middleware(req, res, next);
  
  if (!req.validator) {
    throw new Error('Validator not attached to request');
  }
  if (typeof req.validator.validateSync !== 'function') {
    throw new Error('Validator missing validateSync method');
  }
});

testAsync('governorValidator calls next()', async () => {
  const middleware = governorValidator({ domain: 'wearables' });
  const req = createMockRequest();
  const res = createMockResponse();
  const next = createMockNext();
  
  await middleware(req, res, next);
  
  if (!next().called) {
    throw new Error('next() was not called');
  }
});

testAsync('governorValidator blocks unsafe content in block mode', async () => {
  const middleware = governorValidator({ 
    domain: 'wearables', 
    onViolation: 'block' 
  });
  const req = createMockRequest();
  const res = createMockResponse();
  const next = createMockNext();
  
  await middleware(req, res, next);
  
  // Send unsafe content
  res.json({ message: 'You have insomnia. Take melatonin.' });
  
  const data = res.getJsonData();
  if (!data.error) {
    throw new Error('Should return error for unsafe content');
  }
  if (!data.violations) {
    throw new Error('Should include violations in response');
  }
});

testAsync('governorValidator allows safe content', async () => {
  const middleware = governorValidator({ 
    domain: 'wearables', 
    onViolation: 'block' 
  });
  const req = createMockRequest();
  const res = createMockResponse();
  const next = createMockNext();
  
  await middleware(req, res, next);
  
  // Send safe content
  const safeMessage = 'Your HRV is lower than your baseline. Consider resting.';
  res.json({ message: safeMessage });
  
  const data = res.getJsonData();
  if (data.error) {
    throw new Error('Safe content should not be blocked');
  }
  if (data.message !== safeMessage) {
    throw new Error('Safe message should pass through unchanged');
  }
});

testAsync('governorValidator blocks in deprecated sanitize mode', async () => {
  const middleware = governorValidator({ 
    domain: 'wearables', 
    onViolation: 'sanitize' 
  });
  const req = createMockRequest();
  const res = createMockResponse();
  const next = createMockNext();
  
  await middleware(req, res, next);
  
  // Send content with prescriptive language
  res.json({ message: 'You should exercise more.' });
  
  const data = res.getJsonData();
  // Sanitize mode is deprecated - should block content
  if (!data.message.includes('⚠️ Content blocked')) {
    throw new Error('Sanitize mode should block content (deprecated behavior)');
  }
});

testAsync('validateField validates specific field', async () => {
  const middleware = validateField('data.message', { 
    domain: 'therapy',
    onViolation: 'sanitize'
  });
  const req = createMockRequest();
  const res = createMockResponse();
  const next = createMockNext();
  
  await middleware(req, res, next);
  
  // Send nested structure with unsafe content
  res.json({ 
    data: { 
      message: 'You have depression.' 
    } 
  });
  
  const data = res.getJsonData();
  // Sanitize mode is deprecated - should block content
  if (!data.data.message.includes('⚠️ Content blocked')) {
    throw new Error('Field validation should block unsafe content (sanitize deprecated)');
  }
});

test('validationErrorHandler handles validation errors', () => {
  const req = createMockRequest();
  const res = createMockResponse();
  const next = createMockNext();
  
  const error = new Error('Validation failed');
  error.name = 'ValidationError';
  error.violations = [{ rule: 'test', severity: 'high' }];
  
  validationErrorHandler(error, req, res, next);
  
  const data = res.getJsonData();
  if (!data || !data.error) {
    throw new Error('Should return error response');
  }
  if (res.getStatusCode() !== 400) {
    throw new Error('Should return 400 status');
  }
});

test('validationErrorHandler passes non-validation errors to next', () => {
  const req = createMockRequest();
  const res = createMockResponse();
  const next = createMockNext();
  
  const error = new Error('Other error');
  
  validationErrorHandler(error, req, res, next);
  
  const result = next();
  if (!result.called) {
    throw new Error('Should call next() for non-validation errors');
  }
  if (!result.error) {
    throw new Error('Should pass error to next()');
  }
});

// ============================================================================
// Next.js Middleware Tests
// ============================================================================

test('withGovernor is a function', () => {
  if (typeof withGovernor !== 'function') {
    throw new Error('withGovernor should be a function');
  }
});

test('withGovernor returns handler function', () => {
  const handler = async (_req, _res) => {};
  const wrapped = withGovernor(handler, { domain: 'bci' });
  
  if (typeof wrapped !== 'function') {
    throw new Error('Should return handler function');
  }
});

testAsync('withGovernor blocks unsafe content', async () => {
  const handler = async (_req, res) => {
    res.json({ message: 'You have sleep apnea. Take supplements.' });
  };
  
  const wrapped = withGovernor(handler, { 
    domain: 'wearables', 
    onViolation: 'block' 
  });
  
  const req = createMockRequest();
  const res = createMockResponse();
  
  await wrapped(req, res);
  
  const data = res.getJsonData();
  if (!data.error) {
    throw new Error('Should block unsafe content');
  }
  if (!data.violations || data.violations.length === 0) {
    throw new Error('Should include violations');
  }
});

testAsync('withGovernor allows safe content', async () => {
  const safeMessage = 'Your sleep quality varies from your baseline.';
  const handler = async (_req, res) => {
    res.json({ message: safeMessage });
  };
  
  const wrapped = withGovernor(handler, { 
    domain: 'wearables', 
    onViolation: 'block' 
  });
  
  const req = createMockRequest();
  const res = createMockResponse();
  
  await wrapped(req, res);
  
  const data = res.getJsonData();
  if (data.error) {
    throw new Error('Should allow safe content');
  }
  if (data.message !== safeMessage) {
    throw new Error('Safe content should pass through');
  }
});

testAsync('withGovernor handles handler errors', async () => {
  const handler = async (_req, _res) => {
    throw new Error('Handler error');
  };
  
  const wrapped = withGovernor(handler, { domain: 'core' });
  
  const req = createMockRequest();
  const res = createMockResponse();
  
  await wrapped(req, res);
  
  const data = res.getJsonData();
  if (!data.error) {
    throw new Error('Should handle errors gracefully');
  }
  if (res.getStatusCode() !== 500) {
    throw new Error('Should return 500 for handler errors');
  }
});

testAsync('withGovernor attaches validator to request', async () => {
  const handler = async (req, res) => {
    if (!req.validator) {
      throw new Error('Validator not found on request');
    }
    res.json({ success: true });
  };
  
  const wrapped = withGovernor(handler, { domain: 'bci' });
  
  const req = createMockRequest();
  const res = createMockResponse();
  
  await wrapped(req, res);
  
  // If we got here without throwing, validator was attached
  const data = res.getJsonData();
  if (!data.success) {
    throw new Error('Handler did not execute correctly');
  }
});

// ============================================================================
// Integration Tests
// ============================================================================

testAsync('Express middleware works with multiple fields', async () => {
  const middleware = governorValidator({ 
    domain: 'wearables', 
    onViolation: 'sanitize' 
  });
  const req = createMockRequest();
  const res = createMockResponse();
  const next = createMockNext();
  
  await middleware(req, res, next);
  
  res.json({ 
    message: 'You should rest.',
    content: 'Your HRV is normal.',
    metadata: { source: 'AI' },
  });
  
  const data = res.getJsonData();
  // Sanitize mode is deprecated - unsafe content is blocked
  if (!data.message.includes('⚠️ Content blocked')) {
    throw new Error('Unsafe field should be blocked (sanitize mode deprecated)');
  }
  // Safe content should pass through
  if (data.content !== 'Your HRV is normal.') {
    throw new Error('Safe field modified incorrectly');
  }
});

testAsync('Next.js middleware preserves response structure', async () => {
  const handler = async (_req, res) => {
    res.json({ 
      data: { value: 42 },
      message: 'Data processed',
      timestamp: Date.now(),
    });
  };
  
  const wrapped = withGovernor(handler, { domain: 'core' });
  
  const req = createMockRequest();
  const res = createMockResponse();
  
  await wrapped(req, res);
  
  const data = res.getJsonData();
  if (!data.data || data.data.value !== 42) {
    throw new Error('Response structure not preserved');
  }
  if (!data.timestamp) {
    throw new Error('Response fields missing');
  }
});

// ============================================================================
// Performance Tests
// ============================================================================

testAsync('Middleware validation is fast (<50ms overhead)', async () => {
  const middleware = governorValidator({ domain: 'wearables' });
  const req = createMockRequest();
  const res = createMockResponse();
  const next = createMockNext();
  
  const start = Date.now();
  await middleware(req, res, next);
  res.json({ message: 'Test message for performance.' });
  const elapsed = Date.now() - start;
  
  if (elapsed > 50) {
    throw new Error(`Middleware too slow: ${elapsed}ms`);
  }
});

// ============================================================================
// Results
// ============================================================================

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Tests: ${passed} passed, ${failed} failed`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

process.exit(failed > 0 ? 1 : 0);
