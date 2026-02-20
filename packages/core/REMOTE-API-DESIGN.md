# Remote Semantic Similarity API Design

**Status:** 📋 Design Document (Not Yet Implemented)  
**Version:** v3.4.0+  
**Last Updated:** February 20, 2026

---

## Problem Statement

The current semantic similarity feature requires:
- ~420MB ML model download on first use
- Heavy CPU usage for embedding generation
- Not practical for serverless/edge deployments
- Cold start penalties in AWS Lambda, Vercel Functions, Cloudflare Workers

**User request:** "Can we have a remote option instead of running ML locally?"

---

## Proposed Solution

### Option 1: Hosted API Service (Recommended)

Deploy a centralized semantic similarity API that clients can call instead of running transformers.js locally.

#### Architecture

```
┌─────────────────────┐
│ Client Application  │
│  (Node.js/Browser)  │
└──────────┬──────────┘
           │
           │ HTTPS POST /semantic/check
           │ { text, threshold, language? }
           ▼
┌─────────────────────────────────┐
│  Governor HQ Semantic API       │
│  (Serverless or Containerized)  │
│                                  │
│  - Load model once (warm pool)  │
│  - GPU acceleration available   │
│  - Rate limiting / auth         │
└──────────┬──────────────────────┘
           │
           │ Embedding generation +
           │ similarity comparison
           ▼
┌─────────────────────────────────┐
│  Response                        │
│  {                               │
│    violations: [...],            │
│    maxSimilarity: 0.92,          │
│    detectedConcepts: [...]       │
│  }                               │
└──────────────────────────────────┘
```

#### Client Usage

```typescript
import { createValidator } from '@the-governor-hq/constitution-core';

// Enable remote semantic similarity
const validator = createValidator({
  domain: 'wearables',
  useSemanticSimilarity: true,
  semanticMode: 'remote',  // NEW
  semanticApiUrl: 'https://api.governor-hq.com/semantic',
  semanticApiKey: process.env.GOVERNOR_API_KEY,  // Optional auth
});

// Automatically calls remote API instead of local model
const result = await validator.validate("Tienes insomnio");
```

#### API Specification

**Endpoint:** `POST /semantic/check`

**Request:**
```json
{
  "text": "Tienes insomnio",
  "threshold": 0.75,
  "language": "auto",
  "domain": "wearables"
}
```

**Response (200 OK):**
```json
{
  "violations": [
    {
      "concept": "sleep-disorders",
      "similarity": 0.89,
      "matched": "Tienes insomnio",
      "severity": "critical"
    }
  ],
  "maxSimilarity": 0.89,
  "detectedConcepts": ["sleep-disorders"],
  "language": "es",
  "latency": 45
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid threshold value",
  "code": "INVALID_THRESHOLD"
}
```

**Response (429 Too Many Requests):**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "retryAfter": 60
}
```

#### Pricing Model

- **Free tier:** 1,000 checks/month
- **Starter:** $9/month - 10,000 checks
- **Pro:** $49/month - 100,000 checks
- **Enterprise:** Custom pricing

---

### Option 2: Serverless Function Template

Provide a template for deploying your own semantic similarity API.

#### Deploy to Vercel/AWS Lambda

```bash
# Clone the template
npx @the-governor-hq/semantic-api init

# Deploy to Vercel
vercel deploy

