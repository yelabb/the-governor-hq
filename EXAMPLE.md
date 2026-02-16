# Governor HQ Constitutional Framework - Example Project

This is an example showing the framework in action.

## Project Structure

```
my-wearable-app/
├── package.json
├── .cursorrules                    # ← Auto-created by framework
├── .mcp-config.json                # ← Auto-created by framework
├── .vscode/
│   └── settings.json               # ← Auto-updated by framework
├── node_modules/
│   └── @governor-hq/constitution/  # ← Installed framework
└── src/
    ├── utils/
    │   ├── baseline-gate.ts        # ← Use framework patterns
    │   └── safe-messages.ts        # ← Use framework templates
    └── agents/
        └── recovery-agent.ts       # ← AI generates safe code
```

## Installation

```bash
# 1. Install the framework
npm install --save-dev @governor-hq/constitution

# 2. Start coding - AI is now context-aware!
```

## Example: AI-Generated Safe Code

### Prompt to AI:
```
Create a recovery recommendation function that analyzes HRV data
```

### AI Response (with framework active):
```typescript
// src/agents/recovery-agent.ts
import { requireStableBaseline, MessageTemplates } from '@governor-hq/constitution';

interface User {
  id: string;
  baselineStatus: 'LEARNING' | 'STABLE';
  personalBaseline: { hrv: number };
  currentHRV: number;
}

export function generateRecoveryRecommendation(user: User): string | null {
  // Step 1: Check baseline gate (framework requirement)
  if (!requireStableBaseline(user)) {
    return "I'm learning your patterns. This takes a few weeks. " +
           "I'll reach out when I notice something meaningful.";
  }

  // Step 2: Compare to personal baseline (not population average)
  const deviationPercent = 
    ((user.currentHRV - user.personalBaseline.hrv) / user.personalBaseline.hrv) * 100;

  // Step 3: Only activate on meaningful deviation
  if (Math.abs(deviationPercent) < 15) {
    return null; // No recommendation needed
  }

  // Step 4: Generate safe message using framework templates
  if (deviationPercent < -20) {
    return [
      MessageTemplates.observation('HRV', 'lower than your recent average'),
      'This pattern sometimes appears during more demanding periods.',
      MessageTemplates.suggestion('an earlier wind-down tonight'),
      MessageTemplates.disclaimer()
    ].join(' ');
  }

  return null;
}
```

### What the AI Did Right:
✅ Checked baseline status first (no recommendations during learning)  
✅ Compared to personal baseline (not population average)  
✅ Required meaningful deviation (15%+)  
✅ Used optional language ("sometimes", "might help")  
✅ Included disclaimer  
✅ No medical claims, supplements, or commanding language

## Example: Unsafe Code (Without Framework)

### What AI might generate WITHOUT the framework:

```typescript
// ❌ UNSAFE - Multiple violations
export function analyzeSleep(hrv: number) {
  // ❌ Uses population threshold (not personal baseline)
  if (hrv < 50) {
    // ❌ Medical claim: "indicates serious health issues"
    // ❌ Commanding: "You must see a doctor"
    // ❌ Supplement recommendation: "take magnesium"
    return "Your HRV indicates serious health issues. " +
           "You must see a doctor immediately and take " +
           "400mg of magnesium before bed.";
  }
  
  // ❌ Disease name mentioned
  if (hrv < 30) {
    return "You may have chronic fatigue syndrome.";
  }
}
```

## Framework Files Created

### `.cursorrules`
```markdown
# Governor HQ Constitutional Framework - AI Safety Rules

🛡️ CRITICAL SAFETY CONSTRAINTS

1. ❌ NO MEDICAL CLAIMS
2. ❌ NO SUPPLEMENTS
3. ❌ NO DISEASE NAMES
4. ❌ NO TREATMENT LANGUAGE
5. ❌ NO COMMANDING

[... full rules automatically included ...]
```

### `.vscode/settings.json`
```json
{
  "github.copilot.chat.codeGeneration.instructions": [{
    "text": "Follow the Governor HQ Constitutional Framework in node_modules/@governor-hq/constitution for wearable health data safety constraints."
  }]
}
```

### `.mcp-config.json`
```json
{
  "mcpServers": {
    "governor-hq-constitution": {
      "command": "node",
      "args": ["./node_modules/@governor-hq/constitution/mcp-server.js"],
      "enabled": true
    }
  }
}
```

