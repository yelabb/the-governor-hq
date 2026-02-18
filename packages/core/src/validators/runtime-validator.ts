/**
 * Runtime Validator - Hard post-generation gate
 * LLM → Validator → Output
 * 
 * Fast pattern matching (<10ms) with multilingual semantic similarity (100-300ms)
 * 
 * MULTILINGUAL SUPPORT (v3.3.0+):
 * - Detects and validates medical advice in 50+ languages
 * - Uses cross-lingual embeddings (no per-language patterns needed)
 * - Semantic similarity enabled by default for security
 */

import type {
  ValidatorConfig,
  ValidationResult,
  Violation,
  Domain,
  AdversarialSignal,
} from './types';
import {
  runPatternChecks,
  patternsToViolations,
  calculatePatternConfidence,
  runHardenedChecks,
  detectAdversarialAttack,
  TOTAL_PATTERN_RULES,
} from './pattern-matcher';
import {
  generateSafeAlternative,
  createViolationExplanation,
} from './sanitizer';
import { initializeVectorDatabase } from './semantic-similarity';
import { createLLMClient, type LLMClient } from './llm-client';

/**
 * Runtime validator for AI-generated content
 */
export class RuntimeValidator {
  private config: Required<ValidatorConfig>;
  private initializationPromise: Promise<void> | null = null;
  private llmClient: LLMClient | null = null;
  
  constructor(config: ValidatorConfig = {}) {
    // Set defaults
    this.config = {
      domain: config.domain || 'core',
      strictMode: config.strictMode ?? false,
      onViolation: config.onViolation || 'block',
      useLLMJudge: config.useLLMJudge ?? false,
      llmProvider: config.llmProvider || 'groq',
      llmModel: config.llmModel || '',
      // Default to TRUE for multilingual support (v3.3.0+)
      // Semantic similarity is now required to catch non-English medical advice
      // Pattern matching alone is English-only and vulnerable to bypasses
      useSemanticSimilarity: config.useSemanticSimilarity ?? true,
      semanticThreshold: config.semanticThreshold ?? 0.75,
      customRules: config.customRules || [],
      apiKey: config.apiKey || '',
      defaultSafeMessage: config.defaultSafeMessage || '',
    };
    
    // Validate configuration
    if (this.config.useLLMJudge && !this.config.apiKey) {
      console.warn('⚠️  LLM judge enabled but no API key provided. Falling back to pattern matching only.');
      this.config.useLLMJudge = false;
    }
    
    // Initialize LLM client if judge is enabled
    if (this.config.useLLMJudge && this.config.apiKey) {
      try {
        this.llmClient = createLLMClient({
          provider: this.config.llmProvider,
          apiKey: this.config.apiKey,
          model: this.config.llmModel || undefined,
        });
      } catch (error) {
        console.error('❌ Failed to initialize LLM client:', error);
        console.warn('⚠️  Falling back to pattern matching only.');
        this.config.useLLMJudge = false;
      }
    }
    
    // Initialize vector database if semantic similarity is enabled
    if (this.config.useSemanticSimilarity) {
      this.initializationPromise = this.initSemanticDatabase();
    }
  }
  
  /**
   * Initialize semantic similarity vector database
   */
  private async initSemanticDatabase(): Promise<void> {
    try {
      await initializeVectorDatabase();
    } catch (error) {
      console.error('❌ Failed to initialize semantic similarity database:', error);
      console.warn('⚠️  Falling back to regex-only pattern matching.');
      this.config.useSemanticSimilarity = false;
    }
  }
  
