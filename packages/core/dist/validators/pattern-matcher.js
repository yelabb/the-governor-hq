"use strict";
/**
 * Pattern Matcher - Fast regex and keyword checks + Semantic Similarity
 * Provides <10ms validation for regex, ~100-300ms for semantic checks
 * Semantic similarity prevents spacing/spelling attacks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOTAL_PATTERN_RULES = void 0;
exports.checkForbiddenPatterns = checkForbiddenPatterns;
exports.checkPrescriptiveLanguage = checkPrescriptiveLanguage;
exports.checkMedicalKeywords = checkMedicalKeywords;
exports.checkSuggestivePatterns = checkSuggestivePatterns;
exports.checkAlarmingPatterns = checkAlarmingPatterns;
exports.runPatternChecks = runPatternChecks;
exports.patternsToViolations = patternsToViolations;
exports.calculatePatternConfidence = calculatePatternConfidence;
exports.runSemanticChecks = runSemanticChecks;
exports.semanticToViolations = semanticToViolations;
exports.runHardenedChecks = runHardenedChecks;
exports.detectAdversarialAttack = detectAdversarialAttack;
const semantic_similarity_1 = require("./semantic-similarity");
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
    // CJK treatment/medication terms
    // Simplified Chinese: 服用 (take medicine), 治疗 (treatment), 诊断 (diagnosis), 药物 (medication), 服药 (take medication)
    // Traditional Chinese: 治療 (treatment), 診斷 (diagnosis), 藥物 (medication)
    // Japanese kanji (shared with Chinese): 服用, 治療, 診断
    // Japanese katakana brand/supplement terms: メラトニン (melatonin), サプリメント (supplement)
    /服用|治疗|治療|诊断|診斷|診断|药物|藥物|服药|メラトニン|サプリメント/,
];
/** Prescriptive/commanding language patterns */
const PRESCRIPTIVE_PATTERNS = [
    /\b(must|should|need to|have to|required to|you need|you must|you should)\b/i,
    /debes|debe|devez|müssen|devi|deve|должны/i,
    // Simplified Chinese: 必须 (must). Traditional Chinese: 必須 (must). Japanese: すべき (should), しなければ (must).
    /必须|必須|すべき|しなければ/,
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
    // Simplified Chinese: 考虑 (consider). Traditional Chinese: 考慮. Japanese: 検討 (consider), ご検討 (formal consider).
    /考虑|考慮|検討|ご検討/,
    /\b(healthcare professional|doctor|physician|medical provider)\b/i,
];
/** Alarming/panic-inducing patterns */
const ALARMING_PATTERNS = [
    /\b(warning|danger|dangerous|critical|emergency|urgent|immediately|serious risk)\b/i,
];
/** Total number of built-in pattern rules (for accurate rulesChecked metadata) */
exports.TOTAL_PATTERN_RULES = FORBIDDEN_PATTERNS.length +
    PRESCRIPTIVE_PATTERNS.length +
    MEDICAL_KEYWORDS.length +
    SUGGESTIVE_PATTERNS.length +
    ALARMING_PATTERNS.length;
/**
 * Check text for forbidden patterns
 */
