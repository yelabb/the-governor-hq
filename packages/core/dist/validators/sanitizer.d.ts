/**
 * Sanitizer - Auto-generate safe alternatives for unsafe content
 * Provides fallback responses when validation fails
 */
import type { Domain, PatternCheckResult } from './types';
/**
 * Generate a safe alternative response
 */
export declare function generateSafeAlternative(_originalText: string, patterns: PatternCheckResult, domain?: Domain, customMessage?: string): string;
/**
 * Attempt to sanitize text by replacing unsafe patterns
 * This is a best-effort approach - blocking is safer
 */
export declare function attemptSanitization(text: string): string;
/**
 * Create a user-facing explanation of why content was blocked
 */
export declare function createViolationExplanation(patterns: PatternCheckResult): string;
/**
 * Get a disclaimer to append to safe content
 */
export declare function getDisclaimer(domain: Domain): string;
//# sourceMappingURL=sanitizer.d.ts.map