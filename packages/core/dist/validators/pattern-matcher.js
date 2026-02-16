"use strict";
/**
 * Pattern Matcher - Fast regex and keyword checks
 * Provides <10ms validation for most cases
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForbiddenPatterns = checkForbiddenPatterns;
exports.checkPrescriptiveLanguage = checkPrescriptiveLanguage;
exports.checkMedicalKeywords = checkMedicalKeywords;
exports.checkSuggestivePatterns = checkSuggestivePatterns;
exports.checkAlarmingPatterns = checkAlarmingPatterns;
exports.runPatternChecks = runPatternChecks;
exports.patternsToViolations = patternsToViolations;
exports.calculatePatternConfidence = calculatePatternConfidence;
/** Forbidden patterns that indicate medical claims */
const FORBIDDEN_PATTERNS = [
    // Medical diagnoses
    /\b(diagnos(e|ed|is|ing)|you have|you likely have|you may have)\b/i,
    // Disease and condition names
    /\b(insomnia|depression|anxiety disorder|sleep apnea|cardiovascular disease|diabetes|hypertension)\b/i,
    // Treatment language
    /\b(cure|cures|curing|cured|treat|treats|treating|treated|heal|heals|healing|prevent|prevents)\b/i,
    // Supplements and medications
    /\b(take|taking|dosage|mg|milligram|supplement|vitamin|melatonin|magnesium|medication|prescription)\b/i,
    // Medical scope violations
    /\b(medical condition|health condition|disorder|syndrome|symptom of|sign of|indicates)\b/i,
];
/** Prescriptive/commanding language patterns */
const PRESCRIPTIVE_PATTERNS = [
    /\b(must|should|need to|have to|required to|you need|you must|you should)\b/i,
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
    /\b(healthcare professional|doctor|physician|medical provider)\b/i,
];
/** Alarming/panic-inducing patterns */
const ALARMING_PATTERNS = [
    /\b(warning|danger|dangerous|critical|emergency|urgent|immediately|serious risk)\b/i,
];
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
 */
function runPatternChecks(text) {
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
//# sourceMappingURL=pattern-matcher.js.map