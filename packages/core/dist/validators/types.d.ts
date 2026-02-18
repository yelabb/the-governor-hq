/**
 * Types for Runtime Validator
 * Hard post-generation gate: LLM → Validator → Output
 */
export type Domain = 'core' | 'wearables' | 'bci' | 'therapy';
/**
 * Action to take when violations are detected
 *
 * @deprecated 'sanitize' is deprecated as of v3.3.0 - use 'block' instead
 *
 * - 'block': Replace unsafe content with safe alternative (recommended)
 * - 'warn': Log warning but allow content (development)
 * - 'log': Silent logging only (analytics)
 * - 'sanitize': DEPRECATED - now behaves like 'block'
 */
export type ViolationAction = 'block' | 'warn' | 'log' | 'sanitize';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type LLMProvider = 'groq' | 'openai' | 'anthropic';
export interface ValidatorConfig {
    /** Domain-specific rules to apply */
    domain?: Domain;
    /** Strict mode uses LLM judge for edge cases (slower but more accurate) */
    strictMode?: boolean;
    /** What to do when violations are detected */
    onViolation?: ViolationAction;
    /** Use LLM judge for validation (requires API key) */
    useLLMJudge?: boolean;
    /** LLM provider for judge (groq, openai, or anthropic) */
    llmProvider?: LLMProvider;
    /** Model name to use (uses provider default if not specified) */
    llmModel?: string;
    /** Use semantic similarity matching (slower but catches spelling/spacing attacks) */
    useSemanticSimilarity?: boolean;
    /** Semantic similarity threshold (0-1, default: 0.75) */
    semanticThreshold?: number;
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
    position?: {
        start: number;
        end: number;
    };
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
        usedSemanticSimilarity?: boolean;
        semanticMaxSimilarity?: number;
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
/**
 * Semantic Similarity Types
 */
export interface ForbiddenConcept {
    concept: string;
    category: 'diagnosis' | 'treatment' | 'medical-scope' | 'alarming' | 'prescriptive';
    severity: SeverityLevel;
    example: string;
    embedding: number[];
    similarity?: number;
    /**
     * Optional per-concept threshold override.
     * When set, this value replaces the severity-based default threshold for this
     * specific concept. Use it to tune noisy multilingual anchor concepts that
     * produce cross-lingual false positives at the global severity floor.
     */
    minThreshold?: number;
}
export interface SemanticViolation {
    concept: string;
    category: string;
    severity: SeverityLevel;
    similarity: number;
    example: string;
}
export interface SemanticCheckResult {
    violations: SemanticViolation[];
    maxSimilarity: number;
    latencyMs: number;
    detectedLanguage?: string;
}
//# sourceMappingURL=types.d.ts.map