/**
 * @yelabb/constitution-core
 * 
 * Core AI Safety Infrastructure for Governor HQ Constitutional Framework
 * Shared rules and utilities for all domain-specific constitutions
 */

module.exports = {
  // Core safety rules that apply to all domains
  UNIVERSAL_RULES: {
    NO_MEDICAL_CLAIMS: 'Systems must never make medical diagnoses, claims, or treatment recommendations',
    NO_SUPPLEMENTS: 'Never recommend supplements, pharmaceuticals, or dosages',
    NO_DISEASE_NAMING: 'Avoid naming diseases, conditions, or medical terminology',
    PRIVACY_FIRST: 'User data must be handled with strict privacy controls',
    INFORMED_CONSENT: 'Users must understand what data is collected and how it\'s used',
  },

  // Language constraints for all domains
  LANGUAGE_RULES: {
    AVOID_PRESCRIPTIVE: ['must', 'should', 'need to', 'have to', 'required'],
    USE_SUGGESTIVE: ['consider', 'might', 'could', 'may want to', 'option'],
    AVOID_AUTHORITATIVE: ['diagnosed', 'treatment', 'cure', 'medical', 'clinical'],
    DEFAULT_TO_NO: 'When uncertain about a feature or suggestion, default to NO',
  },

  // Core product principles
  PRODUCT_PRINCIPLES: {
    BASELINE_FIRST: 'Learn individual patterns before making any suggestions (30-90 days)',
    DEVIATION_DRIVEN: 'Only activate when meaningful deviation from baseline is detected',
    BEHAVIORAL_FOCUS: 'Suggest behavioral adjustments, not medical interventions',
    CONSUMER_WELLNESS: 'Clear positioning as consumer wellness, not medical devices',
    USER_OPTIONALITY: 'All suggestions are optional - users maintain full control',
  },

  // Utility functions
  validateLanguage: function(text) {
    const prescriptive = this.LANGUAGE_RULES.AVOID_PRESCRIPTIVE;
    const found = prescriptive.filter(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
    return {
      isValid: found.length === 0,
      violations: found,
      message: found.length > 0 
        ? `Avoid prescriptive language: ${found.join(', ')}`
        : 'Language validation passed'
    };
  },

  validateScope: function(feature) {
    // Helper to check if a feature crosses safety boundaries
    const medicalKeywords = [
      'diagnose', 'diagnosis', 'treat', 'treatment', 'cure', 
      'medication', 'prescription', 'disease', 'disorder', 
      'syndrome', 'condition', 'medical'
    ];
    
    const featureLower = feature.toLowerCase();
    const found = medicalKeywords.filter(keyword => 
      featureLower.includes(keyword)
    );
    
    return {
      isValid: found.length === 0,
      violations: found,
      message: found.length > 0
        ? `Feature crosses medical boundaries: ${found.join(', ')}`
        : 'Scope validation passed'
    };
  }
};
