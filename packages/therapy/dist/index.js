"use strict";
/**
 * @yelabb/constitution-therapy
 * AI Safety Constitution for Therapy and Mental Health Data Projects
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRISIS_RESOURCES = exports.THERAPY_PRINCIPLES = exports.THERAPY_CONSTRAINTS = void 0;
exports.validateTherapyLanguage = validateTherapyLanguage;
exports.validateTherapyScope = validateTherapyScope;
exports.getCrisisResources = getCrisisResources;
// Therapy-specific constraints
exports.THERAPY_CONSTRAINTS = {
    NO_DIAGNOSES: 'Systems must never diagnose mental health conditions (depression, anxiety, PTSD, etc.)',
    NO_THERAPY_ADVICE: 'Never provide therapy recommendations or treatment plans',
    NO_MEDICATION: 'Never suggest medications or dosages for mental health',
    NO_CRISIS_INTERVENTION: 'No crisis intervention - must always refer to licensed professionals and hotlines',
    NO_THERAPIST_REPLACEMENT: 'Cannot replace or substitute for licensed mental health professionals',
};
// Therapy-specific product principles
exports.THERAPY_PRINCIPLES = {
    BASELINE_FIRST: 'Learn personal emotional baseline patterns before any suggestions (30-90 days)',
    OBSERVATIONAL_ONLY: 'Mood tracking is observation-only, never diagnostic or prescriptive',
    PERSONAL_BASELINE_ONLY: 'Compare only to personal baseline, never to clinical diagnostic criteria',
    CRISIS_RESOURCES_REQUIRED: 'Always include crisis hotline resources (988, etc.) in relevant contexts',
    CONSUMER_WELLNESS: 'Position as consumer wellness tool, not mental health treatment or therapy',
};
// Crisis resources
exports.CRISIS_RESOURCES = {
    US_988: '988 Suicide & Crisis Lifeline (US) - Call/Text 988 or chat at 988lifeline.org',
    CRISIS_TEXT: 'Crisis Text Line - Text HOME to 741741',
    INTERNATIONAL: {
        UK: '116 123 (Samaritans)',
        Canada: '1-833-456-4566 (Talk Suicide Canada)',
        Australia: '13 11 14 (Lifeline)',
        International: 'findahelpline.com for worldwide resources',
    },
};
/**
 * Validate text for therapy-specific safety constraints
 * @param text - The text to validate
 * @returns Validation result with violations if any
 */
function validateTherapyLanguage(text) {
    const prohibitedTerms = [
        'you have depression', 'you are depressed', 'you have anxiety',
        'diagnosed with', 'you are experiencing', 'you suffer from',
        'treatment plan', 'therapy recommendation', 'you should take',
        'medication for', 'crisis assessment', 'suicide risk'
    ];
    const found = prohibitedTerms.filter(term => text.toLowerCase().includes(term.toLowerCase()));
    return {
        isValid: found.length === 0,
        violations: found,
        message: found.length > 0
            ? `Therapy language violation: ${found.join(', ')}`
            : 'Therapy language validation passed'
    };
}
/**
 * Check if feature is within allowed therapy scope
 * @param feature - Feature description
 * @returns Validation result
 */
function validateTherapyScope(feature) {
    const medicalKeywords = [
        'diagnosis', 'diagnose', 'treatment', 'therapy session',
        'clinical', 'psychiatric', 'counseling session', 'mental health treatment',
        'therapeutic intervention', 'crisis intervention'
    ];
    const featureLower = feature.toLowerCase();
    const found = medicalKeywords.filter(keyword => featureLower.includes(keyword));
    return {
        isValid: found.length === 0,
        violations: found,
        message: found.length > 0
            ? `Feature crosses therapy/treatment boundaries: ${found.join(', ')}`
            : 'Therapy scope validation passed'
    };
}
/**
 * Get crisis resources for display
 * @param _locale - Optional locale code (default: 'US') - reserved for future use
 * @returns Crisis hotline information
 */
function getCrisisResources(_locale = 'US') {
    // TODO: Implement locale-specific resources in future version
    return exports.CRISIS_RESOURCES;
}
//# sourceMappingURL=index.js.map