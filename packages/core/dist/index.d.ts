/**
 * @the-governor-hq/constitution-core
 *
 * Core AI Safety Infrastructure for Governor HQ Constitutional Framework
 * Shared rules and utilities for all domain-specific constitutions
 */
import { BaseGovernorMCPServer } from './base-mcp-server';
import type { ServerConfig } from './base-mcp-server';
export { RuntimeValidator, createValidator, validateText } from './validators/runtime-validator';
export type { ValidatorConfig, ValidationResult, Violation, Domain, ViolationAction, SeverityLevel, ValidationRule, PatternCheckResult, LLMJudgeResult, } from './validators/types';
export { governorValidator, validateField, validationErrorHandler } from './middleware/express';
export { withGovernor, createGovernorValidator, withFieldValidation, validateResponse } from './middleware/nextjs';
export { runPatternChecks, checkForbiddenPatterns, checkPrescriptiveLanguage, checkMedicalKeywords, checkSuggestivePatterns, checkAlarmingPatterns, } from './validators/pattern-matcher';
export { generateSafeAlternative, attemptSanitization, getDisclaimer, } from './validators/sanitizer';
export { BaseGovernorMCPServer };
export type { ServerConfig };
export interface LegacyValidationResult {
    isValid: boolean;
    violations: string[];
    message: string;
}
export interface UniversalRules {
    NO_MEDICAL_CLAIMS: string;
    NO_SUPPLEMENTS: string;
    NO_DISEASE_NAMING: string;
    PRIVACY_FIRST: string;
    INFORMED_CONSENT: string;
}
export interface LanguageRules {
    AVOID_PRESCRIPTIVE: string[];
    USE_SUGGESTIVE: string[];
    AVOID_AUTHORITATIVE: string[];
    DEFAULT_TO_NO: string;
}
export interface ProductPrinciples {
    BASELINE_FIRST: string;
    DEVIATION_DRIVEN: string;
    BEHAVIORAL_FOCUS: string;
    CONSUMER_WELLNESS: string;
    USER_OPTIONALITY: string;
}
export declare const UNIVERSAL_RULES: UniversalRules;
export declare const LANGUAGE_RULES: LanguageRules;
export declare const PRODUCT_PRINCIPLES: ProductPrinciples;
/**
 * Validate language to ensure it follows prescribed guidelines
 * @param text - The text to validate
 * @returns Validation result with any violations found
 */
export declare function validateLanguage(text: string): LegacyValidationResult;
/**
 * Validate that a feature doesn't cross medical boundaries
 * @param feature - The feature description to validate
 * @returns Validation result with any violations found
 */
export declare function validateScope(feature: string): LegacyValidationResult;
//# sourceMappingURL=index.d.ts.map