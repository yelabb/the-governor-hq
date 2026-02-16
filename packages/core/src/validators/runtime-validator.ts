/**
 * Runtime Validator - Hard post-generation gate
 * LLM → Validator → Output
 * 
 * Fast pattern matching (<10ms) with optional LLM judge for edge cases
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
} from './pattern-matcher';
import {
  generateSafeAlternative,
  attemptSanitization,
  createViolationExplanation,
} from './sanitizer';

/**
 * Runtime validator for AI-generated content
 */
export class RuntimeValidator {
  private config: Required<ValidatorConfig>;
  
  constructor(config: ValidatorConfig = {}) {
    // Set defaults
    this.config = {
      domain: config.domain || 'core',
      strictMode: config.strictMode ?? false,
      onViolation: config.onViolation || 'block',
      useLLMJudge: config.useLLMJudge ?? false,
      customRules: config.customRules || [],
      apiKey: config.apiKey || '',
      defaultSafeMessage: config.defaultSafeMessage || '',
    };
    
    // Validate configuration
    if (this.config.useLLMJudge && !this.config.apiKey) {
      console.warn('⚠️  LLM judge enabled but no API key provided. Falling back to pattern matching only.');
      this.config.useLLMJudge = false;
    }
  }
  
  /**
   * Validate text against safety constraints
   * @param text - The text to validate (e.g., LLM output)
   * @returns Validation result with violations and safe output
   */
  async validate(text: string): Promise<ValidationResult> {
    const startTime = Date.now();
    
    // Step 1: Fast pattern matching (always runs)
    const patterns = runPatternChecks(text);
    const patternViolations = patternsToViolations(patterns);
    
    // Step 2: Custom rules
    const customViolations = this.checkCustomRules(text);
    
    // Step 3: Combine violations
    const allViolations = [...patternViolations, ...customViolations];
    
    // Step 4: Optional LLM judge for edge cases (only if no clear violations)
    let confidence = calculatePatternConfidence(patterns);
    let usedLLMJudge = false;
    
    if (this.config.useLLMJudge && allViolations.length === 0 && this.config.strictMode) {
      // LLM judge would go here - placeholder for now
      // const llmResult = await this.runLLMJudge(text);
      // confidence = llmResult.confidence;
      usedLLMJudge = false; // Set to true when implemented
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
        return attemptSanitization(text);
      
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
