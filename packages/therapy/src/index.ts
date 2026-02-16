/**
 * @yelabb/constitution-therapy
 * AI Safety Constitution for Therapy and Mental Health Data Projects
 */

export interface TherapyConstraints {
  /** Absolute prohibition on mental health diagnoses */
  NO_DIAGNOSES: string;
  /** No therapy or treatment recommendations */
  NO_THERAPY_ADVICE: string;
  /** No medication suggestions */
  NO_MEDICATION: string;
  /** No crisis intervention (must refer to professionals) */
  NO_CRISIS_INTERVENTION: string;
  /** Cannot replace licensed mental health professionals */
  NO_THERAPIST_REPLACEMENT: string;
}

export interface TherapyProductPrinciples {
  /** Learn baseline emotional patterns before suggestions (30-90 days) */
  BASELINE_FIRST: string;
  /** Observation-only mood tracking */
  OBSERVATIONAL_ONLY: string;
  /** Compare to personal baseline, not diagnostic criteria */
  PERSONAL_BASELINE_ONLY: string;
  /** Always include crisis resources */
  CRISIS_RESOURCES_REQUIRED: string;
  /** Consumer wellness positioning, not mental health treatment */
  CONSUMER_WELLNESS: string;
}

export interface CrisisResources {
  /** US Suicide & Crisis Lifeline */
  US_988: string;
  /** Crisis Text Line */
  CRISIS_TEXT: string;
  /** International resources */
  INTERNATIONAL: Record<string, string>;
}

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
  message: string;
}

// Therapy-specific constraints
export const THERAPY_CONSTRAINTS: TherapyConstraints = {
  NO_DIAGNOSES: 'Systems must never diagnose mental health conditions (depression, anxiety, PTSD, etc.)',
  NO_THERAPY_ADVICE: 'Never provide therapy recommendations or treatment plans',
  NO_MEDICATION: 'Never suggest medications or dosages for mental health',
  NO_CRISIS_INTERVENTION: 'No crisis intervention - must always refer to licensed professionals and hotlines',
  NO_THERAPIST_REPLACEMENT: 'Cannot replace or substitute for licensed mental health professionals',
};

// Therapy-specific product principles
export const THERAPY_PRINCIPLES: TherapyProductPrinciples = {
  BASELINE_FIRST: 'Learn personal emotional baseline patterns before any suggestions (30-90 days)',
  OBSERVATIONAL_ONLY: 'Mood tracking is observation-only, never diagnostic or prescriptive',
  PERSONAL_BASELINE_ONLY: 'Compare only to personal baseline, never to clinical diagnostic criteria',
  CRISIS_RESOURCES_REQUIRED: 'Always include crisis hotline resources (988, etc.) in relevant contexts',
  CONSUMER_WELLNESS: 'Position as consumer wellness tool, not mental health treatment or therapy',
};

// Crisis resources
export const CRISIS_RESOURCES: CrisisResources = {
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
export function validateTherapyLanguage(text: string): ValidationResult {
  const prohibitedTerms = [
    'you have depression', 'you are depressed', 'you have anxiety',
    'diagnosed with', 'you are experiencing', 'you suffer from',
    'treatment plan', 'therapy recommendation', 'you should take',
    'medication for', 'crisis assessment', 'suicide risk'
  ];

  const found = prohibitedTerms.filter(term => 
    text.toLowerCase().includes(term.toLowerCase())
  );

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
export function validateTherapyScope(feature: string): ValidationResult {
  const medicalKeywords = [
    'diagnosis', 'diagnose', 'treatment', 'therapy session',
    'clinical', 'psychiatric', 'counseling session', 'mental health treatment',
    'therapeutic intervention', 'crisis intervention'
  ];

  const featureLower = feature.toLowerCase();
  const found = medicalKeywords.filter(keyword => 
    featureLower.includes(keyword)
  );

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
export function getCrisisResources(_locale: string = 'US'): CrisisResources {
  // TODO: Implement locale-specific resources in future version
  return CRISIS_RESOURCES;
}
