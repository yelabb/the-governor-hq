/**
 * Semantic Similarity Module
 * Uses embeddings to detect forbidden medical advice concepts
 * Prevents spacing/spelling attacks that bypass regex patterns
 */

import { pipeline, env } from '@xenova/transformers';
import type { SemanticCheckResult, ForbiddenConcept } from './types';

// Disable local model caching in CI/CD environments
if (process.env.CI) {
  env.cacheDir = './.cache';
}

let embeddingPipeline: any = null;

/**
 * Initialize the embedding pipeline (lazy loading)
 */
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    // Use a small, fast embedding model
    // all-MiniLM-L6-v2: 80MB, ~384 dimensional embeddings, good quality
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  return embeddingPipeline;
}

/**
 * Generate embedding vector for text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const pipeline = await getEmbeddingPipeline();
  
  // Normalize text to catch spacing/spelling attacks
  const normalizedText = normalizeText(text);
  
  // Generate embedding
  const output = await pipeline(normalizedText, {
    pooling: 'mean',
    normalize: true,
  });
  
  // Extract the embedding array
  return Array.from(output.data);
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (normA * normB);
}

/**
 * Normalize text to catch adversarial attacks
 * - Remove extra spaces
 * - Remove special characters between letters
 * - Convert to lowercase
 * - Fix common misspellings
 */
export function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  
  // Remove special characters while preserving letters and spaces
  // e.g., "d!i@a#g$n%o^s&e" → "diagnose"
  normalized = normalized.replace(/[^a-z\s]/g, '');
  
  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Remove spaces between individual characters (e.g., "d i a g n o s e" → "diagnose")
  // This matches single letters separated by spaces
  normalized = normalized.replace(/\b([a-z])\s+(?=[a-z]\b)/g, '$1');
  
  // Common intentional misspellings
  const misspellings: Record<string, string> = {
    'diagnoz': 'diagnose',
    'diagnoze': 'diagnose',
    'diagnos': 'diagnose',
    'treatmnt': 'treatment',
    'medicashun': 'medication',
    'perscription': 'prescription',
    'diseas': 'disease',
    'depreshan': 'depression',
    'anxeity': 'anxiety',
  };
  
  for (const [wrong, correct] of Object.entries(misspellings)) {
    normalized = normalized.replace(new RegExp(`\\b${wrong}\\b`, 'g'), correct);
  }
  
  return normalized.trim();
}

/**
 * Check text against forbidden medical concepts using semantic similarity
 */
export async function checkSemanticSimilarity(
  text: string,
  threshold: number = 0.75
): Promise<SemanticCheckResult> {
  const startTime = Date.now();
  
  // Check if vector database is initialized
  const isInitialized = FORBIDDEN_MEDICAL_CONCEPTS.every(c => c.embedding.length > 0);
  if (!isInitialized) {
    console.warn('⚠️  Semantic similarity database not initialized. Returning empty result.');
    return {
      violations: [],
      maxSimilarity: 0,
      latencyMs: Date.now() - startTime,
    };
  }
  
  // Generate embedding for input text
  const textEmbedding = await generateEmbedding(text);
  
  // Check against all forbidden concepts
  const matches: ForbiddenConcept[] = [];
  
  for (const concept of FORBIDDEN_MEDICAL_CONCEPTS) {
    const similarity = cosineSimilarity(textEmbedding, concept.embedding);
    
    if (similarity >= threshold) {
      matches.push({
        ...concept,
        similarity,
      });
    }
  }
  
  // Sort by similarity (highest first)
  matches.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  
  const latencyMs = Date.now() - startTime;
  
  return {
    violations: matches.map(m => ({
      concept: m.concept,
      category: m.category,
      severity: m.severity,
      similarity: m.similarity || 0,
      example: m.example,
    })),
    maxSimilarity: matches.length > 0 ? matches[0].similarity || 0 : 0,
    latencyMs,
  };
}

/**
 * Forbidden medical concepts vector database
 * Pre-computed embeddings for common forbidden medical advice patterns
 */
export const FORBIDDEN_MEDICAL_CONCEPTS: ForbiddenConcept[] = [
  // Medical Diagnoses
  {
    concept: 'medical-diagnosis',
    category: 'diagnosis',
    severity: 'critical',
    example: 'You have insomnia',
    embedding: [], // Will be populated on first use
  },
  {
    concept: 'disease-identification',
    category: 'diagnosis',
    severity: 'critical',
    example: 'This indicates sleep apnea',
    embedding: [],
  },
  {
    concept: 'condition-diagnosis',
    category: 'diagnosis',
    severity: 'critical',
    example: 'You may have anxiety disorder',
    embedding: [],
  },
  
  // Treatment Recommendations
  {
    concept: 'treatment-prescription',
    category: 'treatment',
    severity: 'critical',
    example: 'Take melatonin to treat your sleep problems',
    embedding: [],
  },
  {
    concept: 'medication-dosage',
    category: 'treatment',
    severity: 'critical',
    example: 'Take 5mg of supplement before bed',
    embedding: [],
  },
  {
    concept: 'therapeutic-intervention',
    category: 'treatment',
    severity: 'critical',
    example: 'This therapy will cure your condition',
    embedding: [],
  },
  
  // Medical Scope Violations
  {
    concept: 'symptom-interpretation',
    category: 'medical-scope',
    severity: 'high',
    example: 'These symptoms indicate a serious medical condition',
    embedding: [],
  },
  {
    concept: 'clinical-assessment',
    category: 'medical-scope',
    severity: 'high',
    example: 'Your clinical markers show pathological patterns',
    embedding: [],
  },
  {
    concept: 'health-risk-diagnosis',
    category: 'medical-scope',
    severity: 'high',
    example: 'You are at risk for cardiovascular disease',
    embedding: [],
  },
  
  // Emergency/Alarming Language  
  {
    concept: 'emergency-directive',
    category: 'alarming',
    severity: 'high',
    example: 'This is a medical emergency seek help immediately',
    embedding: [],
  },
  {
    concept: 'health-danger-warning',
    category: 'alarming',
    severity: 'high',
    example: 'Your health is in serious danger',
    embedding: [],
  },
  
  // Prescriptive Medical Commands
  {
    concept: 'medical-must-directive',
    category: 'prescriptive',
    severity: 'medium',
    example: 'You must see a doctor about this condition',
    embedding: [],
  },
  {
    concept: 'treatment-requirement',
    category: 'prescriptive',
    severity: 'medium',
    example: 'You need to take medication for this',
    embedding: [],
  },
];

/**
 * Initialize the vector database by computing embeddings
 * This should be called once during application startup
 */
export async function initializeVectorDatabase(): Promise<void> {
  console.log('🔄 Initializing semantic similarity vector database...');
  const startTime = Date.now();
  
  for (const concept of FORBIDDEN_MEDICAL_CONCEPTS) {
    if (concept.embedding.length === 0) {
      concept.embedding = await generateEmbedding(concept.example);
    }
  }
  
  const latencyMs = Date.now() - startTime;
  console.log(`✅ Vector database initialized (${FORBIDDEN_MEDICAL_CONCEPTS.length} concepts, ${latencyMs}ms)`);
}

/**
 * Batch check multiple texts for efficiency
 */
export async function batchCheckSemantic(
  texts: string[],
  threshold: number = 0.75
): Promise<SemanticCheckResult[]> {
  const results: SemanticCheckResult[] = [];
  
  for (const text of texts) {
    results.push(await checkSemanticSimilarity(text, threshold));
  }
  
  return results;
}
