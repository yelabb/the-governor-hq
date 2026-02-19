# Welcome Examples

**See the Governor HQ Constitutional Framework in action with real-world examples.**

This guide shows you exactly what the framework does and how it protects your application from generating dangerous health-related code.

---

## Table of Contents

- [Quick Demo](#quick-demo)
- [Before & After Examples](#before--after-examples)
- [Runtime Validator Examples](#runtime-validator-examples)
- [Middleware Examples](#middleware-examples)
- [MCP Server Examples](#mcp-server-examples)
- [Real Terminal Sessions](#real-terminal-sessions)

---

## Quick Demo

### Install & Set Up (two commands)

```bash
npm install --save-dev @the-governor-hq/constitution-wearables
npx governor-install
```

**What you'll see:**

```
✓ Created .cursorrules (Cursor AI safety rules)
✓ Created .vscode/settings.json (Copilot instructions)
✓ Created .mcp-config.json (Claude Desktop integration)
✓ Updated package.json (added ai:context and validation scripts)
```

### Validate Your Code

```bash
npm run validate:safety
```

**Output:**

```
🛡️  Governor HQ Safety Validation Suite
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Core Package - Unit Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ Runtime Validator Tests...
✓ All 30 tests passed

▶ Middleware Tests...
✓ All 25 tests passed

▶ Pattern Matcher Tests...
✓ All 60 tests passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Validation Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Test Suites: 4
✓ Passed:          4
✗ Failed:          0
⊘ Skipped:         1 (eval system - no API key)

✅ All safety validations PASSED
```

---

## Before & After Examples

### Example 1: Sleep Analysis Feature

#### ❌ Before Governor HQ

```typescript
// AI might generate this UNSAFE code
async function analyzeSleep(sleepData: SleepMetrics) {
  if (sleepData.deepSleep < 60) {
    return {
      diagnosis: "You have insomnia",
      alert: "CRITICAL: This indicates a serious sleep disorder",
      treatment: "Take 5mg melatonin 30 minutes before bed",
      recommendation: "You must see a sleep specialist immediately"
    };
  }
}
```

**Problems:**
- ❌ Medical diagnosis ("you have insomnia")
- ❌ Supplement recommendation with dosage ("5mg melatonin")
- ❌ Treatment language ("take", "treatment")
- ❌ Alarming tone ("CRITICAL", "serious disorder")
- ❌ Commanding language ("you must")
- ❌ No personal baseline

#### ✅ After Governor HQ

```typescript
// AI generates this SAFE code instead
async function analyzeSleep(
  sleepData: SleepMetrics, 
  userBaseline: PersonalBaseline
) {
  // Baseline gate (REQUIRED)
  if (userBaseline.status !== 'STABLE') {
    return null; // Still learning baseline (30-90 days)
  }
  
  // Personal baseline comparison (not population average)
  if (sleepData.deepSleep < userBaseline.deepSleep - 2 * userBaseline.stdDev) {
    return {
      title: "Pattern Update", // Neutral tone
      message: "Your deep sleep is lower than your recent norm. This pattern has been observed for 3 nights. When you're ready, consider an earlier bedtime or reviewing your evening routine. Based on your personal trends. Not medical advice.",
      tone: "neutral",
      context: {
        comparison: "personal_baseline",
        duration: "72_hours",
        significance: "2_std_deviations"
      },
      suggestion: {
        framing: "optional",
        type: "behavioral",
        healthcare_ref: "Discuss persistent patterns with a healthcare professional."
      }
    };
  }
}
```

**Safe because:**
- ✅ Personal baseline required (not population average)
- ✅ Baseline gate prevents suggestions during learning phase
- ✅ Neutral tone ("Pattern Update", not "WARNING")
- ✅ Optional framing ("consider", "when you're ready")
- ✅ No diagnosis or disease naming
- ✅ No supplement recommendations
- ✅ Behavioral suggestions only
- ✅ Explicit disclaimer
- ✅ Healthcare professional reference

---

### Example 2: HRV Recovery Feature

#### ❌ Before Governor HQ

```typescript
// UNSAFE: What AI might generate without constraints
function getRecoveryAdvice(hrv: number) {
  if (hrv < 50) {
    return "Your low HRV indicates you're overtrained and at risk of cardiovascular problems. You should take magnesium supplements and rest for at least 3 days. This will prevent injury and help you recover faster.";
  }
}
```

**Violations:**
- Medical claim ("cardiovascular problems")
- Disease implication ("overtrained")
- Supplement recommendation ("magnesium supplements")
- Treatment language ("prevent injury", "help you recover")
- Commanding language ("you should")
- No personal baseline

#### ✅ After Governor HQ

```typescript
// SAFE: What AI generates with Governor HQ
function getRecoveryAdvice(
  hrv: number, 
  userBaseline: HRVBaseline,
  recentWorkload: TrainingData
) {
  if (!userBaseline.isStable) {
    return null; // Baseline still forming
  }
  
  const deviation = (hrv - userBaseline.mean) / userBaseline.stdDev;
  
  if (deviation < -2) {
    return {
      observation: `Your HRV is ${Math.abs(deviation).toFixed(1)} standard deviations below your personal baseline.`,
      context: `This often appears after periods of high training load or variable sleep quality.`,
      suggestion: {
        text: "You might consider lighter activity today.",
        type: "behavioral",
        optional: true
      },
      timeline: "Your personal baseline suggests recovery typically takes 24-48 hours.",
      disclaimer: "Based on your personal patterns. Not medical advice."
    };
  }
}
```

---

## Runtime Validator Examples

### Example 1: Basic Validation

```typescript
import { createValidator } from '@the-governor-hq/constitution-core';

const validator = createValidator({
  domain: 'wearables',
  onViolation: 'block'
});

// Unsafe text
const unsafe = 'You have sleep apnea. Take melatonin supplements.';
const result1 = validator.validateSync(unsafe);

console.log(result1);
```

**Output:**

```javascript
{
  safe: false,
  output: '⚠️ Content blocked by safety validator. Reason: Medical diagnosis and supplement recommendation detected',
  violations: [
    {
      rule: 'forbidden-patterns',
      severity: 'critical',
      message: 'Forbidden medical/treatment language detected: you have, sleep apnea, take, melatonin, supplements',
      matched: ['you have', 'sleep apnea', 'take', 'melatonin', 'supplements']
    }
  ],
  confidence: 0.0,
  safeAlternative: 'Your sleep patterns show variation. Consider discussing patterns with a healthcare professional. Not medical advice.',
  metadata: {
    latencyMs: 3,
    rulesChecked: 52,
    domain: 'wearables',
    action: 'block',
    usedLLMJudge: false
  }
}
```

### Example 2: Block Mode (Recommended)

> **⚠️ Note**: Sanitize mode is deprecated. Use block mode instead.

```typescript
const validator = createValidator({
  domain: 'therapy',
  onViolation: 'block'
});

const text = 'You should exercise more to treat your depression.';
const result = validator.validateSync(text);

console.log(result.output);
// Output: "⚠️ Content blocked by safety validator. Reason: contains medical claims..."
console.log(result.safeAlternative);
// Output: "I can help track patterns, but for mental health support or concerns, please reach out to a mental health professional."
```

### Example 3: Custom Rules

```typescript
const validator = createValidator({
  domain: 'wearables',
  customRules: [
    {
      id: 'no-comparisons-to-others',
      description: 'Prevent comparing users to population averages',
      severity: 'high',
      check: (text) => {
        const forbiddenPhrases = ['average person', 'most people', 'others your age'];
        return forbiddenPhrases.some(phrase => text.toLowerCase().includes(phrase));
      },
      violation: 'Comparison to population average detected'
    }
  ]
});

const result = validator.validateSync('Most people have better sleep than you.');

console.log(result.violations);
// Contains custom rule violation
```

---

## Middleware Examples

### Express Example

```typescript
// server.ts
import express from 'express';
import { governorValidator } from '@the-governor-hq/constitution-core/middleware';

const app = express();

app.post('/api/ai/insights', 
  governorValidator({ domain: 'wearables', onViolation: 'block' }),
  async (req, res) => {
    const userMessage = req.body.message;
    const aiResponse = await callLLM(userMessage);
    
    // Response is auto-validated before sending
    res.json({ message: aiResponse });
  }
);

app.listen(3000);
```

**Request/Response:**

```bash
# Request
curl -X POST http://localhost:3000/api/ai/insights \
  -H "Content-Type: application/json" \
  -d '{"message": "Why is my HRV low?"}'

# Response (unsafe content blocked)
{
  "error": "Content validation failed",
  "message": "Your HRV pattern differs from your baseline. Consider discussing with a healthcare professional.",
  "violations": [
    {
      "rule": "forbidden-patterns",
      "severity": "critical"
    }
  ]
}
```

### Next.js API Route Example

```typescript
// pages/api/chat.ts
import { withGovernor } from '@the-governor-hq/constitution-core/middleware';

export default withGovernor(
  async (req, res) => {
    const { message } = req.body;
    const aiResponse = await generateAIResponse(message);
    
    res.json({ response: aiResponse });
  },
  { domain: 'therapy', onViolation: 'block' }
);
```

### Field-Specific Validation

```typescript
import { validateField } from '@the-governor-hq/constitution-core/middleware';

// Only validate the 'analysis.summary' field
app.post('/api/analyze',
  validateField('analysis.summary', { domain: 'bci' }),
  async (req, res) => {
    const analysis = await analyzeData(req.body);
    
    res.json({
      analysis: {
        summary: analysis.summary, // This field is validated
        rawData: analysis.data,     // This field is not validated
        metadata: analysis.meta
      }
    });
  }
);
```

---

## MCP Server Examples

### Starting the MCP Server

```bash
npm run ai:context
```

**Output:**

```
🤖 Governor HQ Constitution MCP Server (Wearables)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server Name:    governor-hq-constitution
URI Scheme:     governor
Protocol:       Model Context Protocol v1.0
Resources:      7 available

Available Resources:
  • governor://hard-rules          - 5 absolute safety boundaries
  • governor://language-rules       - Tone and phrasing constraints
  • governor://quick-reference      - Decision trees and checklists
  • governor://what-we-dont-do      - Explicit prohibited behaviors
  • governor://baseline             - Personal baseline requirements
  • governor://signals              - Data sources and limitations
  • governor://ai-agent-guide       - Complete integration guide

Server ready. Waiting for MCP client connection...
```

### Claude Desktop Integration

**File:** `~/.config/Claude/claude_desktop_config.json` (Mac/Linux)  
**File:** `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "governor-wearables": {
      "command": "node",
      "args": [
        "/path/to/your/project/node_modules/@the-governor-hq/constitution-wearables/dist/mcp-server.js"
      ],
      "env": {}
    }
  }
}
```

**Then in Claude Desktop:**

```
User: "Generate code to analyze HRV and sleep data"

Claude: [With Governor HQ context]
"Here's safe code that uses personal baselines and avoids medical claims:

function analyzeRecovery(hrv: number, userBaseline: Baseline) {
  if (!userBaseline.isStable) return null;
  
  // Personal comparison, not population average
  if (hrv < userBaseline.mean - 2*userBaseline.stdDev) {
    return {
      message: "Your HRV is lower than your norm. Consider lighter activity.",
      disclaimer: "Not medical advice."
    };
  }
}
```

---

## Real Terminal Sessions

### Session 1: Running Safety Validation

```bash
$ cd my-health-app
$ npm install --save-dev @the-governor-hq/constitution-wearables

added 1 package in 2.8s

✓ Created .cursorrules
✓ Created .vscode/settings.json
✓ Created .mcp-config.json
✓ Updated package.json

$ npm run validate:safety

🛡️  Governor HQ Safety Validation Suite

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Core Package - Unit Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ Runtime Validator Tests...
✓ checkForbiddenPatterns detects medical claims
✓ checkPrescriptiveLanguage detects commanding language
✓ Validator blocks medical claims
✓ Validator blocks supplement recommendations
... (30 tests total)
✓ Runtime Validator Tests passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Validation Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Test Suites: 4
✓ Passed:          4
✗ Failed:          0

✅ All safety validations PASSED
   4/4 test suites successful.
```

### Session 2: CLI Validator

```bash
$ npx governor-validate src/components/InsightCard.tsx

🔍 Validating: src/components/InsightCard.tsx

Line 42: ❌ VIOLATION (Critical)
  Text: "You have low HRV. This indicates cardiovascular stress."
  Rule: forbidden-patterns
  Issue: Medical diagnosis language detected

Line 45: ❌ VIOLATION (Critical)
  Text: "Take magnesium supplements before bed."
  Rule: forbidden-patterns
  Issue: Supplement recommendation detected

Line 48: ⚠️  VIOLATION (Medium)
  Text: "You should rest immediately."
  Rule: prescriptive-language
  Issue: Commanding language detected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: src/components/InsightCard.tsx
✗ 3 violations found (2 critical, 1 medium)

Exitcode: 1 (failed)
```

### Session 3: Testing with Different Modes

```typescript
// test-validator.ts
import { createValidator } from '@the-governor-hq/constitution-core';

const text = 'You should take vitamin D for better sleep.';

// Test 1: Block mode (recommended, replaces deprecated sanitize mode)
const blockValidator = createValidator({ onViolation: 'block' });
console.log('BLOCK MODE:', blockValidator.validateSync(text).output);
// Output: "⚠️ Content blocked by safety validator..."

// Test 2: Warn mode (allows but logs)
const warnValidator = createValidator({ onViolation: 'warn' });
console.log('WARN MODE:', warnValidator.validateSync(text).output);
// Console: ⚠️ Safety violation detected: Supplement recommendation
// Output: "You should take vitamin D for better sleep." (unchanged)
```

---

## Next Steps

1. **Install in your project:**  
   `npm install --save-dev @the-governor-hq/constitution-wearables`

2. **Try the examples above** in your own code

3. **Run validation:**  
   `npm run validate:safety`

4. **Read the full docs:**  
   https://the-governor-hq.vercel.app

5. **Open an issue if you find a violation we missed:**  
   https://github.com/the-governor-hq/constitution/issues

---

## More Resources

- [Main README](../../README.md) — Project overview
- [TESTING.md](packages/core/TESTING.md) — Complete testing guide
- [EXAMPLE.md](EXAMPLE.md) — End-to-end tutorial
- [Documentation Site](https://the-governor-hq.vercel.app) — Full guides

**Questions?** Open a discussion: https://github.com/the-governor-hq/constitution/discussions
