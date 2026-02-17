#!/usr/bin/env node

/**
 * MCP Server for Governor HQ Constitutional Framework
 * Exposes wearable data safety constraints as context to AI assistants
 */

import { BaseGovernorMCPServer } from '@the-governor-hq/constitution-core';

class GovernorHQMCPServer extends BaseGovernorMCPServer {
  constructor() {
    super({
      serverName: 'governor-hq-constitution',
      uriScheme: 'governor',
      version: '1.0.0',
      baseDir: __dirname,
      resources: {
        'hard-rules': '../pages/constraints/hard-rules.mdx',
        'language-rules': '../pages/constraints/language-rules.mdx',
        'quick-reference': '../pages/quick-reference.mdx',
        'what-we-dont-do': '../pages/what-we-dont-do.mdx',
        'ai-agent-guide': '../pages/ai-agent-guide.mdx',
        'signals': '../pages/core/signals.mdx',
        'baseline': '../pages/core/baseline.mdx',
      },
      contextSummary: `
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
`,
      resourceDescriptions: {
        'hard-rules': 'Absolute system limits that override everything',
        'language-rules': 'Required tone and wording controls',
        'quick-reference': 'One-page cheat sheet for validation',
        'what-we-dont-do': 'Scope boundaries and forbidden domains',
        'ai-agent-guide': 'Complete implementation guidance',
        'signals': 'Understanding wearable data limitations',
        'baseline': 'Personal baseline requirements',
      },
    });
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new GovernorHQMCPServer();
  server.start();
}

export default GovernorHQMCPServer;
