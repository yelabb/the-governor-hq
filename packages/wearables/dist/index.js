"use strict";
/**
 * Governor HQ Constitutional Framework
 * Type definitions and safety utilities for wearable health data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernorHQMCPServer = exports.MessageTemplates = void 0;
exports.requireStableBaseline = requireStableBaseline;
exports.getBaselineMessage = getBaselineMessage;
exports.validateUserFacingText = validateUserFacingText;
exports.convertCommandsToSuggestions = convertCommandsToSuggestions;
/**
 * Check if user has a stable baseline for recommendations
 */
function requireStableBaseline(user) {
    return user.baselineStatus === 'STABLE' || user.baselineStatus === 'MATURE';
}
/**
 * Get message to display during baseline learning phase
 */
function getBaselineMessage() {
    return 'Building your personal baseline. Check back in 30-90 days for personalized insights.';
}
/**
 * Validate user-facing text against language rules
 */
function validateUserFacingText(text) {
    const violations = [];
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
function convertCommandsToSuggestions(text) {
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
exports.MessageTemplates = {
    observation: (metric, comparison) => `Your ${metric} is ${comparison} your personal baseline.`,
    context: (pattern) => `This pattern has been observed: ${pattern}`,
    suggestion: (action) => `You might consider ${action}. This is optional and based on your personal patterns.`,
    disclaimer: () => 'This is not medical advice. Consult healthcare providers for medical concerns.',
    medicalReferral: () => 'For medical questions or concerns, please consult a licensed healthcare provider.'
};
/**
 * MCP Server for exposing constitutional framework as context
 */
class GovernorHQMCPServer {
    constructor() {
        // Implementation in mcp-server.ts
    }
    /**
     * Start the MCP server
     */
    start() {
        throw new Error('Use the mcp-server module directly');
    }
    /**
     * Get context summary for AI assistants
     */
    getContextSummary() {
        return 'See mcp-server.ts for implementation';
    }
    /**
     * Read a specific resource
     */
    readResource(_name) {
        return null;
    }
}
exports.GovernorHQMCPServer = GovernorHQMCPServer;
//# sourceMappingURL=index.js.map