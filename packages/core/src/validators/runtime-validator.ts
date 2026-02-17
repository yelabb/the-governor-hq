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
} from './types';
import {
  runPatternChecks,
  patternsToViolations,
  calculatePatternConfidence,
  runHardenedChecks,
  detectAdversarialAttack,
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
    
    // Step 1: Check for adversarial attacks (spacing/spelling)
    const adversarialViolations: Violation[] = [];
    const adversarialCheck = detectAdversarialAttack(text);
    if (adversarialCheck.manipulationDetected) {
      console.warn(`⚠️  Adversarial attack detected: ${adversarialCheck.manipulationType}`);
      // Flag this as a critical violation
      adversarialViolations.push({
        rule: 'adversarial-attack',
        severity: 'critical',
        message: `Adversarial manipulation detected: ${adversarialCheck.manipulationType}`,
        matched: [adversarialCheck.manipulationType || 'unknown'],
      });
    }
    
    // Step 2: Run pattern checks (fast regex + optional semantic)
    let allViolations: Violation[] = [...adversarialViolations];
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
    
    // Step 3: Custom rules
    const customViolations = this.checkCustomRules(text);
    allViolations = [...allViolations, ...customViolations];
    
    // Step 4: Optional LLM judge for edge cases (only if no clear violations)
    const patterns = runPatternChecks(text);
    let confidence = calculatePatternConfidence(patterns);
    let usedLLMJudge = false;
    
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
        rulesChecked: FORBIDDEN_PATTERNS.length + PRESCRIPTIVE_PATTERNS.length + this.config.customRules.length,
        domain: this.config.domain,
        action: this.config.onViolation,
        usedLLMJudge,
        usedSemanticSimilarity,
        semanticMaxSimilarity,
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
    
    const patterns = runPatternChecks(text);
    const patternViolations = patternsToViolations(patterns);
    const customViolations = this.checkCustomRules(text);
    const allViolations = [...patternViolations, ...customViolations];
    const isSafe = allViolations.length === 0;
    const confidence = calculatePatternConfidence(patterns);
    
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
        rulesChecked: 50 + this.config.customRules.length, // Approximate
        domain: this.config.domain,
        action: this.config.onViolation,
        usedLLMJudge: false,
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

// Constants for internal use
const FORBIDDEN_PATTERNS = [
  'medical-claims',
  'disease-names',
  'treatment-language',
  'supplements',
];

const PRESCRIPTIVE_PATTERNS = [
  'must', 'should', 'need-to', 'have-to',
];

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
