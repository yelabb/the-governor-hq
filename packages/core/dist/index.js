"use strict";
/**
 * @yelabb/constitution-core
 *
 * Core AI Safety Infrastructure for Governor HQ Constitutional Framework
 * Shared rules and utilities for all domain-specific constitutions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCT_PRINCIPLES = exports.LANGUAGE_RULES = exports.UNIVERSAL_RULES = exports.BaseGovernorMCPServer = exports.getDisclaimer = exports.attemptSanitization = exports.generateSafeAlternative = exports.checkAlarmingPatterns = exports.checkSuggestivePatterns = exports.checkMedicalKeywords = exports.checkPrescriptiveLanguage = exports.checkForbiddenPatterns = exports.runPatternChecks = exports.validateResponse = exports.withFieldValidation = exports.createGovernorValidator = exports.withGovernor = exports.validationErrorHandler = exports.validateField = exports.governorValidator = exports.validateText = exports.createValidator = exports.RuntimeValidator = void 0;
exports.validateLanguage = validateLanguage;
exports.validateScope = validateScope;
const base_mcp_server_1 = require("./base-mcp-server");
Object.defineProperty(exports, "BaseGovernorMCPServer", { enumerable: true, get: function () { return base_mcp_server_1.BaseGovernorMCPServer; } });
// Runtime Validator (Hard Post-Generation Gate)
var runtime_validator_1 = require("./validators/runtime-validator");
Object.defineProperty(exports, "RuntimeValidator", { enumerable: true, get: function () { return runtime_validator_1.RuntimeValidator; } });
Object.defineProperty(exports, "createValidator", { enumerable: true, get: function () { return runtime_validator_1.createValidator; } });
Object.defineProperty(exports, "validateText", { enumerable: true, get: function () { return runtime_validator_1.validateText; } });
// Middleware
var express_1 = require("./middleware/express");
Object.defineProperty(exports, "governorValidator", { enumerable: true, get: function () { return express_1.governorValidator; } });
Object.defineProperty(exports, "validateField", { enumerable: true, get: function () { return express_1.validateField; } });
Object.defineProperty(exports, "validationErrorHandler", { enumerable: true, get: function () { return express_1.validationErrorHandler; } });
var nextjs_1 = require("./middleware/nextjs");
Object.defineProperty(exports, "withGovernor", { enumerable: true, get: function () { return nextjs_1.withGovernor; } });
Object.defineProperty(exports, "createGovernorValidator", { enumerable: true, get: function () { return nextjs_1.createGovernorValidator; } });
Object.defineProperty(exports, "withFieldValidation", { enumerable: true, get: function () { return nextjs_1.withFieldValidation; } });
Object.defineProperty(exports, "validateResponse", { enumerable: true, get: function () { return nextjs_1.validateResponse; } });
// Pattern Matching & Sanitization (for advanced use cases)
var pattern_matcher_1 = require("./validators/pattern-matcher");
Object.defineProperty(exports, "runPatternChecks", { enumerable: true, get: function () { return pattern_matcher_1.runPatternChecks; } });
Object.defineProperty(exports, "checkForbiddenPatterns", { enumerable: true, get: function () { return pattern_matcher_1.checkForbiddenPatterns; } });
Object.defineProperty(exports, "checkPrescriptiveLanguage", { enumerable: true, get: function () { return pattern_matcher_1.checkPrescriptiveLanguage; } });
Object.defineProperty(exports, "checkMedicalKeywords", { enumerable: true, get: function () { return pattern_matcher_1.checkMedicalKeywords; } });
Object.defineProperty(exports, "checkSuggestivePatterns", { enumerable: true, get: function () { return pattern_matcher_1.checkSuggestivePatterns; } });
Object.defineProperty(exports, "checkAlarmingPatterns", { enumerable: true, get: function () { return pattern_matcher_1.checkAlarmingPatterns; } });
var sanitizer_1 = require("./validators/sanitizer");
Object.defineProperty(exports, "generateSafeAlternative", { enumerable: true, get: function () { return sanitizer_1.generateSafeAlternative; } });
Object.defineProperty(exports, "attemptSanitization", { enumerable: true, get: function () { return sanitizer_1.attemptSanitization; } });
Object.defineProperty(exports, "getDisclaimer", { enumerable: true, get: function () { return sanitizer_1.getDisclaimer; } });
// Core safety rules that apply to all domains
exports.UNIVERSAL_RULES = {
    NO_MEDICAL_CLAIMS: 'Systems must never make medical diagnoses, claims, or treatment recommendations',
    NO_SUPPLEMENTS: 'Never recommend supplements, pharmaceuticals, or dosages',
    NO_DISEASE_NAMING: 'Avoid naming diseases, conditions, or medical terminology',
    PRIVACY_FIRST: 'User data must be handled with strict privacy controls',
    INFORMED_CONSENT: 'Users must understand what data is collected and how it\'s used',
};
// Language constraints for all domains
exports.LANGUAGE_RULES = {
    AVOID_PRESCRIPTIVE: ['must', 'should', 'need to', 'have to', 'required'],
    USE_SUGGESTIVE: ['consider', 'might', 'could', 'may want to', 'option'],
    AVOID_AUTHORITATIVE: ['diagnosed', 'treatment', 'cure', 'medical', 'clinical'],
    DEFAULT_TO_NO: 'When uncertain about a feature or suggestion, default to NO',
};
// Core product principles
exports.PRODUCT_PRINCIPLES = {
    BASELINE_FIRST: 'Learn individual patterns before making any suggestions (30-90 days)',
    DEVIATION_DRIVEN: 'Only activate when meaningful deviation from baseline is detected',
    BEHAVIORAL_FOCUS: 'Suggest behavioral adjustments, not medical interventions',
    CONSUMER_WELLNESS: 'Clear positioning as consumer wellness, not medical devices',
    USER_OPTIONALITY: 'All suggestions are optional - users maintain full control',
};
/**
 * Validate language to ensure it follows prescribed guidelines
 * @param text - The text to validate
 * @returns Validation result with any violations found
 */
function validateLanguage(text) {
    const prescriptive = exports.LANGUAGE_RULES.AVOID_PRESCRIPTIVE;
    const found = prescriptive.filter(word => text.toLowerCase().includes(word.toLowerCase()));
    return {
        isValid: found.length === 0,
        violations: found,
        message: found.length > 0
            ? `Avoid prescriptive language: ${found.join(', ')}`
            : 'Language validation passed'
    };
}
/**
 * Validate that a feature doesn't cross medical boundaries
 * @param feature - The feature description to validate
 * @returns Validation result with any violations found
 */
function validateScope(feature) {
    // Helper to check if a feature crosses safety boundaries
    const medicalKeywords = [
        'diagnose', 'diagnosis', 'treat', 'treatment', 'cure',
        'medication', 'prescription', 'disease', 'disorder',
        'syndrome', 'condition', 'medical'
    ];
    const featureLower = feature.toLowerCase();
    const found = medicalKeywords.filter(keyword => featureLower.includes(keyword));
    return {
        isValid: found.length === 0,
        violations: found,
        message: found.length > 0
            ? `Feature crosses medical boundaries: ${found.join(', ')}`
            : 'Scope validation passed'
    };
}
//# sourceMappingURL=index.js.map