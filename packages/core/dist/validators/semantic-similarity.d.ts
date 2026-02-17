/**
 * Semantic Similarity Module
 * Uses multilingual embeddings to detect forbidden medical advice concepts in ANY language
 * Prevents spacing/spelling attacks that bypass regex patterns
 *
 * MULTILINGUAL SUPPORT (v3.3.0+):
 * - Supports 50+ languages via cross-lingual embeddings
 * - No per-language pattern translation needed
 * - Forbidden concepts defined in English, matched semantically across languages
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
 * Normalize text to catch adversarial attacks (multilingual-compatible)
 * - Remove extra spaces
 * - Remove special characters between letters (preserving Unicode letters)
 * - Convert to lowercase
 * - Fix common English misspellings
 *
 * IMPORTANT: Preserves non-ASCII Unicode letters for multilingual support
 */
export declare function normalizeText(text: string): string;
/**
 * Detect language of input text using word-frequency scoring.
 * Returns ISO 639-1 language code or 'unknown'.
 *
 * Strategy:
 *  1. Non-Latin scripts are identified by character-set presence (single match
 *     is sufficient because the scripts are mutually exclusive).
 *  2. Latin-script languages are scored by counting how many language-distinctive
 *     words appear in the text.  Words that are shared across languages (e.g.
 *     "de", "la", "un", "que", "para", "con") are intentionally excluded from
 *     every list to prevent misclassification.
 *  3. The language with the highest score wins, provided it meets the minimum
 *     match threshold (MIN_MATCHES).  Ties are broken by the first encountered
 *     winner in iteration order, which is a stable, predictable tie-break.
 *
 * NOTE: For production deployments with high multilingual traffic consider a
 * dedicated library such as 'franc' or 'cld3' for greater accuracy.
 */
export declare function detectLanguage(text: string): string;
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
 *
 * Uses multilingual embedding model to enable cross-lingual safety validation
 */
export declare function initializeVectorDatabase(): Promise<void>;
/**
 * Batch check multiple texts for efficiency
 */
export declare function batchCheckSemantic(texts: string[], threshold?: number): Promise<SemanticCheckResult[]>;
//# sourceMappingURL=semantic-similarity.d.ts.map