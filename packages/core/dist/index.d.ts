/**
 * @yelabb/constitution-core
 *
 * Core AI Safety Infrastructure for Governor HQ Constitutional Framework
 * Shared rules and utilities for all domain-specific constitutions
 */
import { BaseGovernorMCPServer } from './base-mcp-server';
import type { ServerConfig } from './base-mcp-server';
export { BaseGovernorMCPServer };
export type { ServerConfig };
export interface ValidationResult {
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
export declare function validateLanguage(text: string): ValidationResult;
/**
 * Validate that a feature doesn't cross medical boundaries
 * @param feature - The feature description to validate
 * @returns Validation result with any violations found
 */
export declare function validateScope(feature: string): ValidationResult;
//# sourceMappingURL=index.d.ts.map