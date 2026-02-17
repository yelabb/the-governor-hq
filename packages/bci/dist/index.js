"use strict";
/**
 * @the-governor-hq/constitution-bci
 * AI Safety Constitution for Brain-Computer Interface Data Projects
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BCI_PRINCIPLES = exports.BCI_CONSTRAINTS = void 0;
exports.validateBCILanguage = validateBCILanguage;
exports.validateBCIScope = validateBCIScope;
// BCI-specific constraints
exports.BCI_CONSTRAINTS = {
    NO_MENTAL_DIAGNOSIS: 'Systems must never diagnose mental health conditions or cognitive states',
    NO_EMOTION_READING: 'Never claim to read emotions or detect mood states from neural data',
    NO_BRAIN_STATE_DIAGNOSIS: 'No diagnosis of ADHD, depression, anxiety, or other conditions',
    NO_NEURAL_MEDICAL_CLAIMS: 'No medical interpretation of EEG, fNIRS, or other neural signals',
    NEURAL_PRIVACY_REQUIRED: 'Neural/brain data requires enhanced privacy and security controls',
};
// BCI-specific product principles
exports.BCI_PRINCIPLES = {
    BASELINE_FIRST: 'Learn personal neural baseline patterns before any suggestions (30-90 days)',
    OBSERVATIONAL_FOCUS: 'Focus on attention/relaxation observation, not diagnosis or treatment',
    PERSONAL_BASELINE_ONLY: 'Compare only to personal baseline, never to clinical diagnostic criteria',
    CONSUMER_WELLNESS: 'Position as consumer wellness tool, not medical or diagnostic device',
};
/**
 * Validate text for BCI-specific safety constraints
 * @param text - The text to validate
 * @returns Validation result with violations if any
 */
function validateBCILanguage(text) {
    const prohibitedTerms = [
        'diagnose', 'diagnosis', 'detect emotion', 'read thoughts',
        'mind reading', 'mental health', 'depression', 'anxiety', 'ADHD',
        'autism', 'cognitive assessment', 'brain disorder'
    ];
    const found = prohibitedTerms.filter(term => text.toLowerCase().includes(term.toLowerCase()));
    return {
        isValid: found.length === 0,
        violations: found,
        message: found.length > 0
            ? `BCI language violation: ${found.join(', ')}`
            : 'BCI language validation passed'
    };
}
/**
 * Check if feature is within allowed BCI scope
 * @param feature - Feature description
 * @returns Validation result
 */
function validateBCIScope(feature) {
    const medicalKeywords = [
        'treatment', 'therapy', 'cure', 'clinical',
        'medical device', 'diagnostic', 'prescription'
    ];
    const featureLower = feature.toLowerCase();
    const found = medicalKeywords.filter(keyword => featureLower.includes(keyword));
    return {
        isValid: found.length === 0,
        violations: found,
        message: found.length > 0
            ? `Feature crosses medical boundaries: ${found.join(', ')}`
            : 'BCI scope validation passed'
    };
}
//# sourceMappingURL=index.js.map