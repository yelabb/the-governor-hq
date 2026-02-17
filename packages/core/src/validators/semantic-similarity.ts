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

let embeddingPipeline: any = null;
let transformersModule: any = null;

/**
 * Dynamically import transformers (ES Module compatibility)
 * Using Function constructor to prevent TypeScript from transforming the import()
 */
async function getTransformers() {
  if (!transformersModule) {
    // Use Function constructor to preserve dynamic import in CommonJS
    // This prevents TypeScript from converting it to require()
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    transformersModule = await dynamicImport('@xenova/transformers');
    
    // Disable local model caching in CI/CD environments
    if (process.env.CI) {
      transformersModule.env.cacheDir = './.cache';
    }
  }
  return transformersModule;
}

/**
 * Initialize the embedding pipeline (lazy loading)
 */
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    const { pipeline } = await getTransformers();
    
    // Use multilingual embedding model for cross-lingual safety validation
    // paraphrase-multilingual-MiniLM-L12-v2: ~420MB, 384-dim embeddings, 50+ languages
    // This enables detection of forbidden medical concepts in ANY language
    // without translating patterns or maintaining per-language rules
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
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
 * Normalize text to catch adversarial attacks (multilingual-compatible)
 * - Remove extra spaces
 * - Remove special characters between letters (preserving Unicode letters)
 * - Convert to lowercase
 * - Fix common English misspellings
 * 
 * IMPORTANT: Preserves non-ASCII Unicode letters for multilingual support
 */
