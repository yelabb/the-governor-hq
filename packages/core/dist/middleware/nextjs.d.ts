/**
 * Next.js Middleware for Governor HQ Validator
 * Auto-validate AI responses in Next.js API routes
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ValidatorConfig } from '../validators/types';
type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;
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
export declare function withGovernor(handler: NextApiHandler, config?: ValidatorConfig): (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
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
export declare function createGovernorValidator(config?: ValidatorConfig): import("../validators/runtime-validator").RuntimeValidator;
/**
 * Validate specific fields in Next.js response
 */
export declare function withFieldValidation(handler: NextApiHandler, fields: string[], config?: ValidatorConfig): (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
/**
 * App Router (Next.js 13+) support
 * Use in route handlers (app/api/route.ts)
 *
 * @example
 * ```typescript
 * import { NextResponse } from 'next/server';
 * import { validateResponse } from '@the-governor-hq/constitution-core';
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
export declare function validateResponse(response: Response, config?: ValidatorConfig): Promise<Response>;
export {};
//# sourceMappingURL=nextjs.d.ts.map