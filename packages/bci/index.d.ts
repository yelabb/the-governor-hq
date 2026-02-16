/**
 * TypeScript definitions for @yelabb/constitution-bci
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

/**
 * Validate text for BCI-specific safety constraints
 * @param text - The text to validate
 * @returns Validation result with violations if any
 */
export function validateBCILanguage(text: string): ValidationResult;

/**
 * Check if feature is within allowed BCI scope
 * @param feature - Feature description
 * @returns Validation result
 */
export function validateBCIScope(feature: string): ValidationResult;

/**
 * BCI-specific constraints and principles
 */
export const BCI_CONSTRAINTS: BCIConstraints;
export const BCI_PRINCIPLES: BCIProductPrinciples;