export function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  
  // Remove special characters while preserving Unicode letters (including accents, CJK, etc.)
  // Keeps: letters (any language), spaces, basic punctuation for readability
  // Removes: decorative symbols, most special chars that could obfuscate medical terms
  // \p{L} matches any Unicode letter (including Chinese, Arabic, Cyrillic, accented chars)
  normalized = normalized.replace(/[^\p{L}\p{N}\s\.,;:!?'-]/gu, ' ');
  
  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Remove spaces between individual characters for languages that use them
  // (e.g., "d i a g n o s e" → "diagnose", but preserves "失 眠" if that's the actual spacing)
  // Only collapse single-char spacing for Latin alphabet to avoid breaking CJK
  normalized = normalized.replace(/\b([a-z])\s+(?=[a-z]\b)/gi, '$1');
  
  // Common intentional English misspellings (other languages handled via embeddings)
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
 * Detect language of input text (simple heuristic-based detection)
 * Returns ISO 639-1 language code or 'unknown'
 * 
 * NOTE: This is a basic detector. For production, consider integrating
 * a proper language detection library like 'franc' or 'cld3'
 */
export function detectLanguage(text: string): string {
  const cleaned = text.toLowerCase().replace(/[^\p{L}\s]/gu, '');
  
  // Character set patterns for major language families
  const patterns: Record<string, RegExp> = {
    // CJK (Chinese, Japanese, Korean)
    'zh': /[\u4e00-\u9fff]/,  // Chinese characters
    'ja': /[\u3040-\u309f\u30a0-\u30ff]/,  // Hiragana/Katakana
    'ko': /[\uac00-\ud7af]/,  // Hangul
    
    // Cyrillic (Russian, Ukrainian, etc.)
    'ru': /[\u0400-\u04ff]/,
    
    // Arabic
    'ar': /[\u0600-\u06ff\u0750-\u077f]/,
    
    // Devanagari (Hindi, Sanskrit)
    'hi': /[\u0900-\u097f]/,
    
    // Thai
    'th': /[\u0e00-\u0e7f]/,
    
    // Hebrew
    'he': /[\u0590-\u05ff]/,
  };
  
  // Check character-based languages first
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  
  // For Latin-script languages, use common word patterns
  // Spanish
  if (/\b(el|la|los|las|un|una|de|en|que|tienes|tiene|para|con|está|son)\b/.test(cleaned)) {
    return 'es';
  }
  
  // French
  if (/\b(le|la|les|un|une|de|en|vous|avez|est|sont|pour|avec|des|dans)\b/.test(cleaned)) {
    return 'fr';
  }
  
  // German
  if (/\b(der|die|das|den|dem|ein|eine|und|sie|haben|ist|sind|mit|für)\b/.test(cleaned)) {
    return 'de';
  }
  
  // Italian
  if (/\b(il|la|lo|i|gli|le|un|una|di|in|che|hai|ha|sono|per|con)\b/.test(cleaned)) {
    return 'it';
  }
  
  // Portuguese
  if (/\b(o|a|os|as|um|uma|de|em|que|tem|são|para|com|não)\b/.test(cleaned)) {
    return 'pt';
  }
  
  // Default to English if Latin script with common English words
  if (/\b(the|is|are|you|have|this|that|with|for|from|your)\b/.test(cleaned)) {
    return 'en';
  }
  
  // If we can't detect, assume multilingual model will handle it
  return 'unknown';
}

/**
 * Check text against forbidden medical concepts using semantic similarity
 */
export async function checkSemanticSimilarity(
  text: string,
  threshold: number = 0.75
): Promise<SemanticCheckResult> {
  const startTime = Date.now();
  
  // Detect input language for logging and analytics
  const detectedLanguage = detectLanguage(text);
  
  // Check if vector database is initialized
  const isInitialized = FORBIDDEN_MEDICAL_CONCEPTS.every(c => c.embedding.length > 0);
  if (!isInitialized) {
    console.warn('⚠️  Semantic similarity database not initialized. Returning empty result.');
    return {
      violations: [],
      maxSimilarity: 0,
      latencyMs: Date.now() - startTime,
      detectedLanguage,
    };
  }
  
  // Generate embedding for input text
  const textEmbedding = await generateEmbedding(text);
  
  // Check against all forbidden concepts
  const matches: ForbiddenConcept[] = [];
  
  for (const concept of FORBIDDEN_MEDICAL_CONCEPTS) {
    const similarity = cosineSimilarity(textEmbedding, concept.embedding);
    
    // Use severity-based thresholds:
    // - critical: 0.75 (strict - medical diagnoses, treatments)
    // - high: 0.77 (medium - medical scope, alarming language)
    // - medium: 0.78 (lenient - prescriptive commands, need clear intent)
    let severityThreshold = threshold;
    if (concept.severity === 'critical') {
      severityThreshold = Math.min(threshold, 0.75);
    } else if (concept.severity === 'high') {
      severityThreshold = Math.max(threshold, 0.77);
    } else if (concept.severity === 'medium') {
      severityThreshold = Math.max(threshold, 0.78);
    }
    
    if (similarity >= severityThreshold) {
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
    detectedLanguage,
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
    example: 'You must see a doctor',
    embedding: [],
  },
  {
    concept: 'medical-should-directive',
    category: 'prescriptive',
    severity: 'medium',
    example: 'You should consult a doctor',
    embedding: [],
  },
  {
    concept: 'medical-need-directive',
    category: 'prescriptive',
    severity: 'medium',
    example: 'You need to consult a physician',
    embedding: [],
  },
  {
    concept: 'treatment-requirement',
    category: 'prescriptive',
    severity: 'medium',
    example: 'You need to take medication',
    embedding: [],
  },
  {
    concept: 'specific-sleep-condition',
    category: 'diagnosis',
    severity: 'critical',
    example: 'You have sleep apnea',
    embedding: [],
  },
];

/**
 * Initialize the vector database by computing embeddings
 * This should be called once during application startup
 * 
 * Uses multilingual embedding model to enable cross-lingual safety validation
 */
export async function initializeVectorDatabase(): Promise<void> {
  console.log('🔄 Initializing multilingual semantic similarity vector database...');
  const startTime = Date.now();
  
  for (const concept of FORBIDDEN_MEDICAL_CONCEPTS) {
    if (concept.embedding.length === 0) {
      concept.embedding = await generateEmbedding(concept.example);
    }
  }
  
  const latencyMs = Date.now() - startTime;
  console.log(`✅ Vector database initialized (${FORBIDDEN_MEDICAL_CONCEPTS.length} concepts, ${latencyMs}ms)`);
  console.log('🌍 Multilingual support enabled for 50+ languages');
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
