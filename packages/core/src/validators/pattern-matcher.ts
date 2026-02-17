/**
 * Pattern Matcher - Fast regex and keyword checks + Semantic Similarity
 * Provides <10ms validation for regex, ~100-300ms for semantic checks
 * Semantic similarity prevents spacing/spelling attacks
 */

import type { PatternCheckResult, Violation, SemanticCheckResult } from './types';
import { checkSemanticSimilarity, normalizeText } from './semantic-similarity';

/** Forbidden patterns that indicate medical claims */
const FORBIDDEN_PATTERNS = [
  // Medical diagnoses
  /\b(diagnos(e|ed|is|ing)|you have|you likely have|you may have)\b/i,
  
  // Disease and condition names
  /\b(insomnia|insomnio|insomnie|insonnia|insônia|depression|anxiety disorder|sleep apnea|schlafapnoe|cardiovascular disease|diabetes|hypertension)\b/i,
  
  // Treatment language
  /\b(cure|cures|curing|cured|treat|treats|treating|treated|heal|heals|healing|prevent|prevents|tratamiento|traiter|behandlung|curare|tratar)\b/i,

  // Cyrillic treatment terms
  /принимайте|лечения/i,
  
  // Supplements and medications
  /\b(take|taking|dosage|mg|milligram|supplement|vitamin|melatonin|magnesium|medication|prescription|toma|prenez|nehmen|prendi|tome)\b/i,
  
  // Medical scope violations
  /\b(medical condition|health condition|disorder|syndrome|symptom of|sign of|indicates)\b/i,

  // CJK treatment terms
  /服用|治療/,
];

/** Prescriptive/commanding language patterns */
const PRESCRIPTIVE_PATTERNS = [
  /\b(must|should|need to|have to|required to|you need|you must|you should)\b/i,
  /debes|debe|devez|müssen|devi|deve|должны/i,
  /必须|すべき/,
];

/** Authoritative medical terms */
const MEDICAL_KEYWORDS = [
  'diagnosis', 'clinical', 'medical', 'pathological', 'syndrome',
  'disorder', 'disease', 'condition', 'treatment', 'therapy',
  'prescription', 'pharmaceutical', 'drug', 'medication',
];