# Or AWS Lambda
npm run deploy:aws
```

#### Advantages
- Self-hosted (no dependency on external service)
- No API costs beyond infrastructure
- Full control over model versions
- Can use GPU instances for speed

#### Template Structure

```
semantic-api/
├── src/
│   ├── handler.ts          # Main API handler
│   ├── model-loader.ts     # Warm model on cold start
│   └── similarity.ts       # Core similarity logic
├── vercel.json             # Vercel configuration
├── serverless.yml          # AWS Lambda configuration
├── Dockerfile              # For containerized deployment
└── README.md
```

---

### Option 3: Hybrid Mode with Fallback

Allow users to specify both local and remote modes with automatic fallback:

```typescript
const validator = createValidator({
  domain: 'wearables',
  useSemanticSimilarity: true,
  semanticMode: 'hybrid',  // Try remote, fallback to local if unavailable
  semanticApiUrl: 'https://api.governor-hq.com/semantic',
  semanticFallback: 'local',  // or 'disable'
});
```

**Behavior:**
1. Try remote API first (faster if model is warm)
2. If API unavailable/timeout → fallback to local model
3. If local model not downloaded → fallback to pattern-only

---

## Implementation Plan

### Phase 1: API Server (v3.5.0)

- [ ] Create `@the-governor-hq/semantic-api` package
- [ ] Implement API handler with transformers.js
- [ ] Deploy to Vercel Edge Functions (global edge network)
- [ ] Add authentication (API keys)
- [ ] Add rate limiting
- [ ] Create free tier (1,000 checks/month)

### Phase 2: Client Support (v3.5.0)

- [ ] Add `semanticMode: 'local' | 'remote' | 'hybrid'` to `ValidatorConfig`
- [ ] Implement remote API client in `semantic-similarity.ts`
- [ ] Handle errors/retries gracefully
- [ ] Add caching for repeated texts
- [ ] Update documentation

### Phase 3: Self-Hosted Template (v3.6.0)

- [ ] Create deployment templates (Vercel, AWS Lambda, Docker)
- [ ] Document GPU optimization for faster inference
- [ ] Add monitoring/observability examples
- [ ] Provide cost estimation tools

### Phase 4: Advanced Features (v4.0.0)

- [ ] Batch endpoint for bulk checks
- [ ] WebSocket streaming for real-time validation
- [ ] Custom concept libraries (user-uploaded forbidden concepts)
- [ ] Multi-region deployment for lower latency

---

## Code Changes Required

### 1. Update `ValidatorConfig` type

```typescript
// packages/core/src/validators/types.ts

export interface ValidatorConfig {
  // ... existing fields
  
  /** Semantic similarity mode */
  semanticMode?: 'local' | 'remote' | 'hybrid';
  
  /** Remote API endpoint (when semanticMode is 'remote' or 'hybrid') */
  semanticApiUrl?: string;
  
  /** API key for authentication */
  semanticApiKey?: string;
  
  /** Fallback mode when remote API unavailable (hybrid mode only) */
  semanticFallback?: 'local' | 'disable';
  
  /** Request timeout for remote API (ms) */
  semanticTimeout?: number;
}
```

### 2. Add remote client to `semantic-similarity.ts`

```typescript
// packages/core/src/validators/semantic-similarity.ts

interface RemoteSemanticOptions {
  apiUrl: string;
  apiKey?: string;
  timeout?: number;
}

/**
 * Call remote semantic similarity API
 */
