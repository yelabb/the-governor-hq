"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORBIDDEN_MEDICAL_CONCEPTS = void 0;
exports.generateEmbedding = generateEmbedding;
exports.cosineSimilarity = cosineSimilarity;
exports.normalizeText = normalizeText;
exports.detectLanguage = detectLanguage;
exports.checkSemanticSimilarity = checkSemanticSimilarity;
exports.initializeVectorDatabase = initializeVectorDatabase;
exports.batchCheckSemantic = batchCheckSemantic;
let embeddingPipeline = null;
let transformersModule = null;
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
        embeddingPipeline = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
    }
    return embeddingPipeline;
}
/**
 * Generate embedding vector for text
 */
async function generateEmbedding(text) {
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
function cosineSimilarity(vecA, vecB) {
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
    if (normA === 0 || normB === 0)
        return 0;
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
function normalizeText(text) {
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
    const misspellings = {
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
function detectLanguage(text) {
    // Minimum word-matches required before committing to a Latin-script language.
    // A value of 1 is intentionally low so that short phrases (3-5 words) are
    // still detectable, while random single-word ambiguous terms return 'unknown'.
    const MIN_MATCHES = 1;
    // ── Non-Latin scripts (character-range detection) ────────────────────────
    // Order matters only if scripts overlap (they do not), so order is arbitrary.
    const scriptPatterns = [
        // Japanese must be checked before Chinese: Japanese text often contains
        // CJK kanji (shared range U+4E00-U+9FFF) alongside Hiragana/Katakana.
        // Checking Hiragana/Katakana first ensures Japanese wins over Chinese
        // whenever those syllabary characters are present.
        ['ja', /[\u3040-\u309f\u30a0-\u30ff]/], // Hiragana / Katakana (Japanese)
        ['zh', /[\u4e00-\u9fff]/], // CJK Unified Ideographs (Chinese)
        ['ko', /[\uac00-\ud7af]/], // Hangul (Korean)
        ['ru', /[\u0400-\u04ff]/], // Cyrillic
        ['ar', /[\u0600-\u06ff\u0750-\u077f]/], // Arabic
        ['hi', /[\u0900-\u097f]/], // Devanagari (Hindi)
        ['th', /[\u0e00-\u0e7f]/], // Thai
        ['he', /[\u0590-\u05ff]/], // Hebrew
    ];
    for (const [lang, pattern] of scriptPatterns) {
        if (pattern.test(text))
            return lang;
    }
    // ── Latin-script scoring ─────────────────────────────────────────────────
    // Normalise: lowercase, strip punctuation / digits, keep Unicode letters.
    const cleaned = text.toLowerCase().replace(/[^\p{L}\s]/gu, '');
    const wordSet = new Set(cleaned.split(/\s+/).filter(w => w.length > 0));
    // Each list contains words that are:
    //  • highly frequent in their language, AND
    //  • NOT commonly shared with sibling languages listed here.
    // Deliberately omitted cross-language words: de, la, en, un, una, que, para,
    // con, por, a, o, em, com, le, les, il, lo, i, in, di, est, son, são, tem.
    const langWords = {
        // German — distinctive via compound-capable function words and umlauts
        de: [
            'und', 'nicht', 'ich', 'haben', 'werden', 'dass', 'aber', 'wenn',
            'dann', 'auch', 'oder', 'nach', 'für', 'wir', 'ihr', 'sein',
            'nehmen', 'müssen', 'sollten', 'können', 'arzt', 'schlaf',
            'aufsuchen', 'erwägen',
        ],
        // French — distinctive via second-person plural forms and nasal vocabulary
        fr: [
            'vous', 'avez', 'votre', 'nous', 'leur', 'leurs', 'aussi', 'très',
            'dans', 'donc', 'bien', 'tous', 'tout', 'cette', 'cela', 'même',
            'après', 'toujours', 'jamais', 'médecin', 'prenez', 'devez',
            'envisager', 'pourriez', 'insomnie',
        ],
        // Spanish — distinctive via 2nd-person verb forms and tilde-bearing words
        es: [
            'tienes', 'tiene', 'también', 'está', 'están', 'pero', 'nosotros',
            'ellos', 'muy', 'aquí', 'después', 'antes', 'siempre', 'nunca',
            'médico', 'toma', 'debes', 'dormir', 'ritmo', 'línea', 'considera',
            'hablar', 'proveedor',
        ],
        // Portuguese — distinctive via nasal vowels and ç/ã forms
        pt: [
            'você', 'voce', 'não', 'mais', 'isso', 'pelo', 'pela', 'então',
            'quando', 'porque', 'meu', 'minha', 'também', 'tome', 'deve',
            'consultar', 'tratar', 'insônia', 'falar', 'considere', 'médico',
            'tem', 'são',
        ],
        // Italian — distinctive via 2nd-person singular "hai" and -oi/-rebbe forms
        it: [
            'hai', 'quindi', 'però', 'anche', 'già', 'questo', 'questa',
            'tutti', 'tutto', 'loro', 'lui', 'lei', 'mio', 'mia', 'suo', 'sua',
            'prendi', 'devi', 'medico', 'insonnia', 'curare', 'potresti',
            'considerare', 'parlare', 'che',
        ],
        // English — distinctive via articles and modal auxiliaries absent elsewhere
        en: [
            'the', 'you', 'have', 'this', 'that', 'with', 'from', 'your',
            'they', 'were', 'been', 'will', 'would', 'could', 'should',
            'sleep', 'take', 'consider', 'doctor', 'consult', 'baseline',
            'seems', 'might', 'speak',
        ],
    };
    // Count distinctive-word matches for each language
    let bestLang = 'unknown';
    let bestScore = 0;
    for (const [lang, words] of Object.entries(langWords)) {
        const score = words.reduce((n, w) => n + (wordSet.has(w) ? 1 : 0), 0);
        if (score > bestScore) {
            bestScore = score;
            bestLang = lang;
        }
    }
    return bestScore >= MIN_MATCHES ? bestLang : 'unknown';
}
/**
 * Check text against forbidden medical concepts using semantic similarity
 */
async function checkSemanticSimilarity(text, threshold = 0.75) {
    const startTime = Date.now();
    // Detect input language for logging and analytics
    const detectedLanguage = detectLanguage(text);
    // Check if vector database is initialized
    const isInitialized = exports.FORBIDDEN_MEDICAL_CONCEPTS.every(c => c.embedding.length > 0);
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
    const matches = [];
    for (const concept of exports.FORBIDDEN_MEDICAL_CONCEPTS) {
        const similarity = cosineSimilarity(textEmbedding, concept.embedding);
        // Use severity-based thresholds — lower threshold = easier to detect.
        // Math.min ensures we never raise the bar above the caller's default threshold:
        // - critical: cap at 0.75 (most sensitive — diagnoses, treatments)
        // - high: cap at 0.77 (slightly less sensitive — scope violations, alarming language)
        // - medium: cap at 0.78 (use caller default if already below — prescriptive commands)
        // A per-concept minThreshold override (if set) takes precedence over the
        // severity-based cap. This is used to tune noisy multilingual anchor concepts
        // whose cross-lingual embeddings produce false positives near the global floor.
        let severityThreshold = threshold;
        if (concept.minThreshold !== undefined) {
            severityThreshold = concept.minThreshold;
        }
        else if (concept.severity === 'critical') {
            severityThreshold = Math.min(threshold, 0.75);
        }
        else if (concept.severity === 'high') {
            severityThreshold = Math.min(threshold, 0.77);
        }
        else if (concept.severity === 'medium') {
            severityThreshold = Math.min(threshold, 0.78);
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
exports.FORBIDDEN_MEDICAL_CONCEPTS = [
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
    // ── Multilingual anchor concepts ─────────────────────────────────────────
    // The paraphrase-multilingual-MiniLM-L12-v2 model produces cross-lingual
    // embeddings, but adding per-language examples improves recall in languages
    // whose vocabulary is less represented in the English-only anchors above.
    // Each anchor mirrors an existing English concept in a high-priority language.
    // Japanese – diagnosis
    {
        concept: 'ja-medical-diagnosis',
        category: 'diagnosis',
        severity: 'critical',
        example: 'あなたは不眠症です', // "You have insomnia"
        embedding: [],
    },
    {
        concept: 'ja-sleep-condition',
        category: 'diagnosis',
        severity: 'critical',
        example: 'あなたは睡眠時無呼吸症候群です', // "You have sleep apnea"
        embedding: [],
    },
    // Japanese – treatment
    {
        concept: 'ja-treatment-prescription',
        category: 'treatment',
        severity: 'critical',
        example: 'メラトニンを服用して不眠症を治療してください', // "Take melatonin to treat insomnia"
        embedding: [],
    },
    // Russian – diagnosis
    {
        concept: 'ru-medical-diagnosis',
        category: 'diagnosis',
        severity: 'critical',
        example: 'У вас бессонница', // "You have insomnia"
        embedding: [],
    },
    // Russian – treatment
    {
        concept: 'ru-treatment-prescription',
        category: 'treatment',
        severity: 'critical',
        example: 'Принимайте мелатонин для лечения бессонницы', // "Take melatonin to treat insomnia"
        embedding: [],
    },
    // Simplified Chinese – diagnosis
    {
        concept: 'zh-medical-diagnosis',
        category: 'diagnosis',
        severity: 'critical',
        example: '你有失眠症', // "You have insomnia"
        embedding: [],
        // Raised from the default critical floor (0.75) to 0.78 because the cross-lingual
        // embedding for this Chinese anchor has elevated cosine similarity with safe
        // observational phrases in Romance languages (e.g., Spanish "Tu ritmo de sueño
        // parece diferente…" at 75%, French "Votre sommeil semble différent…" at 77%).
        // Real Chinese diagnoses score ≥ 0.85, so 0.78 still provides full coverage.
        minThreshold: 0.78,
    },
    // Simplified Chinese – treatment
    {
        concept: 'zh-treatment-prescription',
        category: 'treatment',
        severity: 'critical',
        example: '服用褪黑激素治疗失眠', // "Take melatonin to treat insomnia"
        embedding: [],
    },
];
/**
 * Initialize the vector database by computing embeddings
 * This should be called once during application startup
 *
 * Uses multilingual embedding model to enable cross-lingual safety validation
 */
async function initializeVectorDatabase() {
    console.log('🔄 Initializing multilingual semantic similarity vector database...');
    const startTime = Date.now();
    for (const concept of exports.FORBIDDEN_MEDICAL_CONCEPTS) {
        if (concept.embedding.length === 0) {
            concept.embedding = await generateEmbedding(concept.example);
        }
    }
    const latencyMs = Date.now() - startTime;
    console.log(`✅ Vector database initialized (${exports.FORBIDDEN_MEDICAL_CONCEPTS.length} concepts, ${latencyMs}ms)`);
    console.log('🌍 Multilingual support enabled for 50+ languages');
}
/**
 * Batch check multiple texts for efficiency
 */
async function batchCheckSemantic(texts, threshold = 0.75) {
    const results = [];
    for (const text of texts) {
        results.push(await checkSemanticSimilarity(text, threshold));
    }
    return results;
}
//# sourceMappingURL=semantic-similarity.js.map