/**
 * Express Middleware for Governor HQ Validator
 * Auto-validate AI responses in Express routes
 */

// Express types - install @types/express for full type support
type Request = any;
type Response = any;
type NextFunction = any;
import type { ValidatorConfig, ValidationResult } from '../validators/types';
import { createValidator } from '../validators/runtime-validator';

declare global {
  namespace Express {
    interface Request {
      validated?: ValidationResult;
      validatedOutput?: string;
    }
  }
}

/**
 * Create Express middleware for validating AI responses
 * 
 * @example
 * ```typescript
 * app.post('/api/ai/chat', 
 *   governorValidator({ domain: 'wearables', onViolation: 'block' }),
 *   async (req, res) => {
 *     const aiResponse = await callLLM(req.body.message);
 *     const result = await req.validator.validate(aiResponse);
 *     res.json({ message: result.output });
 *   }
 * );
 * ```
 */
export function governorValidator(config: ValidatorConfig = {}) {
  const validator = createValidator(config);
  
  return async (req: Request, res: Response, next: NextFunction) => {
    // Attach validator to request for manual use
    (req as any).validator = validator;
    
    // Intercept res.json to auto-validate
    const originalJson = res.json.bind(res);
    
    res.json = function(body: any) {
      // Only validate if body contains AI-generated text
      if (shouldValidate(body, config)) {
        const textToValidate = extractText(body);
        const result = validator.validateSync(textToValidate);
        
        // Store validation result
        req.validated = result;
        req.validatedOutput = result.output;
        
        // Handle violations
        if (!result.safe) {
          if (config.onViolation === 'block') {
            return originalJson({
              error: 'Content validation failed',
              message: result.safeAlternative || 'Response blocked by safety validator',
              violations: result.violations.map(v => ({
                rule: v.rule,
                severity: v.severity,
              })),
            });
          }
          
          // Replace unsafe content
          body = replaceUnsafeContent(body, result);
        }
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

/**
 * Middleware to validate specific field in response
 */
export function validateField(fieldPath: string, config: ValidatorConfig = {}) {
  const validator = createValidator(config);
  
  return async (_req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = async function(body: any) {
      const textToValidate = getNestedValue(body, fieldPath);
      
      if (typeof textToValidate === 'string') {
        const result = validator.validateSync(textToValidate);
        
        if (!result.safe) {
          setNestedValue(body, fieldPath, result.output);
          
          // Add metadata
          if (!body._validation) body._validation = {};
          body._validation[fieldPath] = {
            safe: false,
            violations: result.violations.length,
          };
        }
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

/**
 * Error handler for validation errors
 */
export function validationErrorHandler(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Content validation failed',
      message: err.message,
      violations: err.violations || [],
    });
  }
  
  next(err);
}

// Helper functions

function shouldValidate(body: any, _config?: ValidatorConfig): boolean {
  // Skip validation for errors
  if (body.error) return false;
  
  // Check if body has AI-generated content fields
  const aiFields = ['message', 'response', 'text', 'content', 'output'];
  return aiFields.some(field => typeof body[field] === 'string');
}

function extractText(body: any): string {
  // Try common AI response fields
  const aiFields = ['message', 'response', 'text', 'content', 'output'];
  
  for (const field of aiFields) {
    if (typeof body[field] === 'string') {
      return body[field];
    }
  }
  
  // Fallback to JSON string
  return JSON.stringify(body);
}

function replaceUnsafeContent(body: any, result: ValidationResult): any {
  const aiFields = ['message', 'response', 'text', 'content', 'output'];
  
  for (const field of aiFields) {
    if (typeof body[field] === 'string') {
      body[field] = result.output;
      break;
    }
  }
  
  return body;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}
