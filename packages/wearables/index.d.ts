/**
 * Governor HQ Constitutional Framework
 * Type definitions for MCP server and safety utilities
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
export function requireStableBaseline(user: User): boolean;

/**
 * Get message to display during baseline learning phase
 */
export function getBaselineMessage(): string;

/**
 * Validate user-facing text against language rules
 */
export function validateUserFacingText(text: string): SafetyValidation;

/**
 * Convert commanding language to suggestions
 */
export function convertCommandsToSuggestions(text: string): string;

/**
 * Safe message templates
 */
export const MessageTemplates: {
  observation: (metric: string, comparison: string) => string;
  context: (pattern: string) => string;
  suggestion: (action: string) => string;
  disclaimer: () => string;
  medicalReferral: () => string;
};

/**
 * MCP Server for exposing constitutional framework as context
 */
export class GovernorHQMCPServer {
  constructor();
  
  /**
   * Start the MCP server
   */
  start(): void;
  
  /**
   * Get context summary for AI assistants
   */
  getContextSummary(): string;
  
  /**
   * Read a specific resource
   */
  readResource(name: string): string | null;
}

/**
 * Install configuration files in current project
 */
export function install(): void;
