/**
 * Pattern Matcher - Fast regex and keyword checks
 * Provides <10ms validation for most cases
 */
import type { PatternCheckResult, Violation } from './types';
/**
 * Check text for forbidden patterns
 */
export declare function checkForbiddenPatterns(text: string): string[];
/**
 * Check text for prescriptive language
 */
export declare function checkPrescriptiveLanguage(text: string): string[];
/**
 * Check text for medical keywords
 */
export declare function checkMedicalKeywords(text: string): string[];
/**
 * Check if text has required suggestive patterns
 */
export declare function checkSuggestivePatterns(text: string): boolean;
/**
 * Check for alarming/panic-inducing language
 */
export declare function checkAlarmingPatterns(text: string): string[];
/**
 * Run all pattern checks
 */
export declare function runPatternChecks(text: string): PatternCheckResult;
/**
 * Convert pattern check results to violations
 */
export declare function patternsToViolations(patterns: PatternCheckResult): Violation[];
/**
 * Calculate confidence score based on pattern checks
 */
export declare function calculatePatternConfidence(patterns: PatternCheckResult): number;
//# sourceMappingURL=pattern-matcher.d.ts.map