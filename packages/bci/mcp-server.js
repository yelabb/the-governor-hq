#!/usr/bin/env node

/**
 * MCP Server for Governor HQ Constitutional Framework - BCI Package
 * Exposes brain-computer interface data safety constraints as context to AI assistants
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class GovernorHQMCPServer {
  constructor() {
    this.resources = {
      'hard-rules': '../../pages/constraints/hard-rules.mdx',
      'language-rules': '../../pages/constraints/language-rules.mdx',
      'quick-reference': '../../pages/quick-reference.mdx',
      'what-we-dont-do': '../../pages/what-we-dont-do.mdx',
      'ai-agent-guide': '../../pages/ai-agent-guide.mdx',
      'signals': '../../pages/core/signals.mdx',
      'baseline': '../../pages/core/baseline.mdx',
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
# Governor HQ Constitutional Framework - BCI Data Context

🛡️ **AI Safety Layer for Brain-Computer Interface Data Projects**

This context enforces safety constraints for AI-generated code that processes neural/brain data.

## Critical Rules (Always Apply):
1. ❌ No mental health diagnoses or cognitive assessments
2. ❌ No emotion/mood reading claims ("you are feeling...")
3. ❌ No brain state diagnosis (ADHD, depression, anxiety detection)
4. ❌ No medical claims about EEG/fNIRS patterns
5. ❌ No commanding language (must, should, need to)

## BCI-Specific Constraints:
- ❌ Never claim to "read thoughts" or "detect emotions"
- ❌ No correlation with mental health conditions
- ❌ No brain training efficacy claims without evidence
- ❌ Privacy: Neural data is especially sensitive
- ✓ Focus on attention/relaxation patterns only
- ✓ Compare to personal baseline, not diagnostic criteria

## Before Generating Code:
- ✓ Check if personal baseline is required (30-90 days)
- ✓ Validate user-facing text against language rules
- ✓ Ensure privacy protections for neural data
- ✓ Use optional framing ("consider", "might")

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
            name: 'governor-hq-constitution-bci',
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
            uri: `governor-bci://${name}`,
            name: name,
            mimeType: 'text/markdown',
            description: this.getResourceDescription(name),
          })),
        };

      case 'resources/read':
        if (params?.uri) {
          const name = params.uri.replace('governor-bci://', '');
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
      'ai-agent-guide': 'Complete implementation guidance for BCI',
      'signals': 'Understanding neural data limitations',
      'baseline': 'Personal baseline requirements for brain data',
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

    console.log(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialized',
        params: {},
      })
    );
  }
}

if (require.main === module) {
  const server = new GovernorHQMCPServer();
  server.start();
}

module.exports = GovernorHQMCPServer;
