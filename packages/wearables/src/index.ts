/**
 * Governor HQ Constitutional Framework
 * Type definitions and safety utilities for wearable health data
 */

export interface User {
  id: string;
  baselineStatus: 'LEARNING' | 'EARLY' | 'STABLE' | 'MATURE';
  personalBaseline?: {
    hrv: number;
    restingHR: number;
    sleepDuration: number;
  };
  currentHRV?: number;
  currentRestingHR?: number;
}

export interface SafetyValidation {
  valid: boolean;
  violations: string[];
}

export interface MessageTemplate {
  title: string;
  body: string;
  tone: 'neutral' | 'encouraging' | 'informational';
}

/**
 * Check if user has a stable baseline for recommendations
 */
export function requireStableBaseline(user: User): boolean {
  return user.baselineStatus === 'STABLE' || user.baselineStatus === 'MATURE';
}

/**
 * Get message to display during baseline learning phase
 */
export function getBaselineMessage(): string {
  return 'Building your personal baseline. Check back in 30-90 days for personalized insights.';
}

/**
 * Validate user-facing text against language rules
 */
export function validateUserFacingText(text: string): SafetyValidation {
  const violations: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for medical claims
  const medicalTerms = [
    'diagnose', 'diagnosis', 'treat', 'treatment', 'cure', 'disease',
    'medical', 'clinical', 'doctor', 'physician'
  ];
  medicalTerms.forEach(term => {
    if (lowerText.includes(term)) {
      violations.push(`Medical term: ${term}`);
    }
  });

  // Check for commanding language
  const commandingWords = ['must', 'should', 'need to', 'have to', 'required'];
  commandingWords.forEach(word => {
    if (lowerText.includes(word)) {
      violations.push(`Commanding language: ${word}`);
    }
  });

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Convert commanding language to suggestions
 */
export function convertCommandsToSuggestions(text: string): string {
  return text
    .replace(/\bmust\b/gi, 'might want to')
    .replace(/\bshould\b/gi, 'could')
    .replace(/\bneed to\b/gi, 'consider')
    .replace(/\bhave to\b/gi, 'may want to')
    .replace(/\brequired\b/gi, 'optional');
}

/**
 * Safe message templates
 */
export const MessageTemplates = {
  observation: (metric: string, comparison: string) => 
    `Your ${metric} is ${comparison} your personal baseline.`,
  
  context: (pattern: string) => 
    `This pattern has been observed: ${pattern}`,
  
  suggestion: (action: string) => 
    `You might consider ${action}. This is optional and based on your personal patterns.`,
  
  disclaimer: () => 
    'This is not medical advice. Consult healthcare providers for medical concerns.',
  
  medicalReferral: () => 
    'For medical questions or concerns, please consult a licensed healthcare provider.'
};

/**
 * MCP Server for exposing constitutional framework as context
 */
export class GovernorHQMCPServer {
  constructor() {
    // Implementation in mcp-server.ts
  }
  
  /**
   * Start the MCP server
   */
  start(): void {
    throw new Error('Use the mcp-server module directly');
  }
  
  /**
   * Get context summary for AI assistants
   */
  getContextSummary(): string {
    return 'See mcp-server.ts for implementation';
  }
  
  /**
   * Read a specific resource
   */
  readResource(_name: string): string | null {
    return null;
  }
}