async function checkSemanticSimilarityRemote(
  text: string,
  threshold: number,
  options: RemoteSemanticOptions
): Promise<SemanticCheckResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 5000);
  
  try {
    const response = await fetch(`${options.apiUrl}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.apiKey && { 'Authorization': `Bearer ${options.apiKey}` })
      },
      body: JSON.stringify({ text, threshold }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json() as any;
    
    return {
      hasViolations: data.violations.length > 0,
      violations: data.violations,
      maxSimilarity: data.maxSimilarity,
      latencyMs: data.latency
    };
  } catch (error) {
    console.error('❌ Remote semantic similarity API error:', error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### 3. Update `RuntimeValidator` to support modes

```typescript
// packages/core/src/validators/runtime-validator.ts

// In validate() method
if (this.config.useSemanticSimilarity) {
  const mode = this.config.semanticMode || 'local';
  
  if (mode === 'remote') {
    // Remote only
    semanticResult = await checkSemanticSimilarityRemote(text, threshold, {
      apiUrl: this.config.semanticApiUrl!,
      apiKey: this.config.semanticApiKey,
      timeout: this.config.semanticTimeout
    });
  } else if (mode === 'hybrid') {
    // Try remote, fallback to local
    try {
      semanticResult = await checkSemanticSimilarityRemote(text, threshold, {
        apiUrl: this.config.semanticApiUrl!,
        apiKey: this.config.semanticApiKey,
        timeout: this.config.semanticTimeout
      });
    } catch (error) {
      console.warn('⚠️  Remote API unavailable, falling back to local model');
      semanticResult = await checkSemanticSimilarity(text, threshold);
    }
  } else {
    // Local only (default)
    semanticResult = await checkSemanticSimilarity(text, threshold);
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// packages/core/tests/remote-semantic.test.js

describe('Remote Semantic Similarity', () => {
  it('should call remote API correctly', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        violations: [],
        maxSimilarity: 0.3,
        latency: 45
      })
    });
    global.fetch = mockFetch;
    
    const validator = createValidator({
      useSemanticSimilarity: true,
      semanticMode: 'remote',
      semanticApiUrl: 'https://test.api.com'
    });
    
    const result = await validator.validate('Your sleep looks good');
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.api.com/check',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Your sleep looks good')
      })
    );
  });
  
  it('should fallback to local in hybrid mode', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;
    
    const validator = createValidator({
      useSemanticSimilarity: true,
      semanticMode: 'hybrid',
      semanticApiUrl: 'https://test.api.com',
      semanticFallback: 'local'
    });
    
    // Should not throw, fallback to local
    await expect(
      validator.validate('You have insomnia')
    ).resolves.toHaveProperty('safe', false);
  });
});
```

### Integration Tests

- Deploy test API to staging environment
- Test rate limiting behavior
- Test authentication failures
- Test timeout handling
- Test latency benchmarks (should be <100ms for remote)

---

## Documentation Updates

### 1. Add to Runtime Validation docs

```markdown
## Remote Semantic Similarity (v3.5.0+)

Instead of downloading the ML model locally, call a remote API:

\`\`\`typescript
const validator = createValidator({
  domain: 'wearables',
  useSemanticSimilarity: true,
  semanticMode: 'remote',
  semanticApiUrl: 'https://api.governor-hq.com/semantic',
  semanticApiKey: process.env.GOVERNOR_API_KEY
});
\`\`\`

**Benefits:**
- No ML model download
- Faster cold starts
- GPU acceleration available
- Serverless-friendly

**Free tier:** 1,000 checks/month  
**Pricing:** [View plans](https://governor-hq.com/pricing)
```

### 2. Add self-hosted guide

```markdown
## Self-Hosted Semantic API

Deploy your own API instead of using the hosted service:

\`\`\`bash
npx @the-governor-hq/semantic-api init
vercel deploy
\`\`\`

Point your validator to your deployment:

\`\`\`typescript
const validator = createValidator({
  useSemanticSimilarity: true,
  semanticMode: 'remote',
  semanticApiUrl: 'https://my-api.vercel.app'
});
\`\`\`
```

---

## Open Questions

1. **Pricing structure:** How to balance free tier vs paid plans?
2. **Data privacy:** Should we log user text for abuse detection? (No, probably not)
3. **Caching:** Should we cache embeddings server-side?
4. **Custom concepts:** Allow users to upload their own forbidden concept libraries?
5. **Multi-tenant:** How to isolate different users' validation configs?

---

## Security Considerations

- **No logging of user text:** Privacy-first approach
- **Rate limiting:** Prevent abuse
- **API key rotation:** Support key rotation without downtime
- **DDoS protection:** Use Vercel/Cloudflare DDoS mitigation
- **Input validation:** Sanitize all inputs to prevent injection attacks

---

## Success Metrics

- **Latency:** <100ms p95 latency for remote API
- **Availability:** 99.9% uptime SLA
- **Adoption:** 50%+ of users prefer remote over local by v4.0.0
- **Cost:** API costs < $0.01 per 1,000 checks

---

## Next Steps

1. Create GitHub issue to track implementation
2. Gather user feedback on pricing model
3. Prototype API server with Vercel Edge Functions
4. Benchmark latency (remote vs local)
5. Design authentication/billing system
6. Implement Phase 1 features for v3.5.0

---

**Maintainers:** Review this design doc and approve before implementation  
**Feedback:** [Open an issue](https://github.com/the-governor-hq/constitution/issues)
