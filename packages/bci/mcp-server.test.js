#!/usr/bin/env node

/**
 * Test suite for BCI MCP Server
 */

const GovernorHQMCPServer = require('./mcp-server');

function runTests() {
  console.log('🧪 Testing BCI MCP Server...\n');

  const server = new GovernorHQMCPServer();
  let passed = 0;
  let failed = 0;

  // Test 1: Initialize
  try {
    const result = server.handleRequest({ method: 'initialize', params: {} });
    if (result.serverInfo.name === 'governor-hq-constitution-bci') {
      console.log('✓ Initialize test passed');
      passed++;
    } else {
      throw new Error('Invalid server name');
    }
  } catch (error) {
    console.log('✗ Initialize test failed:', error.message);
    failed++;
  }

  // Test 2: List resources
  try {
    const result = server.handleRequest({ method: 'resources/list', params: {} });
    if (result.resources && result.resources.length > 0) {
      console.log('✓ List resources test passed');
      passed++;
    } else {
      throw new Error('No resources returned');
    }
  } catch (error) {
    console.log('✗ List resources test failed:', error.message);
    failed++;
  }

  // Test 3: Get context summary
  try {
    const result = server.handleRequest({ method: 'context/summary', params: {} });
    if (result.summary && result.summary.includes('BCI')) {
      console.log('✓ Context summary test passed');
      passed++;
    } else {
      throw new Error('Invalid summary');
    }
  } catch (error) {
    console.log('✗ Context summary test failed:', error.message);
    failed++;
  }

  // Summary
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Tests: ${passed} passed, ${failed} failed`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  process.exit(failed > 0 ? 1 : 0);
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
