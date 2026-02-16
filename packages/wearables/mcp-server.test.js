/**
 * Tests for Governor HQ MCP Server
 * 
 * Run with: node mcp-server.test.js
 */

const GovernorHQMCPServer = require('./mcp-server');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('\n🧪 Governor HQ MCP Server Tests\n');
    console.log('='.repeat(60));

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        this.passed++;
        console.log(`✅ ${name}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log('='.repeat(60));
    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed\n`);
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${expected}, got ${actual}`
      );
    }
  }

  assertIncludes(text, substring, message) {
    if (!text.includes(substring)) {
      throw new Error(
        message || `Expected text to include "${substring}"`
      );
    }
  }
}

// Initialize test runner
const runner = new TestRunner();

// Test: Server initialization
runner.test('Server initializes correctly', () => {
  const server = new GovernorHQMCPServer();
  runner.assert(server instanceof GovernorHQMCPServer, 'Server instance created');
  runner.assert(server.resources, 'Resources map exists');
  runner.assert(Object.keys(server.resources).length > 0, 'Resources are defined');
});

// Test: Initialize request
runner.test('Handles initialize request', () => {
  const server = new GovernorHQMCPServer();
  const response = server.handleRequest({
    id: 1,
    method: 'initialize',
    params: {},
  });

  runner.assertEqual(response.protocolVersion, '1.0.0', 'Protocol version is 1.0.0');
  runner.assertEqual(response.serverInfo.name, 'governor-hq-constitution', 'Server name is correct');
  runner.assert(response.capabilities, 'Capabilities defined');
});

// Test: List resources
runner.test('Lists all resources', () => {
  const server = new GovernorHQMCPServer();
  const response = server.handleRequest({
    id: 2,
    method: 'resources/list',
    params: {},
  });

  runner.assert(Array.isArray(response.resources), 'Resources is an array');
  runner.assert(response.resources.length > 0, 'Resources array is not empty');
  
  const hardRules = response.resources.find(r => r.name === 'hard-rules');
  runner.assert(hardRules, 'hard-rules resource exists');
  runner.assertEqual(hardRules.mimeType, 'text/markdown', 'Resource has correct mime type');
  runner.assert(hardRules.uri.startsWith('governor://'), 'Resource URI has correct scheme');
});

// Test: Read specific resource
runner.test('Reads hard-rules resource', () => {
  const server = new GovernorHQMCPServer();
  const response = server.handleRequest({
    id: 3,
    method: 'resources/read',
    params: { uri: 'governor://hard-rules' },
  });

  runner.assert(response.contents, 'Response has contents');
  runner.assert(response.contents.length > 0, 'Contents array is not empty');
  runner.assert(response.contents[0].text, 'Content has text');
  runner.assertIncludes(
    response.contents[0].text.toLowerCase(),
    'medical',
    'Content mentions medical restrictions'
  );
});

// Test: Read language-rules resource
runner.test('Reads language-rules resource', () => {
  const server = new GovernorHQMCPServer();
  const response = server.handleRequest({
    id: 4,
    method: 'resources/read',
    params: { uri: 'governor://language-rules' },
  });

  runner.assert(response.contents[0].text, 'Language rules content exists');
  runner.assertIncludes(
    response.contents[0].text.toLowerCase(),
    'language',
    'Content discusses language rules'
  );
});

// Test: Read quick-reference resource
runner.test('Reads quick-reference resource', () => {
  const server = new GovernorHQMCPServer();
  const response = server.handleRequest({
    id: 5,
    method: 'resources/read',
    params: { uri: 'governor://quick-reference' },
  });

  runner.assert(response.contents[0].text, 'Quick reference content exists');
});

// Test: Context summary
runner.test('Generates context summary', () => {
  const server = new GovernorHQMCPServer();
  const summary = server.getContextSummary();

  runner.assert(summary, 'Summary exists');
  runner.assertIncludes(summary, 'Critical Rules', 'Summary includes critical rules');
  runner.assertIncludes(summary, 'No medical claims', 'Summary mentions medical claims prohibition');
  runner.assertIncludes(summary, 'No supplements', 'Summary mentions supplements prohibition');
  runner.assertIncludes(summary, 'personal baseline', 'Summary mentions baseline requirement');
});

// Test: Invalid resource request
runner.test('Handles invalid resource request', () => {
  const server = new GovernorHQMCPServer();
  
  try {
    server.handleRequest({
      id: 6,
      method: 'resources/read',
      params: { uri: 'governor://non-existent-resource' },
    });
    throw new Error('Should have thrown an error');
  } catch (error) {
    runner.assertEqual(error.message, 'Resource not found', 'Correct error message');
  }
});

// Test: Invalid method
runner.test('Handles invalid method', () => {
  const server = new GovernorHQMCPServer();
  
  try {
    server.handleRequest({
      id: 7,
      method: 'invalid/method',
      params: {},
    });
    throw new Error('Should have thrown an error');
  } catch (error) {
    runner.assertIncludes(error.message, 'Unknown method', 'Error mentions unknown method');
  }
});

// Test: Resource file existence
runner.test('All resource files exist', () => {
  const server = new GovernorHQMCPServer();
  
  for (const [name, relativePath] of Object.entries(server.resources)) {
    const fullPath = path.join(__dirname, relativePath);
    runner.assert(
      fs.existsSync(fullPath),
      `Resource file exists: ${relativePath}`
    );
  }
});

// Test: Resource descriptions
runner.test('All resources have descriptions', () => {
  const server = new GovernorHQMCPServer();
  
  for (const name of Object.keys(server.resources)) {
    const description = server.getResourceDescription(name);
    runner.assert(
      description && description.length > 0,
      `Resource ${name} has a description`
    );
  }
});

// Test: Critical constraint validation
runner.test('Hard rules contain all critical constraints', () => {
  const server = new GovernorHQMCPServer();
  const content = server.readResource('hard-rules');
  
  runner.assert(content, 'Hard rules content exists');
  
  // Check for critical constraint mentions
  const lowerContent = content.toLowerCase();
  runner.assertIncludes(lowerContent, 'medical', 'Mentions medical restrictions');
  runner.assertIncludes(lowerContent, 'supplement', 'Mentions supplement restrictions');
  runner.assertIncludes(lowerContent, 'diagnos', 'Mentions diagnosis restrictions');
});

// Test: Language rules validation patterns
runner.test('Language rules contain validation patterns', () => {
  const server = new GovernorHQMCPServer();
  const content = server.readResource('language-rules');
  
  runner.assert(content, 'Language rules content exists');
  
  const lowerContent = content.toLowerCase();
  runner.assert(
    lowerContent.includes('consider') || lowerContent.includes('might') || lowerContent.includes('optional'),
    'Contains examples of allowed phrasing'
  );
});

// Test: Resource integrity
runner.test('All resources contain substantive content', () => {
  const server = new GovernorHQMCPServer();
  
  for (const name of Object.keys(server.resources)) {
    const content = server.readResource(name);
    runner.assert(content, `Resource ${name} has content`);
    runner.assert(
      content.length > 100,
      `Resource ${name} has substantive content (>${content?.length || 0} chars)`
    );
  }
});

// Test: MCP protocol compliance
runner.test('Response format is MCP-compliant', () => {
  const server = new GovernorHQMCPServer();
  const response = server.handleRequest({
    id: 8,
    method: 'resources/list',
    params: {},
  });

  // Check MCP resource list format
  runner.assert(response.resources, 'Has resources array');
  
  if (response.resources.length > 0) {
    const resource = response.resources[0];
    runner.assert(resource.uri, 'Resource has URI');
    runner.assert(resource.name, 'Resource has name');
    runner.assert(resource.mimeType, 'Resource has mimeType');
  }
});

// Test: Baseline requirement enforcement
runner.test('Documentation emphasizes baseline requirement', () => {
  const server = new GovernorHQMCPServer();
  const baselineContent = server.readResource('baseline');
  const summary = server.getContextSummary();
  
  runner.assertIncludes(
    baselineContent.toLowerCase(),
    'baseline',
    'Baseline documentation mentions baseline'
  );
  runner.assertIncludes(
    summary.toLowerCase(),
    'baseline',
    'Summary mentions baseline requirement'
  );
});

// Test: Safety-first defaults
runner.test('Documentation promotes safety-first defaults', () => {
  const server = new GovernorHQMCPServer();
  const summary = server.getContextSummary();
  const whatWeDontDo = server.readResource('what-we-dont-do');
  
  runner.assertIncludes(
    summary.toLowerCase(),
    'default to no',
    'Summary includes default-to-no guidance'
  );
  runner.assert(
    whatWeDontDo,
    'what-we-dont-do resource exists for scope boundaries'
  );
});

// Run all tests
runner.run().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});