  /**
   * Validate text against safety constraints
   * @param text - The text to validate (e.g., LLM output)
   * @returns Validation result with violations and safe output
   */
  async validate(text: string): Promise<ValidationResult> {
    const startTime = Date.now();
    
    // Await initialization if semantic similarity is enabled
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
    
    // Step 1: Adversarial signal (informational — not an auto-violation)
    const adversarialCheck = detectAdversarialAttack(text);
    const adversarialSignal: AdversarialSignal = {
      detected: adversarialCheck.manipulationDetected,
      manipulationType: adversarialCheck.manipulationType,
      confidencePenalty: adversarialCheck.confidencePenalty,
      correlatedWithForbiddenHit: false,
    };
    
    // Step 2: Run pattern checks on the ORIGINAL text (fast regex + optional semantic)
    let allViolations: Violation[] = [];
    let usedSemanticSimilarity = false;
    let semanticMaxSimilarity = 0;
    
    if (this.config.useSemanticSimilarity) {
      // Use hardened checks (regex + semantic)
      const hardenedResult = await runHardenedChecks(text, {
        useSemanticSimilarity: true,
        semanticThreshold: this.config.semanticThreshold,
      });
      allViolations = [...allViolations, ...hardenedResult.allViolations];
      usedSemanticSimilarity = true;
      semanticMaxSimilarity = hardenedResult.semantic?.maxSimilarity || 0;
    } else {
      // Use fast regex-only checks
      const patterns = runPatternChecks(text);
      allViolations = [...allViolations, ...patternsToViolations(patterns)];
    }
    
    // Step 2b: If manipulation was detected, ALSO check the normalized text
    // and escalate only when the normalization reveals NEW forbidden hits
    if (adversarialCheck.manipulationDetected) {
      const normalizedText = adversarialCheck.normalized;
      let normalizedViolations: Violation[] = [];

      if (this.config.useSemanticSimilarity) {
        const normHardened = await runHardenedChecks(normalizedText, {
          useSemanticSimilarity: true,
          semanticThreshold: this.config.semanticThreshold,
        });
        normalizedViolations = normHardened.allViolations;
        if (normHardened.semantic?.maxSimilarity && normHardened.semantic.maxSimilarity > semanticMaxSimilarity) {
          semanticMaxSimilarity = normHardened.semantic.maxSimilarity;
        }
      } else {
        const normPatterns = runPatternChecks(normalizedText);
        normalizedViolations = patternsToViolations(normPatterns);
      }

      // Find violations that ONLY appear after normalization (delta)
      const existingRules = new Set(allViolations.map(v => `${v.rule}|${v.message}`));
      const newViolations = normalizedViolations.filter(
        v => !existingRules.has(`${v.rule}|${v.message}`)
      );

      if (newViolations.length > 0) {
        // The manipulation was hiding something forbidden — escalate
        adversarialSignal.correlatedWithForbiddenHit = true;
        console.warn(
          `⚠️  Adversarial manipulation (${adversarialCheck.manipulationType}) ` +
          `correlated with ${newViolations.length} hidden forbidden hit(s)`
        );
        allViolations.push({
          rule: 'adversarial-attack',
          severity: 'critical',
          message: `Adversarial manipulation (${adversarialCheck.manipulationType}) hiding forbidden content`,
          matched: [adversarialCheck.manipulationType || 'unknown'],
        });
        // Also include the newly-revealed violations
        allViolations.push(...newViolations);
      }
    }
    
    // Step 3: Custom rules
    const customViolations = this.checkCustomRules(text);
    allViolations = [...allViolations, ...customViolations];
    
    // Step 4: Optional LLM judge for edge cases (only if no clear violations)
    const patterns = runPatternChecks(text);
    let confidence = calculatePatternConfidence(patterns);
    let usedLLMJudge = false;
    
    // Apply adversarial confidence penalty (even if not escalated to violation)
    confidence = Math.max(0, confidence - adversarialCheck.confidencePenalty);
    
    if (this.config.useLLMJudge && this.llmClient && allViolations.length === 0 && this.config.strictMode) {
      try {
        const llmResult = await this.llmClient.judge(text, this.config.domain);
        usedLLMJudge = true;
        confidence = llmResult.confidence;
        
        // If LLM judge says FAIL or BORDERLINE, add violations
        if (llmResult.verdict === 'FAIL' || llmResult.verdict === 'BORDERLINE') {
          for (const violation of llmResult.specificViolations) {
            allViolations.push({
              rule: 'llm-judge',
              severity: llmResult.verdict === 'FAIL' ? 'critical' : 'medium',
              message: violation,
            });
          }
        }
      } catch (error) {
        console.error('❌ LLM judge failed:', error);
        usedLLMJudge = false;
      }
    }
    
    // Step 5: Determine safety
    const isSafe = allViolations.length === 0;
    
    // Step 6: Generate output based on violation action
    const output = this.generateOutput(text, isSafe, patterns);
    
    // Step 7: Generate safe alternative if needed
    const safeAlternative = !isSafe 
      ? generateSafeAlternative(text, patterns, this.config.domain, this.config.defaultSafeMessage)
      : undefined;
    
    const latencyMs = Date.now() - startTime;
    
    return {
      safe: isSafe,
      output,
      violations: allViolations,
      confidence,
      safeAlternative,
      metadata: {
        latencyMs,
        rulesChecked: TOTAL_PATTERN_RULES + this.config.customRules.length,
        domain: this.config.domain,
        action: this.config.onViolation,
        usedLLMJudge,
        usedSemanticSimilarity,
        semanticMaxSimilarity,
        adversarialSignal,
      },
    };
  }
  
