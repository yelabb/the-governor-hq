# Runtime Validator Guide

## 🛡️ Hard Post-Generation Gate

**LLM → Validator → Output**

The Runtime Validator provides a hard safety gate that blocks unsafe AI-generated content in production. It validates LLM output against Governor HQ safety constraints before showing it to users.

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { createValidator } from '@the-governor-hq/constitution-core';

const validator = createValidator({
  domain: 'wearables',
  onViolation: 'block'
});

// Validate LLM output
const llmOutput = await callLLM(userPrompt);
const result = await validator.validate(llmOutput);

if (!result.safe) {
  console.error('Blocked:', result.violations);
  return result.safeAlternative; // Safe fallback response
}

return result.output; // Safe to show user
```

---

## 📦 Installation

Already included with `@the-governor-hq/constitution-core`:

```bash
npm install @the-governor-hq/constitution-core
```

---

## 🎯 Configuration Options

### ValidatorConfig

```typescript
interface ValidatorConfig {
  /** Domain-specific rules */
  domain?: 'core' | 'wearables' | 'bci' | 'therapy';
  
  /** Strict mode (uses LLM judge for edge cases) */
  strictMode?: boolean;
  
  /** Action on violation */
  onViolation?: 'block' | 'warn' | 'log' | 'sanitize';
  
  /** Use LLM judge for validation */
  useLLMJudge?: boolean;
  
  /** Custom validation rules */
  customRules?: ValidationRule[];
  
  /** API key for LLM judge */
  apiKey?: string;
  
  /** Custom safe message */
  defaultSafeMessage?: string;
}
```

### Actions Explained

- **`block`** - Replace unsafe content with safe alternative (production)
- **`sanitize`** - ⚠️ **DEPRECATED** - Previously attempted to fix unsafe patterns automatically. Now blocks content. Use `block` instead.
- **`warn`** - Log warning but allow content (development)
- **`log`** - Silent logging only (analytics)

> **⚠️ Deprecation Notice**: The `sanitize` mode is deprecated as of v3.3.0. Programmatic sanitization of medical/safety advice is unsafe because it semantically alters content in unpredictable ways. Use `block` mode instead.

---

## 🔧 Usage Patterns

### 1. Express.js API

```typescript
import express from 'express';
import { governorValidator } from '@the-governor-hq/constitution-core';

const app = express();

app.post('/api/chat',
  governorValidator({ domain: 'wearables', onViolation: 'block' }),
  async (req, res) => {
    const aiResponse = await callLLM(req.body.message);
    
    // Auto-validated before sending
    res.json({ message: aiResponse });
  }
);
```

### 2. Next.js Pages API

```typescript
import { withGovernor } from '@the-governor-hq/constitution-core';

export default withGovernor(
  async (req, res) => {
    const aiResponse = await generateResponse(req.body.prompt);
    res.json({ message: aiResponse });
  },
  { 
    domain: 'therapy',
    onViolation: 'block',
    strictMode: true 
  }
);
```

### 3. Next.js App Router (Route Handlers)

```typescript
import { NextResponse } from 'next/server';
import { validateResponse } from '@the-governor-hq/constitution-core';

export async function POST(request: Request) {
  const { message } = await request.json();
  const aiResponse = await callLLM(message);
  
  return validateResponse(
    NextResponse.json({ message: aiResponse }),
    { domain: 'bci', onViolation: 'block' }
  );
}
```

### 4. Standalone Validation

```typescript
import { createValidator } from '@the-governor-hq/constitution-core';

const validator = createValidator({
  domain: 'wearables',
  strictMode: process.env.NODE_ENV === 'production',
  onViolation: 'block'
});

async function processAIResponse(text: string) {
  const result = await validator.validate(text);
  
  if (!result.safe) {
    logger.error('Validation failed', {
      violations: result.violations,
      confidence: result.confidence
    });
    
    return {
      success: false,
      message: result.safeAlternative,
      blocked: true
    };
  }
  
  return {
    success: true,
    message: result.output,
    blocked: false
  };
}
```

### 5. Streaming Responses (Advanced)

```typescript
import { createValidator } from '@the-governor-hq/constitution-core';

const validator = createValidator({ domain: 'wearables' });

