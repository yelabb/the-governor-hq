#!/usr/bin/env node

/**
 * MCP Server for Governor HQ Constitutional Framework
 * Exposes wearable data safety constraints as context to AI assistants
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class GovernorHQMCPServer {
  constructor() {
    this.resources = {
      'hard-rules': './pages/constraints/hard-rules.mdx',
      'language-rules': './pages/constraints/language-rules.mdx',
      'quick-reference': './pages/quick-reference.mdx',
      'what-we-dont-do': './pages/what-we-dont-do.mdx',
      'ai-agent-guide': './pages/ai-agent-guide.mdx',
      'signals': './pages/core/signals.mdx',
      'baseline': './pages/core/baseline.mdx',
    };
  }

  readResource(name) {
    const resourcePath = this.resources[name];
    if (!resourcePath) {
      return null;
    }

    const fullPath = path.join(__dirname, resourcePath);
    try {
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
      console.error(`Error reading resource ${name}:`, error.message);
      return null;
    }
  }

  getContextSummary() {
    return `
# Governor HQ Constitutional Framework - Active Context

🛡️ **AI Safety Layer for Wearable Health Data Projects**

This context enforces safety constraints for AI-generated code that processes biometric data.

## Critical Rules (Always Apply):
1. ❌ No medical claims, diagnoses, or treatment advice
2. ❌ No supplements, vitamins, or dosages mentioned
3. ❌ No disease names or medical conditions
4. ❌ No treatment language (cure, prevent, treat, heal)
5. ❌ No commanding language (must, should, need to)

## Before Generating Code:
- ✓ Check if personal baseline is required
- ✓ Validate user-facing text against language rules
- ✓ Confirm feature is within scope boundaries
- ✓ Use optional framing ("consider", "might")

## Quick Validation:
- Compare to personal baseline (not population average)
- Use calm, non-alarmist tone
- Include disclaimers for suggestions
- Gate recommendations behind baseline stability

**For detailed guidance, request specific resources:**
- "hard-rules" - Absolute constraints
- "language-rules" - Validate text
- "quick-reference" - Decision flowcharts
- "what-we-dont-do" - Scope boundaries
- "ai-agent-guide" - Implementation patterns

When uncertain: DEFAULT TO NO, then confirm with documentation.
`;
  }

  handleRequest(request) {
    const { method, params } = request;

    switch (method) {
      case 'initialize':
        return {
          protocolVersion: '1.0.0',
          serverInfo: {
            name: 'governor-hq-constitution',
            version: '1.0.0',
          },
          capabilities: {
            resources: {
              listChanged: false,
            },
          },
        };

      case 'resources/list':
        return {
          resources: Object.keys(this.resources).map((name) => ({
            uri: `governor://${name}`,
            name: name,
            mimeType: 'text/markdown',
            description: this.getResourceDescription(name),
          })),
        };

      case 'resources/read':
        if (params?.uri) {
          const name = params.uri.replace('governor://', '');
          const content = this.readResource(name);
          if (content) {
            return {
              contents: [
                {
                  uri: params.uri,
                  mimeType: 'text/markdown',
                  text: content,
                },
              ],
            };
          }
        }
        throw new Error('Resource not found');

      case 'context/summary':
        return {
          summary: this.getContextSummary(),
        };

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  getResourceDescription(name) {
    const descriptions = {
      'hard-rules': 'Absolute system limits that override everything',
      'language-rules': 'Required tone and wording controls',
      'quick-reference': 'One-page cheat sheet for validation',
      'what-we-dont-do': 'Scope boundaries and forbidden domains',
      'ai-agent-guide': 'Complete implementation guidance',
      'signals': 'Understanding wearable data limitations',
      'baseline': 'Personal baseline requirements',
    };
    return descriptions[name] || '';
  }

  start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on('line', (line) => {
      try {
        const request = JSON.parse(line);
        const response = this.handleRequest(request);
        console.log(JSON.stringify({ id: request.id, result: response }));
      } catch (error) {
        console.log(
          JSON.stringify({
            id: request?.id || null,
            error: { message: error.message },
          })
        );
      }
    });

    // Send initialization ready on startup
    console.log(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialized',
        params: {},
      })
    );
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new GovernorHQMCPServer();
  server.start();
}

module.exports = GovernorHQMCPServer;
