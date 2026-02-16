/**
 * Types for Runtime Validator
 * Hard post-generation gate: LLM → Validator → Output
 */

export type Domain = 'core' | 'wearables' | 'bci' | 'therapy';
export type ViolationAction = 'block' | 'warn' | 'log' | 'sanitize';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ValidatorConfig {
  /** Domain-specific rules to apply */
  domain?: Domain;
  
  /** Strict mode uses LLM judge for edge cases (slower but more accurate) */
  strictMode?: boolean;
  
  /** What to do when violations are detected */
  onViolation?: ViolationAction;
  
  /** Use LLM judge for validation (requires API key) */
  useLLMJudge?: boolean;
  
  /** Custom validation rules */
  customRules?: ValidationRule[];
  
  /** API key for LLM judge (if useLLMJudge is true) */
  apiKey?: string;
  
  /** Custom safe alternative message */
  defaultSafeMessage?: string;
}

export interface ValidationRule {
  id: string;
  description: string;
  severity: SeverityLevel;
  check: (text: string) => boolean;
  violation?: string;
}

export interface Violation {
  rule: string;
  severity: SeverityLevel;
  message: string;
  matched?: string[];
  position?: { start: number; end: number };
}

export interface ValidationResult {
  /** Whether the text passed validation */
  safe: boolean;
  
  /** The output (original if safe, sanitized/blocked if not) */
  output: string;
  
  /** List of violations found */
  violations: Violation[];
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** Auto-generated safe alternative (if unsafe) */
  safeAlternative?: string;
  
  /** Validation metadata */
  metadata: {
    latencyMs: number;
    rulesChecked: number;
    domain: Domain;
    action: ViolationAction;
    usedLLMJudge: boolean;
  };
}

export interface PatternCheckResult {
  forbidden: string[];
  required: string[];
  prescriptive: string[];
  medical: string[];
}

export interface LLMJudgeResult {
  verdict: 'PASS' | 'FAIL' | 'BORDERLINE';
  confidence: number;
  reasoning: string;
  specificViolations: string[];
  suggestions?: string;
}