async function streamWithValidation(prompt: string) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages: [{ role: 'user', content: prompt }]
  });
  
  let buffer = '';
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    buffer += content;
    
    // Validate every 50 chars
    if (buffer.length >= 50) {
      const result = validator.validateSync(buffer);
      
      if (!result.safe) {
        stream.controller.abort();
        return result.safeAlternative;
      }
      
      yield content;
      buffer = '';
    }
  }
  
  // Final validation
  if (buffer.length > 0) {
    const result = validator.validateSync(buffer);
    if (!result.safe) {
      return result.safeAlternative;
    }
    yield buffer;
  }
}
```

---

## 🎨 Custom Validation Rules

```typescript
import { createValidator, ValidationRule, SeverityLevel } from '@the-governor-hq/constitution-core';

const customRules: ValidationRule[] = [
  {
    id: 'no-specific-brands',
    description: 'Avoid mentioning specific supplement brands',
    severity: 'medium',
    check: (text) => /\b(Nature Made|Garden of Life|NOW Foods)\b/i.test(text),
    violation: 'Specific supplement brand mentioned'
  },
  {
    id: 'no-financial-advice',
    description: 'No financial recommendations',
    severity: 'high',
    check: (text) => /\b(invest|buy|sell|stock)\b/i.test(text),
    violation: 'Financial advice detected'
  }
];