/** Required suggestive language patterns (good patterns) */
const SUGGESTIVE_PATTERNS = [
  /\b(consider|might|could|may want to|option|when ready|if you'd like)\b/i,
  /considera|considere|envisager|pourriez|erwägen|potresti|рассмотрите\s+возможность/i,
  /考虑|検討/,
  /\b(healthcare professional|doctor|physician|medical provider)\b/i,
];

/** Alarming/panic-inducing patterns */
const ALARMING_PATTERNS = [
  /\b(warning|danger|dangerous|critical|emergency|urgent|immediately|serious risk)\b/i,
];

/**
 * Check text for forbidden patterns
 */
export function checkForbiddenPatterns(text: string): string[] {
  const matches: string[] = [];
  
  for (const pattern of FORBIDDEN_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  
  return matches;
}

/**
 * Check text for prescriptive language
 */
export function checkPrescriptiveLanguage(text: string): string[] {
  const matches: string[] = [];
  
  for (const pattern of PRESCRIPTIVE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  
  return matches;
}

/**
 * Check text for medical keywords
 */
export function checkMedicalKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  
  for (const keyword of MEDICAL_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      found.push(keyword);
    }
  }
  
  return found;
}

/**
 * Check if text has required suggestive patterns
 */
export function checkSuggestivePatterns(text: string): boolean {
  return SUGGESTIVE_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check for alarming/panic-inducing language
 */
export function checkAlarmingPatterns(text: string): string[] {
  const matches: string[] = [];
  
  for (const pattern of ALARMING_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  
  return matches;
}

/**
 * Run all pattern checks
 */
export function runPatternChecks(text: string): PatternCheckResult {
  return {
    forbidden: checkForbiddenPatterns(text),
    required: checkSuggestivePatterns(text) ? ['suggestive-language'] : [],
    prescriptive: checkPrescriptiveLanguage(text),
    medical: checkMedicalKeywords(text),
  };
}

/**
 * Convert pattern check results to violations
 */
export function patternsToViolations(patterns: PatternCheckResult): Violation[] {
  const violations: Violation[] = [];
  
  if (patterns.forbidden.length > 0) {
    violations.push({
      rule: 'forbidden-patterns',
      severity: 'critical',
      message: `Forbidden medical/treatment language detected: ${patterns.forbidden.join(', ')}`,
      matched: patterns.forbidden,
    });
  }
  
  if (patterns.medical.length > 0) {
    violations.push({
      rule: 'medical-keywords',
      severity: 'high',
      message: `Medical terminology detected: ${patterns.medical.join(', ')}`,
      matched: patterns.medical,
    });
  }
  
  if (patterns.prescriptive.length > 0) {
    violations.push({
      rule: 'prescriptive-language',
      severity: 'medium',
      message: `Prescriptive/commanding language detected: ${patterns.prescriptive.join(', ')}`,
      matched: patterns.prescriptive,
    });
  }
  
  return violations;
}

/**
 * Calculate confidence score based on pattern checks
 */
export function calculatePatternConfidence(patterns: PatternCheckResult): number {
  // Start at 1.0 (100% confidence)
  let confidence = 1.0;
  
  // Reduce confidence for each violation type
  if (patterns.forbidden.length > 0) confidence -= 0.5;
  if (patterns.medical.length > 0) confidence -= 0.3;
  if (patterns.prescriptive.length > 0) confidence -= 0.2;
  
  // Boost confidence if suggestive patterns are present
  if (patterns.required.length > 0) confidence += 0.1;
  
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Run semantic similarity checks (async)
 * This catches adversarial attacks like spacing ("d i a g n o s e") 
 * or misspellings ("diagnoz", "tratment")
 */
export async function runSemanticChecks(
  text: string,
  threshold: number = 0.75
): Promise<SemanticCheckResult> {
  return await checkSemanticSimilarity(text, threshold);
}

/**
 * Convert semantic check results to violations
 */
export function semanticToViolations(semantic: SemanticCheckResult): Violation[] {
  return semantic.violations.map(v => ({
    rule: `semantic-${v.category}`,
    severity: v.severity,
    message: `Semantic match for forbidden concept "${v.concept}" (${Math.round(v.similarity * 100)}% similar to: "${v.example}")`,
    matched: [v.concept],
  }));
}

/**
 * Hardened pattern checks: Combines regex + semantic similarity
 * Returns both fast pattern matches and semantic matches
 */
export async function runHardenedChecks(
  text: string,
  options: {
    useSemanticSimilarity?: boolean;
    semanticThreshold?: number;
  } = {}
): Promise<{
  patterns: PatternCheckResult;
  semantic?: SemanticCheckResult;
  allViolations: Violation[];
}> {
  // Always run fast regex checks first
  const patterns = runPatternChecks(text);
  const patternViolations = patternsToViolations(patterns);
  
  // Run semantic checks if enabled
  let semantic: SemanticCheckResult | undefined;
  let semanticViolations: Violation[] = [];
  
  if (options.useSemanticSimilarity) {
    semantic = await runSemanticChecks(text, options.semanticThreshold || 0.75);
    semanticViolations = semanticToViolations(semantic);

    // Reduce false positives: if language is suggestive and has no explicit prescriptive pattern,
    // ignore semantic-prescriptive hits while keeping diagnosis/treatment blocks intact.
    const hasSuggestiveLanguage = checkSuggestivePatterns(text);
    const hasExplicitPrescriptive = patterns.prescriptive.length > 0;
    if (hasSuggestiveLanguage && !hasExplicitPrescriptive) {
      semanticViolations = semanticViolations.filter(v => v.rule !== 'semantic-prescriptive');
    }
  }
  
  // Combine all violations
  const allViolations = [...patternViolations, ...semanticViolations];
  
  return {
    patterns,
    semantic,
    allViolations,
  };
}

/**
 * Pre-process text to detect adversarial attacks
 * Returns normalized text and whether manipulation was detected
 */
export function detectAdversarialAttack(text: string): {
  normalized: string;
  manipulationDetected: boolean;
  manipulationType?: 'spacing' | 'special-chars' | 'misspelling';
} {
  const original = text;
  const normalized = normalizeText(text);
  
  // Check if normalization changed the text significantly
  const manipulationDetected = original.toLowerCase() !== normalized;
  
  let manipulationType: 'spacing' | 'special-chars' | 'misspelling' | undefined;
  
  if (manipulationDetected) {
    // Detect spacing attack (e.g., "d i a g n o s e")
    if (/\b\w(\s+\w){3,}\b/.test(original)) {
      manipulationType = 'spacing';
    }
    // Detect special character insertion (e.g., "d!i@a#g$n%o^s&e")
    else if (/[a-z][^a-z\s]{2,}[a-z]/i.test(original)) {
      manipulationType = 'special-chars';
    }
    // Likely misspelling
    else {
      manipulationType = 'misspelling';
    }
  }
  
  return {
    normalized,
    manipulationDetected,
    manipulationType,
  };
}
