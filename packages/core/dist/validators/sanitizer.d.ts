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
 * @deprecated This function is deprecated and will be removed in a future version.
 *
 * Naive auto-sanitization is unsafe because it semantically alters medical/safety advice.
 * Programmatically replacing words like "must" → "might" or removing medical terms
 * can create misleading or dangerous content.
 *
 * **Why this is deprecated:**
 * - Auto-replacing medical terms can create false sense of safety
 * - Semantic changes to health advice can be dangerous
 * - Better to block unsafe content than to modify it programmatically
 *
 * **Migration path:**
 * - Use `onViolation: 'block'` instead of `onViolation: 'sanitize'`
 * - Use `generateSafeAlternative()` to provide explicit safe alternatives
 * - Let humans review and rewrite unsafe content, not automated replacements
 *
 * This function now returns a blocked message instead of attempting sanitization.
 */
export declare function attemptSanitization(_text: string): string;
/**
 * Create a user-facing explanation of why content was blocked
 */
export declare function createViolationExplanation(patterns: PatternCheckResult): string;
/**
 * Get a disclaimer to append to safe content
 */
export declare function getDisclaimer(domain: Domain): string;
//# sourceMappingURL=sanitizer.d.ts.map