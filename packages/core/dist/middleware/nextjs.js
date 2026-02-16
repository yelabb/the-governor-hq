"use strict";
/**
 * Next.js Middleware for Governor HQ Validator
 * Auto-validate AI responses in Next.js API routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.withGovernor = withGovernor;
exports.createGovernorValidator = createGovernorValidator;
exports.withFieldValidation = withFieldValidation;
exports.validateResponse = validateResponse;
const runtime_validator_1 = require("../validators/runtime-validator");
/**
 * Higher-order function to wrap Next.js API routes with validation
 *
 * @example
 * ```typescript
 * export default withGovernor(
 *   async (req, res) => {
 *     const aiResponse = await callLLM(req.body.message);
 *     res.json({ message: aiResponse });
 *   },
 *   { domain: 'wearables', onViolation: 'block' }
 * );
 * ```
 */
function withGovernor(handler, config = {}) {
    const validator = (0, runtime_validator_1.createValidator)(config);
    return async (req, res) => {
        // Attach validator to request
        req.validator = validator;
        // Intercept res.json
        const originalJson = res.json.bind(res);
        let jsonCalled = false;
        res.json = function (body) {
            jsonCalled = true;
            // Validate AI-generated content
            if (shouldValidate(body, config)) {
                const textToValidate = extractText(body);
                const result = validator.validateSync(textToValidate);
                // Handle violations
                if (!result.safe) {
                    if (config.onViolation === 'block') {
                        return originalJson({
                            error: 'Content validation failed',
                            message: result.safeAlternative || 'Response blocked by safety validator',
                            violations: result.violations.map(v => ({
                                rule: v.rule,
                                severity: v.severity,
                                message: v.message,
                            })),
                        });
                    }
                    // Replace unsafe content
                    body = replaceUnsafeContent(body, result);
                }
            }
            return originalJson(body);
        };
        // Call the original handler
        try {
            await handler(req, res);
        }
        catch (error) {
            if (!jsonCalled) {
                res.status(500).json({
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
    };
}
/**
 * Create a validator instance for manual use in API routes
 *
 * @example
 * ```typescript
 * const validator = createGovernorValidator({ domain: 'bci' });
 *
 * export default async function handler(req, res) {
 *   const aiOutput = await generateAIResponse(req.body);
 *   const result = await validator.validate(aiOutput);
 *
 *   if (!result.safe) {
 *     return res.status(400).json({ error: result.safeAlternative });
 *   }
 *
 *   res.json({ message: result.output });
 * }
 * ```
 */
function createGovernorValidator(config = {}) {
    return (0, runtime_validator_1.createValidator)(config);
}
/**
 * Validate specific fields in Next.js response
 */
function withFieldValidation(handler, fields, config = {}) {
    const validator = (0, runtime_validator_1.createValidator)(config);
    return async (req, res) => {
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            const validationResults = {};
            for (const fieldPath of fields) {
                const textToValidate = getNestedValue(body, fieldPath);
                if (typeof textToValidate === 'string') {
                    const result = validator.validateSync(textToValidate);
                    validationResults[fieldPath] = result;
                    if (!result.safe) {
                        setNestedValue(body, fieldPath, result.output);
                    }
                }
            }
            // Add validation metadata
            if (Object.keys(validationResults).length > 0) {
                body._validation = validationResults;
            }
            return originalJson(body);
        };
        await handler(req, res);
    };
}
/**
 * App Router (Next.js 13+) support
 * Use in route handlers (app/api/route.ts)
 *
 * @example
 * ```typescript
 * import { NextResponse } from 'next/server';
 * import { validateResponse } from '@yelabb/constitution-core';
 *
 * export async function POST(request: Request) {
 *   const { message } = await request.json();
 *   const aiResponse = await callLLM(message);
 *
 *   return validateResponse(
 *     NextResponse.json({ message: aiResponse }),
 *     { domain: 'therapy' }
 *   );
 * }
 * ```
 */
async function validateResponse(response, config = {}) {
    const validator = (0, runtime_validator_1.createValidator)(config);
    try {
        let body = await response.json();
        if (shouldValidate(body, config)) {
            const textToValidate = extractText(body);
            const result = validator.validateSync(textToValidate);
            if (!result.safe && config.onViolation === 'block') {
                return new Response(JSON.stringify({
                    error: 'Content validation failed',
                    message: result.safeAlternative,
                    violations: result.violations,
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            if (!result.safe) {
                body = replaceUnsafeContent(body, result);
            }
        }
        return new Response(JSON.stringify(body), {
            status: response.status,
            headers: response.headers,
        });
    }
    catch (error) {
        // Return original response if parsing fails
        return response;
    }
}
// Helper functions
function shouldValidate(body, _config) {
    if (body.error)
        return false;
    const aiFields = ['message', 'response', 'text', 'content', 'output'];
    return aiFields.some(field => typeof body[field] === 'string');
}
function extractText(body) {
    const aiFields = ['message', 'response', 'text', 'content', 'output'];
    for (const field of aiFields) {
        if (typeof body[field] === 'string') {
            return body[field];
        }
    }
    return JSON.stringify(body);
}
function replaceUnsafeContent(body, result) {
    const aiFields = ['message', 'response', 'text', 'content', 'output'];
    for (const field of aiFields) {
        if (typeof body[field] === 'string') {
            body[field] = result.output;
            break;
        }
    }
    return body;
}
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!current[key])
            current[key] = {};
        return current[key];
    }, obj);
    target[lastKey] = value;
}
//# sourceMappingURL=nextjs.js.map