  /**
   * Validate text synchronously (no LLM judge)
   * @param text - The text to validate
   * @returns Validation result
   */
  validateSync(text: string): ValidationResult {
    const startTime = Date.now();
    
    // Adversarial signal (informational — not an auto-violation)
    const adversarialCheck = detectAdversarialAttack(text);
    const adversarialSignal: AdversarialSignal = {
      detected: adversarialCheck.manipulationDetected,
      manipulationType: adversarialCheck.manipulationType,
      confidencePenalty: adversarialCheck.confidencePenalty,
      correlatedWithForbiddenHit: false,
    };
    
    const patterns = runPatternChecks(text);
    const patternViolations = patternsToViolations(patterns);
    const customViolations = this.checkCustomRules(text);
    let allViolations = [...patternViolations, ...customViolations];
    
    // If manipulation detected, also check normalized text for hidden violations
    if (adversarialCheck.manipulationDetected) {
      const normPatterns = runPatternChecks(adversarialCheck.normalized);
      const normViolations = patternsToViolations(normPatterns);
      const existingRules = new Set(allViolations.map(v => `${v.rule}|${v.message}`));
      const newViolations = normViolations.filter(
        v => !existingRules.has(`${v.rule}|${v.message}`)
      );
      if (newViolations.length > 0) {
        adversarialSignal.correlatedWithForbiddenHit = true;
        allViolations.push({
          rule: 'adversarial-attack',
          severity: 'critical',
          message: `Adversarial manipulation (${adversarialCheck.manipulationType}) hiding forbidden content`,
          matched: [adversarialCheck.manipulationType || 'unknown'],
        });
        allViolations.push(...newViolations);
      }
    }
    
    const isSafe = allViolations.length === 0;
    let confidence = calculatePatternConfidence(patterns);
    confidence = Math.max(0, confidence - adversarialCheck.confidencePenalty);
    
    const output = this.generateOutput(text, isSafe, patterns);
    const safeAlternative = !isSafe 
      ? generateSafeAlternative(text, patterns, this.config.domain, this.config.defaultSafeMessage)
      : undefined;
    
    const latencyMs = Date.now() - startTime;
    
    return {
      safe: isSafe,
      output,
      violations: allViolations,
      confidence,
      safeAlternative,
      metadata: {
        latencyMs,
        rulesChecked: TOTAL_PATTERN_RULES + this.config.customRules.length,
        domain: this.config.domain,
        action: this.config.onViolation,
        usedLLMJudge: false,
        adversarialSignal,
      },
    };
  }
  
  /**
   * Check custom validation rules
   */
  private checkCustomRules(text: string): Violation[] {
    const violations: Violation[] = [];
    
    for (const rule of this.config.customRules) {
      if (rule.check(text)) {
        violations.push({
          rule: rule.id,
          severity: rule.severity,
          message: rule.violation || rule.description,
        });
      }
    }
    
    return violations;
  }
  
  /**
   * Generate output based on safety and configuration
   */
  private generateOutput(text: string, isSafe: boolean, patterns: any): string {
    if (isSafe) {
      return text;
    }
    
    // Handle violations based on configured action
    switch (this.config.onViolation) {
      case 'block':
        return `⚠️ Content blocked by safety validator. Reason: ${createViolationExplanation(patterns)}`;
      
      case 'sanitize':
        // DEPRECATED: Sanitize mode is deprecated as of v3.3.0
        // Auto-sanitization is unsafe - blocks content instead
        console.warn(
          '⚠️  onViolation: "sanitize" is deprecated as of v3.3.0. ' +
          'Auto-sanitizing medical/safety content is unsafe. Use "block" instead.'
        );
        // Fall through to block behavior
        return `⚠️ Content blocked by safety validator. Reason: ${createViolationExplanation(patterns)} (Note: sanitize mode is deprecated, blocking instead)`;
      
      case 'warn':
        console.warn(`⚠️ Safety violation detected: ${createViolationExplanation(patterns)}`);
        console.warn(`Original text: ${text.substring(0, 100)}...`);
        return text; // Allow in warn mode
      
      case 'log':
        console.log(`[Validator] Violation detected: ${createViolationExplanation(patterns)}`);
        return text; // Allow in log mode
      
      default:
        return text;
    }
  }
  
  /**
   * Get configuration
   */
  getConfig(): Readonly<Required<ValidatorConfig>> {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ValidatorConfig>): void {
    this.config = { ...this.config, ...updates } as Required<ValidatorConfig>;
  }
}



/**
 * Create a validator instance with configuration
 */
export function createValidator(config: ValidatorConfig = {}): RuntimeValidator {
  return new RuntimeValidator(config);
}

/**
 * Quick validation helper (synchronous)
 */
export function validateText(text: string, domain: Domain = 'core'): ValidationResult {
  const validator = createValidator({ domain });
  return validator.validateSync(text);
}
