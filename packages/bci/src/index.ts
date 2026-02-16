/**
 * @yelabb/constitution-bci
 * AI Safety Constitution for Brain-Computer Interface Data Projects
 */

export interface BCIConstraints {
  /** Absolute prohibition on mental health diagnoses */
  NO_MENTAL_DIAGNOSIS: string;
  /** No emotion reading or mood detection claims */
  NO_EMOTION_READING: string;
  /** No brain state diagnosis (ADHD, depression, etc.) */
  NO_BRAIN_STATE_DIAGNOSIS: string;
  /** No medical claims about neural patterns */
  NO_NEURAL_MEDICAL_CLAIMS: string;
  /** Enhanced privacy requirements for neural data */
  NEURAL_PRIVACY_REQUIRED: string;
}

export interface BCIProductPrinciples {
  /** Learn baseline neural patterns before suggestions (30-90 days) */
  BASELINE_FIRST: string;
  /** Focus on attention/relaxation observation only */
  OBSERVATIONAL_FOCUS: string;
  /** Compare to personal baseline, not clinical norms */
  PERSONAL_BASELINE_ONLY: string;
  /** Consumer wellness positioning, not medical device */
  CONSUMER_WELLNESS: string;
}

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
  message: string;
}

// BCI-specific constraints
export const BCI_CONSTRAINTS: BCIConstraints = {
  NO_MENTAL_DIAGNOSIS: 'Systems must never diagnose mental health conditions or cognitive states',
  NO_EMOTION_READING: 'Never claim to read emotions or detect mood states from neural data',
  NO_BRAIN_STATE_DIAGNOSIS: 'No diagnosis of ADHD, depression, anxiety, or other conditions',
  NO_NEURAL_MEDICAL_CLAIMS: 'No medical interpretation of EEG, fNIRS, or other neural signals',
  NEURAL_PRIVACY_REQUIRED: 'Neural/brain data requires enhanced privacy and security controls',
};

// BCI-specific product principles
export const BCI_PRINCIPLES: BCIProductPrinciples = {
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
export function validateBCILanguage(text: string): ValidationResult {
  const prohibitedTerms = [
    'diagnose', 'diagnosis', 'detect emotion', 'read thoughts',
    'mind reading', 'mental health', 'depression', 'anxiety', 'ADHD',
    'autism', 'cognitive assessment', 'brain disorder'
  ];

  const found = prohibitedTerms.filter(term => 
    text.toLowerCase().includes(term.toLowerCase())
  );

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
export function validateBCIScope(feature: string): ValidationResult {
  const medicalKeywords = [
    'treatment', 'therapy', 'cure', 'clinical',
    'medical device', 'diagnostic', 'prescription'
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
      : 'BCI scope validation passed'
  };
}
