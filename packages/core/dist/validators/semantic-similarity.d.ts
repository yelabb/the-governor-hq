/**
 * Semantic Similarity Module
 * Uses embeddings to detect forbidden medical advice concepts
 * Prevents spacing/spelling attacks that bypass regex patterns
 */
import type { SemanticCheckResult, ForbiddenConcept } from './types';
/**
 * Generate embedding vector for text
 */
export declare function generateEmbedding(text: string): Promise<number[]>;
/**
 * Calculate cosine similarity between two vectors
 */
export declare function cosineSimilarity(vecA: number[], vecB: number[]): number;
/**
 * Normalize text to catch adversarial attacks
 * - Remove extra spaces
 * - Remove special characters between letters
 * - Convert to lowercase
 * - Fix common misspellings
 */
export declare function normalizeText(text: string): string;
/**
 * Check text against forbidden medical concepts using semantic similarity
 */
export declare function checkSemanticSimilarity(text: string, threshold?: number): Promise<SemanticCheckResult>;
/**
 * Forbidden medical concepts vector database
 * Pre-computed embeddings for common forbidden medical advice patterns
 */
export declare const FORBIDDEN_MEDICAL_CONCEPTS: ForbiddenConcept[];
/**
 * Initialize the vector database by computing embeddings
 * This should be called once during application startup
 */
export declare function initializeVectorDatabase(): Promise<void>;
/**
 * Batch check multiple texts for efficiency
 */
export declare function batchCheckSemantic(texts: string[], threshold?: number): Promise<SemanticCheckResult[]>;
//# sourceMappingURL=semantic-similarity.d.ts.map