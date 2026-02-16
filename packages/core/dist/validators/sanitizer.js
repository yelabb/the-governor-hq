"use strict";
/**
 * Sanitizer - Auto-generate safe alternatives for unsafe content
 * Provides fallback responses when validation fails
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSafeAlternative = generateSafeAlternative;
exports.attemptSanitization = attemptSanitization;
exports.createViolationExplanation = createViolationExplanation;
exports.getDisclaimer = getDisclaimer;
/** Default safe messages by domain */
const DOMAIN_SAFE_MESSAGES = {
    core: 'I can provide general information, but for health concerns, please consult with a healthcare professional.',
    wearables: 'I can help you understand your wearable data patterns, but for health-related questions or concerns, please consult with a healthcare professional.',
    bci: 'I can provide information about your brain activity data, but any health-related concerns should be discussed with a healthcare professional.',
    therapy: 'I can help track patterns, but for mental health support or concerns, please reach out to a mental health professional.',
};
/** Safe alternatives for common violation patterns */
const SAFE_ALTERNATIVES = {
    diagnosis: 'While I can show you data patterns, I cannot provide medical diagnoses. Please consult a healthcare professional.',
    treatment: 'I cannot recommend treatments or medications. For medical advice, please speak with your healthcare provider.',
    supplements: 'I cannot recommend supplements or dosages. Please consult a healthcare professional or registered dietitian.',
    medical_claim: 'I cannot make medical claims. Your data shows patterns that might be worth discussing with a healthcare professional.',
    disease_name: 'I cannot diagnose conditions. If you have health concerns, please consult with a healthcare professional.',
    prescriptive: 'Consider discussing these patterns with a healthcare professional. This is just data, not medical advice.',
};
/**
 * Generate a safe alternative response
 */
function generateSafeAlternative(_originalText, patterns, domain = 'core', customMessage) {
    // Use custom message if provided
    if (customMessage) {
        return customMessage;
    }
    // Determine the most appropriate safe message based on violations
    if (patterns.forbidden.length > 0) {
        const forbiddenLower = patterns.forbidden.map(f => f.toLowerCase()).join(' ');
        if (forbiddenLower.includes('diagnos')) {
            return SAFE_ALTERNATIVES.diagnosis;
        }
        if (forbiddenLower.includes('treat') || forbiddenLower.includes('cure')) {
            return SAFE_ALTERNATIVES.treatment;
        }
        if (forbiddenLower.includes('supplement') || forbiddenLower.includes('vitamin') || forbiddenLower.includes('dosage')) {
            return SAFE_ALTERNATIVES.supplements;
        }
        // Check for disease/condition names
        const diseaseTerms = ['insomnia', 'depression', 'anxiety', 'apnea', 'diabetes'];
        if (diseaseTerms.some(term => forbiddenLower.includes(term))) {
            return SAFE_ALTERNATIVES.disease_name;
        }
    }
    if (patterns.medical.length > 0) {
        return SAFE_ALTERNATIVES.medical_claim;
    }
    if (patterns.prescriptive.length > 0) {
        return SAFE_ALTERNATIVES.prescriptive;
    }
    // Default to domain-specific safe message
    return DOMAIN_SAFE_MESSAGES[domain];
}
/**
 * Attempt to sanitize text by replacing unsafe patterns
 * This is a best-effort approach - blocking is safer
 */
function attemptSanitization(text) {
    let sanitized = text;
    // Replace prescriptive language with suggestive alternatives
    const prescriptiveReplacements = {
        'must': 'might',
        'should': 'could',
        'need to': 'may want to',
        'have to': 'might consider',
        'required to': 'could consider',
        'you must': 'you might',
        'you should': 'you could',
        'you need': 'you may want',
    };
    for (const [prescriptive, suggestive] of Object.entries(prescriptiveReplacements)) {
        const regex = new RegExp(`\\b${prescriptive}\\b`, 'gi');
        sanitized = sanitized.replace(regex, suggestive);
    }
    // Remove medical claims (conservative - may break sentences)
    const medicalClaims = [
        /\bdiagnos(e|ed|is|ing)\b/gi,
        /\byou (have|likely have|may have) (a|an|the)\b/gi,
    ];
    for (const pattern of medicalClaims) {
        sanitized = sanitized.replace(pattern, '[removed]');
    }
    // Clean up artifacts
    sanitized = sanitized.replace(/\s+\[removed\]\s+/g, ' ');
    sanitized = sanitized.replace(/\s{2,}/g, ' ');
    sanitized = sanitized.trim();
    return sanitized;
}
/**
 * Create a user-facing explanation of why content was blocked
 */
function createViolationExplanation(patterns) {
    const reasons = [];
    if (patterns.forbidden.length > 0) {
        reasons.push('contains medical claims or treatment language');
    }
    if (patterns.medical.length > 0) {
        reasons.push('includes medical terminology');
    }
    if (patterns.prescriptive.length > 0) {
        reasons.push('uses prescriptive/commanding language');
    }
    if (reasons.length === 0) {
        return 'violated safety constraints';
    }
    return reasons.join(', ');
}
/**
 * Get a disclaimer to append to safe content
 */
function getDisclaimer(domain) {
    const disclaimers = {
        core: 'This information is based on your data patterns and is not medical advice.',
        wearables: 'Based on your personal wearable data trends. Not medical advice. Consult a healthcare professional for health concerns.',
        bci: 'Based on your brain activity data. This is not a medical or diagnostic tool. Consult a healthcare professional for concerns.',
        therapy: 'Based on your tracked patterns. This is not a substitute for professional mental health support.',
    };
    return disclaimers[domain];
}
//# sourceMappingURL=sanitizer.js.map