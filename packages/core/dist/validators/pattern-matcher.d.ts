/**
 * Pattern Matcher - Fast regex and keyword checks + Semantic Similarity
 * Provides <10ms validation for regex, ~100-300ms for semantic checks
 * Semantic similarity prevents spacing/spelling attacks
 */
import type { PatternCheckResult, Violation, SemanticCheckResult } from './types';
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
 * Applies Unicode NFC normalization first so composed/decomposed forms
 * (common in Cyrillic, CJK, and accented Latin) match the same regex.
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
/**
 * Run semantic similarity checks (async)
 * This catches adversarial attacks like spacing ("d i a g n o s e")
 * or misspellings ("diagnoz", "tratment")
 */
export declare function runSemanticChecks(text: string, threshold?: number): Promise<SemanticCheckResult>;
/**
 * Convert semantic check results to violations
 */
export declare function semanticToViolations(semantic: SemanticCheckResult): Violation[];
/**
 * Hardened pattern checks: Combines regex + semantic similarity
 * Returns both fast pattern matches and semantic matches
 */
export declare function runHardenedChecks(text: string, options?: {
    useSemanticSimilarity?: boolean;
    semanticThreshold?: number;
}): Promise<{
    patterns: PatternCheckResult;
    semantic?: SemanticCheckResult;
    allViolations: Violation[];
}>;
/**
 * Pre-process text to detect adversarial attacks
 * Returns normalized text and whether manipulation was detected
 */
export declare function detectAdversarialAttack(text: string): {
    normalized: string;
    manipulationDetected: boolean;
    manipulationType?: 'spacing' | 'special-chars' | 'misspelling';
};
//# sourceMappingURL=pattern-matcher.d.ts.map