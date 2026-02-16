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
export declare function requireStableBaseline(user: User): boolean;
/**
 * Get message to display during baseline learning phase
 */
export declare function getBaselineMessage(): string;
/**
 * Validate user-facing text against language rules
 */
export declare function validateUserFacingText(text: string): SafetyValidation;
/**
 * Convert commanding language to suggestions
 */
export declare function convertCommandsToSuggestions(text: string): string;
/**
 * Safe message templates
 */
export declare const MessageTemplates: {
    observation: (metric: string, comparison: string) => string;
    context: (pattern: string) => string;
    suggestion: (action: string) => string;
    disclaimer: () => string;
    medicalReferral: () => string;
};
/**
 * MCP Server for exposing constitutional framework as context
 */
export declare class GovernorHQMCPServer {
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
    readResource(_name: string): string | null;
}
//# sourceMappingURL=index.d.ts.map