function checkForbiddenPatterns(text) {
    const matches = [];
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
function checkPrescriptiveLanguage(text) {
    const matches = [];
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
function checkMedicalKeywords(text) {
    const lowerText = text.toLowerCase();
    const found = [];
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
function checkSuggestivePatterns(text) {
    return SUGGESTIVE_PATTERNS.some(pattern => pattern.test(text));
}
/**
 * Check for alarming/panic-inducing language
 */
function checkAlarmingPatterns(text) {
    const matches = [];
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
 * Applies Unicode NFC normalization first so composed/decomposed forms
 * (common in Cyrillic, CJK, and accented Latin) match the same regex.
 */
function runPatternChecks(text) {
    // NFC normalization: ensures é (U+00E9) and e+combining-accent (U+0065 U+0301)
    // are treated identically, and prevents composed vs decomposed CJK variants
    // from bypassing pattern matching.
    const normalized = text.normalize('NFC');
    return {
        forbidden: checkForbiddenPatterns(normalized),
        required: checkSuggestivePatterns(normalized) ? ['suggestive-language'] : [],
        prescriptive: checkPrescriptiveLanguage(normalized),
        medical: checkMedicalKeywords(normalized),
    };
}
/**
 * Convert pattern check results to violations
 */
function patternsToViolations(patterns) {
    const violations = [];
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
function calculatePatternConfidence(patterns) {
    // Start at 1.0 (100% confidence)
    let confidence = 1.0;
    // Reduce confidence for each violation type
    if (patterns.forbidden.length > 0)
        confidence -= 0.5;
    if (patterns.medical.length > 0)
        confidence -= 0.3;
    if (patterns.prescriptive.length > 0)
        confidence -= 0.2;
    // Boost confidence if suggestive patterns are present
    if (patterns.required.length > 0)
        confidence += 0.1;
    return Math.max(0, Math.min(1, confidence));
}
/**
 * Run semantic similarity checks (async)
 * This catches adversarial attacks like spacing ("d i a g n o s e")
 * or misspellings ("diagnoz", "tratment")
 */
async function runSemanticChecks(text, threshold = 0.75) {
    return await (0, semantic_similarity_1.checkSemanticSimilarity)(text, threshold);
}
/**
 * Convert semantic check results to violations
 */
function semanticToViolations(semantic) {
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
async function runHardenedChecks(text, options = {}) {
    // Always run fast regex checks first
    const patterns = runPatternChecks(text);
    const patternViolations = patternsToViolations(patterns);
    // Run semantic checks if enabled
    let semantic;
    let semanticViolations = [];
    if (options.useSemanticSimilarity) {
        semantic = await runSemanticChecks(text, options.semanticThreshold || 0.75);
        semanticViolations = semanticToViolations(semantic);
        // Reduce false positives for prescriptive-towards-consultation language:
        // When the text contains explicit suggestive phrasing (e.g., 考虑, erwägen, "consider")
        // AND no direct prescriptive command was found by regex (e.g., must, 必须, すべき),
        // suppress only semantic-prescriptive hits — NOT semantic-diagnosis or semantic-treatment.
        // This prevents "consider talking to your doctor" from being flagged,
        // while still allowing diagnosis and treatment violations in any language to surface.
        //
        // Design note: PRESCRIPTIVE_PATTERNS already covers the prescriptive forms in all
        // tested languages (debes/deve/devez/müssen/devi/должны, 必须/必須/すべき/しなければ),
        // so for genuinely prescriptive non-English text hasExplicitPrescriptive will be true
        // and the suppression below never fires. The suppression only fires for truly suggestive
        // phrases like "Erwägen Sie einen Arzt zu konsultieren" (German: "consider consulting a
        // doctor"), where the regex correctly finds no prescriptive command — those are the
        // legitimate false-positive false-positives we need to suppress in every language.
        const hasSuggestiveLanguage = checkSuggestivePatterns(text);
        const hasExplicitPrescriptive = patterns.prescriptive.length > 0;
        if (hasSuggestiveLanguage && !hasExplicitPrescriptive) {
            semanticViolations = semanticViolations.filter(v => {
                // Only suppress prescriptive-category semantic hits, never diagnosis or treatment
                const isPrescriptiveOnly = v.rule === 'semantic-prescriptive';
                return !isPrescriptiveOnly;
            });
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
 * Pre-process text to detect adversarial manipulation attempts.
 *
 * Returns normalized text, a boolean signal, and a confidence penalty.
 * This is an **informational signal**, not an automatic violation.
 * The caller (RuntimeValidator) decides whether to escalate based on
 * whether the manipulation actually correlates with a forbidden hit.
 */
function detectAdversarialAttack(text) {
    const original = text;
    const normalized = (0, semantic_similarity_1.normalizeText)(text);
    // Check if normalization changed the text significantly
    const manipulationDetected = original.toLowerCase() !== normalized;
    let manipulationType;
    let confidencePenalty = 0;
    if (manipulationDetected) {
        // Detect spacing attack (e.g., "d i a g n o s e")
        if (/\b\w(\s+\w){3,}\b/.test(original)) {
            manipulationType = 'spacing';
            confidencePenalty = 0.15;
        }
        // Detect special character insertion (e.g., "d!i@a#g$n%o^s&e")
        else if (/[a-z][^a-z\s]{2,}[a-z]/i.test(original)) {
            manipulationType = 'special-chars';
            confidencePenalty = 0.12;
        }
        // Likely misspelling — mildest penalty (very common in benign text)
        else {
            manipulationType = 'misspelling';
            confidencePenalty = 0.05;
        }
    }
    return {
        normalized,
        manipulationDetected,
        manipulationType,
        confidencePenalty,
    };
}
//# sourceMappingURL=pattern-matcher.js.map