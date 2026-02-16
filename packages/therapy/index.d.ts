/**
 * TypeScript definitions for @yelabb/constitution-therapy
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

/**
 * Validate text for therapy-specific safety constraints
 * @param text - The text to validate
 * @returns Validation result with violations if any
 */
export function validateTherapyLanguage(text: string): ValidationResult;

/**
 * Check if feature is within allowed therapy scope
 * @param feature - Feature description
 * @returns Validation result
 */
export function validateTherapyScope(feature: string): ValidationResult;

/**
 * Get crisis resources for display
 * @param locale - Optional locale code (default: 'US')
 * @returns Crisis hotline information
 */
export function getCrisisResources(locale?: string): CrisisResources;

/**
 * Therapy-specific constraints and principles
 */
export const THERAPY_CONSTRAINTS: TherapyConstraints;
export const THERAPY_PRINCIPLES: TherapyProductPrinciples;
export const CRISIS_RESOURCES: CrisisResources;