## Using the Framework APIs

```typescript
// Import helper utilities
import {
  requireStableBaseline,
  validateUserFacingText,
  MessageTemplates,
  convertCommandsToSuggestions
} from '@governor-hq/constitution';

// Check baseline before recommendations
if (!requireStableBaseline(user)) {
  return null;
}

// Validate any user-facing text
const validation = validateUserFacingText(message);
if (!validation.valid) {
  console.error('Language violations:', validation.violations);
}

// Use safe message templates
const safeMessage = MessageTemplates.observation('HRV', 'lower than usual');

// Auto-convert commands to suggestions
const fixed = convertCommandsToSuggestions("You should rest today");
// Result: "You might consider resting today"
```

## Testing with Framework

```typescript
// tests/recovery-agent.test.ts
import { generateRecoveryRecommendation } from '../src/agents/recovery-agent';
import { validateUserFacingText } from '@governor-hq/constitution';

describe('Recovery Agent Safety', () => {
  test('generates no recommendations during learning phase', () => {
    const user = { 
      baselineStatus: 'LEARNING',
      currentHRV: 45 
    };
    
    const result = generateRecoveryRecommendation(user);
    expect(result).toContain('learning your patterns');
  });

  test('all generated messages pass safety validation', () => {
    const user = {
      baselineStatus: 'STABLE',
      personalBaseline: { hrv: 60 },
      currentHRV: 45
    };
    
    const message = generateRecoveryRecommendation(user);
    if (message) {
      const validation = validateUserFacingText(message);
      expect(validation.valid).toBe(true);
      expect(validation.violations).toHaveLength(0);
    }
  });

  test('compares to personal baseline, not population average', () => {
    // User with naturally low HRV
    const user = {
      baselineStatus: 'STABLE',
      personalBaseline: { hrv: 35 }, // Low but normal for this user
      currentHRV: 45 // Actually HIGHER than their baseline
    };
    
    const result = generateRecoveryRecommendation(user);
    // Should not trigger "low HRV" warning
    expect(result).not.toContain('lower');
  });
});
```

## CI/CD Integration

```yaml
# .github/workflows/safety-check.yml
name: AI Safety Compliance

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run safety validation tests
        run: npm test -- --testPathPattern=safety
      
      - name: Check for forbidden terms
        run: |
          ! grep -ri "supplement\|vitamin\|melatonin" src/ || exit 1
          ! grep -ri "diagnose\|treat\|cure" src/ || exit 1
```

## Real-World Usage

```typescript
// src/api/notifications.ts
import { generateRecoveryRecommendation } from './agents/recovery-agent';
import { validateUserFacingText } from '@governor-hq/constitution';

export async function sendDailyInsight(userId: string) {
  const user = await fetchUserData(userId);
  const message = generateRecoveryRecommendation(user);
  
  if (!message) {
    return; // No recommendation needed
  }
  
  // Extra safety check before sending
  const validation = validateUserFacingText(message);
  if (!validation.valid) {
    console.error('Message failed safety check:', validation.violations);
    return;
  }
  
  // Safe to send
  await sendNotification(userId, {
    title: 'Pattern Update',
    body: message,
    tone: 'neutral'
  });
}
```

## Development Workflow

```bash
# 1. Install framework
npm install --save-dev @governor-hq/constitution

# 2. Restart AI assistant (Cursor, VS Code)

# 3. Write code naturally - AI applies safety rules automatically

# 4. Run validation
npm run ai:context  # Start MCP server if needed

# 5. Test
npm test

# 6. Commit - CI checks safety automatically
git commit -m "Add recovery recommendations"
```

## Troubleshooting

### AI still suggesting supplements?

Update your AI's context:
```
CRITICAL: Zero tolerance for supplement mentions. 
Review node_modules/@governor-hq/constitution/pages/constraints/hard-rules.mdx
```

### Need to validate existing code?

```bash
# Search for violations
grep -ri "should\|must" src/ | grep -i "you"
grep -ri "supplement\|vitamin" src/
grep -ri "diagnose\|treat\|cure" src/
```

## Learn More

- [Quick Reference](../pages/quick-reference.mdx) - One-page cheat sheet
- [AI Agent Guide](../pages/ai-agent-guide.mdx) - Complete patterns
- [Hard Rules](../pages/constraints/hard-rules.mdx) - Absolute boundaries

---

**Your AI is now safety-aware. Start coding!** 🚀