const validator = createValidator({
  domain: 'wearables',
  customRules,
  onViolation: 'block'
});
```

---

## 📊 Response Format

### ValidationResult

```typescript
interface ValidationResult {
  safe: boolean;              // Whether content passed validation
  output: string;             // Safe output (original or sanitized)
  violations: Violation[];    // List of violations found
  confidence: number;         // Confidence score (0-1)
  safeAlternative?: string;   // Auto-generated safe response
  metadata: {
    latencyMs: number;        // Validation time
    rulesChecked: number;     // Number of rules evaluated
    domain: Domain;           // Domain used
    action: ViolationAction;  // Action taken
    usedLLMJudge: boolean;   // Whether LLM judge was used
  };
}
```

### Example Response

```json
{
  "safe": false,
  "output": "⚠️ Content blocked by safety validator. Reason: contains medical claims or treatment language",
  "violations": [
    {
      "rule": "forbidden-patterns",
      "severity": "critical",
      "message": "Forbidden medical/treatment language detected: diagnose, treatment",
      "matched": ["diagnose", "treatment"]
    }
  ],
  "confidence": 0.2,
  "safeAlternative": "I can help you understand your wearable data patterns, but for health-related questions or concerns, please consult with a healthcare professional.",
  "metadata": {
    "latencyMs": 5,
    "rulesChecked": 53,
    "domain": "wearables",
    "action": "block",
    "usedLLMJudge": false
  }
}
```

---

## 🏭 Environment-Based Configuration

```typescript
const validator = createValidator({
  domain: 'wearables',
  
  // Development: Warn only, log violations
  strictMode: process.env.NODE_ENV === 'production',
  onViolation: process.env.NODE_ENV === 'production' ? 'block' : 'warn',
  
  // Production: Use LLM judge for edge cases
  useLLMJudge: process.env.NODE_ENV === 'production',
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### Recommended Setup

| Environment | `strictMode` | `onViolation` | `useLLMJudge` |
|------------|--------------|---------------|---------------|
| Development | `false` | `warn` | `false` |
| Staging | `true` | `block` | `true` |
| Production | `true` | `block` | `true` |

---

## ⚡ Performance

### Pattern Matching (Fast)
- **Latency:** < 10ms
- **Accuracy:** ~95%
- **Use case:** All environments

### LLM Judge (Accurate)
- **Latency:** 200-500ms
- **Accuracy:** ~99%
- **Use case:** Production only, edge cases

### Recommendation
Use pattern matching by default, enable LLM judge in production for critical applications.

---

## 🧪 Testing

```typescript
import { createValidator } from '@the-governor-hq/constitution-core';

describe('AI Response Validation', () => {
  const validator = createValidator({
    domain: 'wearables',
    onViolation: 'block'
  });
  
  test('blocks medical claims', () => {
    const unsafe = 'You have sleep apnea. Take melatonin.';
    const result = validator.validateSync(unsafe);
    
    expect(result.safe).toBe(false);
    expect(result.violations).toHaveLength(2);
    expect(result.safeAlternative).toBeDefined();
  });
  
  test('allows safe suggestions', () => {
    const safe = 'Your sleep patterns show variation. Consider discussing this with a healthcare professional.';
    const result = validator.validateSync(safe);
    
    expect(result.safe).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.output).toBe(safe);
  });
});
```

---

## 🔍 Debugging

Enable verbose logging:

```typescript
const validator = createValidator({
  domain: 'wearables',
  onViolation: 'warn', // Logs to console
});

// Manual inspection
const result = await validator.validate(text);
console.log('Validation result:', {
  safe: result.safe,
  violations: result.violations,
  confidence: result.confidence,
  latency: result.metadata.latencyMs
});
```

---

## 🚨 Common Patterns

### ❌ Blocked Content

```typescript
// Medical claims
"You have insomnia"
"This indicates sleep apnea"
"You need treatment"

// Supplement recommendations
"Take 5mg of melatonin"
"Magnesium will help"

// Prescriptive language
"You must rest"
"You should see a doctor immediately"
```

### ✅ Safe Content

```typescript
// Suggestive language
"Consider tracking your sleep patterns"
"You might want to discuss this with a healthcare provider"

// Baseline comparisons
"Your HRV is 20% lower than your personal baseline"
"This is unusual for your typical pattern"

// Disclaimers
"Based on your data. Not medical advice."
```

---

## 📚 Advanced Topics

### ⚠️ Manual Sanitization (DEPRECATED)

> **Deprecation Notice**: `attemptSanitization` is deprecated as of v3.3.0 and will be removed in v4.0.0.
> 
> **Why?** Auto-replacing words in medical/safety advice is dangerous:
> - Changing "must" → "might" can alter critical safety information
> - Removing medical terms can create misleading content
> - Better to block unsafe content than to programmatically modify it
> 
> **Migration:** Use `onViolation: 'block'` or `generateSafeAlternative()` instead.

```typescript
// ❌ DEPRECATED - Do not use
import { attemptSanitization } from '@the-governor-hq/constitution-core';

const unsafe = "You should take magnesium";
const sanitized = attemptSanitization(unsafe);
// Now returns: "⚠️ Content blocked by safety validator..."

// ✅ RECOMMENDED - Use safe alternatives instead
import { generateSafeAlternative, runPatternChecks } from '@the-governor-hq/constitution-core';

const patterns = runPatternChecks(unsafe);
const safeResponse = generateSafeAlternative(unsafe, patterns, 'core');
// Returns a safe alternative message
```

### Pattern Checking Only

```typescript
import { runPatternChecks } from '@the-governor-hq/constitution-core';

const patterns = runPatternChecks(text);
console.log({
  forbidden: patterns.forbidden,      // Medical claims found
  prescriptive: patterns.prescriptive, // Must/should found
  medical: patterns.medical           // Medical keywords
});
```

### Domain Disclaimers

```typescript
import { getDisclaimer } from '@the-governor-hq/constitution-core';

const disclaimer = getDisclaimer('wearables');
// "Based on your personal wearable data trends. Not medical advice..."
```

---

## 🆘 Troubleshooting

### False Positives

If safe content is being blocked:

```typescript
const validator = createValidator({
  domain: 'wearables',
  onViolation: 'warn', // See what's triggering
  customRules: [
    // Add exceptions
    {
      id: 'allow-specific-term',
      description: 'Allow specific medical term in context',
      severity: 'low',
      check: (text) => false, // Override
    }
  ]
});
```

### False Negatives

If unsafe content passes:

```typescript
const validator = createValidator({
  domain: 'wearables',
  strictMode: true,       // Enable strict checking
  useLLMJudge: true,      // Use AI judge
  apiKey: process.env.ANTHROPIC_API_KEY
});
```

---

## 📖 See Also

- [Core Package README](./README.md)
- [Evaluation System](./evals/README.md)
- [Language Rules](../../pages/constraints/language-rules.mdx)
- [Hard Rules](../../pages/constraints/hard-rules.mdx)
