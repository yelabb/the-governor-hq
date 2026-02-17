#!/usr/bin/env node
"use strict";
/**
 * MCP Server for Governor HQ Constitutional Framework - BCI Package
 * Exposes brain-computer interface data safety constraints as context to AI assistants
 */
Object.defineProperty(exports, "__esModule", { value: true });
const constitution_core_1 = require("@the-governor-hq/constitution-core");
class GovernorHQMCPServer extends constitution_core_1.BaseGovernorMCPServer {
    constructor() {
        super({
            serverName: 'governor-hq-constitution-bci',
            uriScheme: 'governor-bci',
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
`,
            resourceDescriptions: {
                'hard-rules': 'Absolute system limits that override everything',
                'language-rules': 'Required tone and wording controls',
                'quick-reference': 'One-page cheat sheet for validation',
                'what-we-dont-do': 'Scope boundaries and forbidden domains',
                'ai-agent-guide': 'Complete implementation guidance for BCI',
                'signals': 'Understanding neural data limitations',
                'baseline': 'Personal baseline requirements for brain data',
            },
        });
    }
}
if (require.main === module) {
    const server = new GovernorHQMCPServer();
    server.start();
}
exports.default = GovernorHQMCPServer;
//# sourceMappingURL=mcp-server.js.map