/**
 * Runtime Validator - Hard post-generation gate
 * LLM → Validator → Output
 *
 * Fast pattern matching (<10ms) with optional LLM judge for edge cases
 */
import type { ValidatorConfig, ValidationResult, Domain } from './types';
/**
 * Runtime validator for AI-generated content
 */
export declare class RuntimeValidator {
    private config;
    private initializationPromise;
    private llmClient;
    constructor(config?: ValidatorConfig);
    /**
     * Initialize semantic similarity vector database
     */
    private initSemanticDatabase;
    /**
     * Validate text against safety constraints
     * @param text - The text to validate (e.g., LLM output)
     * @returns Validation result with violations and safe output
     */
    validate(text: string): Promise<ValidationResult>;
    /**
     * Validate text synchronously (no LLM judge)
     * @param text - The text to validate
     * @returns Validation result
     */
    validateSync(text: string): ValidationResult;
    /**
     * Check custom validation rules
     */
    private checkCustomRules;
    /**
     * Generate output based on safety and configuration
     */
    private generateOutput;
    /**
     * Get configuration
     */
    getConfig(): Readonly<Required<ValidatorConfig>>;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<ValidatorConfig>): void;
}
/**
 * Create a validator instance with configuration
 */
export declare function createValidator(config?: ValidatorConfig): RuntimeValidator;
/**
 * Quick validation helper (synchronous)
 */
export declare function validateText(text: string, domain?: Domain): ValidationResult;
//# sourceMappingURL=runtime-validator.d.ts.map