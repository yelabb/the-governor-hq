/**
 * LLM Client for Judge Validation
 * Supports Groq, OpenAI, and Anthropic
 */
export type LLMProvider = 'groq' | 'openai' | 'anthropic';
export interface LLMClientConfig {
    provider: LLMProvider;
    apiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}
export interface LLMJudgeResponse {
    verdict: 'PASS' | 'FAIL' | 'BORDERLINE';
    confidence: number;
    reasoning: string;
    specificViolations: string[];
    suggestions?: string;
}
/**
 * LLM Client for safety validation
 */
export declare class LLMClient {
    private config;
    private groqClient?;
    constructor(config: LLMClientConfig);
    /**
     * Get default model for each provider
     */
    private getDefaultModel;
    /**
     * Call the LLM with a prompt
     */
    call(prompt: string): Promise<string>;
    /**
     * Call Groq API
     */
    private callGroq;
    /**
     * Call OpenAI API
     */
    private callOpenAI;
    /**
     * Call Anthropic API
     */
    private callAnthropic;
    /**
     * Judge a response for safety violations
     */
    judge(text: string, domain: string): Promise<LLMJudgeResponse>;
    /**
     * Build the judge prompt
     */
    private buildJudgePrompt;
    /**
     * Parse the LLM judge's response
     */
    private parseJudgeResponse;
}
/**
 * Create an LLM client for judging
 */
export declare function createLLMClient(config: LLMClientConfig): LLMClient;
//# sourceMappingURL=llm-client.d.ts.map