#!/usr/bin/env node

/**
 * MCP Server for Governor HQ Constitutional Framework - Therapy Package
 * Exposes therapy and mental health data safety constraints as context to AI assistants
 */

const { BaseGovernorMCPServer } = require('@yelabb/constitution-core');

class GovernorHQMCPServer extends BaseGovernorMCPServer {
  constructor() {
    super({
      serverName: 'governor-hq-constitution-therapy',
      uriScheme: 'governor-therapy',
      version: '1.0.0',
      baseDir: __dirname,
      resources: {
        'hard-rules': '../../pages/constraints/hard-rules.mdx',
        'language-rules': '../../pages/constraints/language-rules.mdx',
        'quick-reference': '../../pages/quick-reference.mdx',
        'what-we-dont-do': '../../pages/what-we-dont-do.mdx',
        'ai-agent-guide': '../../pages/ai-agent-guide.mdx',
        'signals': '../../pages/core/signals.mdx',
        'baseline': '../../pages/core/baseline.mdx',
      },
      contextSummary: `
# Governor HQ Constitutional Framework - Therapy/Mental Health Data Context

🛡️ **AI Safety Layer for Therapy & Mental Wellbeing Data Projects**

This context enforces safety constraints for AI-generated code that processes therapy, mood, and emotional wellbeing data.

## Critical Rules (Always Apply):
1. ❌ NO mental health diagnoses (depression, anxiety, PTSD, etc.)
2. ❌ NO therapy recommendations or treatment advice
3. ❌ NO medication suggestions or dosage guidance
4. ❌ NO crisis intervention (must refer to professionals)
5. ❌ NO commanding language (must, should, need to)

## Therapy-Specific Constraints:
- ❌ Never diagnose mental health conditions
- ❌ No "you have" or "you are experiencing" diagnostic language
- ❌ No treatment plans or therapeutic interventions
- ❌ No suicide risk assessments (always refer to crisis lines)
- ❌ No replacing licensed therapist guidance
- ✓ Journaling and mood tracking observation only
- ✓ Pattern recognition without diagnosis
- ✓ Supportive language without medical framing

## Before Generating Code:
- ✓ Check if personal baseline is required (30-90 days)
- ✓ Validate user-facing text against language rules
- ✓ Include crisis resources (988, local hotlines)
- ✓ Use non-diagnostic observation language
- ✓ Default framing: "tracking patterns" not "analyzing symptoms"

## Crisis Situations:
- ALWAYS include professional resources
- NEVER attempt to assess risk
- Refer to: 988 Suicide & Crisis Lifeline (US), local emergency services

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
        'ai-agent-guide': 'Complete implementation guidance for therapy apps',
        'signals': 'Understanding mood/wellbeing data limitations',
        'baseline': 'Personal baseline requirements for emotional patterns',
      },
    });
  }
}

if (require.main === module) {
  const server = new GovernorHQMCPServer();
  server.start();
}

module.exports = GovernorHQMCPServer;
