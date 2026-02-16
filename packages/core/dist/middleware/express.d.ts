/**
 * Express Middleware for Governor HQ Validator
 * Auto-validate AI responses in Express routes
 */
type Request = any;
type Response = any;
type NextFunction = any;
import type { ValidatorConfig, ValidationResult } from '../validators/types';
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
export declare function governorValidator(config?: ValidatorConfig): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to validate specific field in response
 */
export declare function validateField(fieldPath: string, config?: ValidatorConfig): (_req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Error handler for validation errors
 */
export declare function validationErrorHandler(err: any, _req: Request, res: Response, next: NextFunction): any;
export {};
//# sourceMappingURL=express.d.ts.map