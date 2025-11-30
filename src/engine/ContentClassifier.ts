/**
 * Content Classification Module
 *
 * Deterministic classification functions for content items.
 * Classifies words, phrases, and sentences into progression stages,
 * complexity levels, and semantic categories.
 *
 * All functions are pure (no side effects) and deterministic.
 */

import { ContentItem, ProgressionStage } from "../types/ContentItem";
import { LearnerProfile } from "../types/LearnerProfile";

// =============================================================================
// PATTERN DETECTION HELPERS
// =============================================================================

/**
 * Common sight words (Dolch + Fry high-frequency)
 */
const COMMON_SIGHT_WORDS = new Set([
  // Articles & pronouns
  "a", "an", "the", "I", "me", "my", "you", "your", "he", "him", "his",
  "she", "her", "it", "its", "we", "us", "our", "they", "them", "their",

  // Common verbs
  "is", "am", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "can", "could",
  "will", "would", "shall", "should", "may", "might", "must",

  // Prepositions & conjunctions
  "of", "to", "in", "for", "on", "with", "at", "by", "from",
  "up", "down", "about", "as", "into", "like", "and", "or", "but",
  "if", "then", "than", "when", "where", "why", "how",

  // Common adjectives & adverbs
  "all", "some", "any", "no", "not", "so", "very", "more", "most",
  "good", "new", "first", "last", "long", "great", "little", "own",
  "other", "old", "right", "big", "high", "small", "large",

  // Common nouns
  "time", "way", "day", "thing", "man", "world", "life", "hand",
  "part", "child", "eye", "woman", "place", "work", "week", "case",

  // Action words
  "see", "get", "go", "come", "make", "know", "take", "think",
  "look", "want", "give", "use", "find", "tell", "ask", "work",
  "seem", "feel", "try", "leave", "call", "keep", "let", "begin",

  // Numbers
  "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten"
]);

/**
 * Highly concrete/visual categories
 */
const CONCRETE_CATEGORIES = new Set([
  "animals", "food", "nature", "places", "activities"
]);

/**
 * Abstract categories
 */
const ABSTRACT_CATEGORIES = new Set([
  "feelings", "tech", "fantasy"
]);

/**
 * Check if word has CVC pattern (consonant-vowel-consonant)
 */
function isCVC(word: string): boolean {
  if (word.length !== 3) return false;
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  return !vowels.has(word[0]!) && vowels.has(word[1]!) && !vowels.has(word[2]!);
}

/**
 * Check if word has CVCV or CVCVC pattern (simple repeated structure)
 */
function isSimpleRepeated(word: string): boolean {
  if (word.length < 4 || word.length > 5) return false;
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);

  // CVCV: mama, papa
  if (word.length === 4) {
    return !vowels.has(word[0]!) && vowels.has(word[1]!) &&
           !vowels.has(word[2]!) && vowels.has(word[3]!);
  }

  // CVCVC: robot, music
  if (word.length === 5) {
    return !vowels.has(word[0]!) && vowels.has(word[1]!) &&
           !vowels.has(word[2]!) && vowels.has(word[3]!) &&
           !vowels.has(word[4]!);
  }

  return false;
}

/**
 * Check if word contains consonant blends (bl, gr, st, etc.)
 */
function hasBlend(word: string): boolean {
  const blends = [
    'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr',
    'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw'
  ];

  return blends.some(blend => word.includes(blend));
}

/**
 * Check if word contains digraphs (ch, sh, th, etc.)
 */
function hasDigraph(word: string): boolean {
  const digraphs = [
    'ch', 'sh', 'th', 'wh', 'ph', 'gh',
    'ck', 'ng', 'qu'
  ];

  return digraphs.some(digraph => word.includes(digraph));
}

/**
 * Check if word has irregular/complex spelling patterns
 */
function hasIrregularPattern(word: string): boolean {
  // Silent letters
  if (/kn|wr|gn|mb|bt|mn/.test(word)) return true;

  // Unusual vowel combinations
  if (/ough|augh|eigh|tion|sion|ous|ious/.test(word)) return true;

  // Multiple syllables with complex patterns
  if (word.length > 7) return true;

  return false;
}

// =============================================================================
// MAIN CLASSIFICATION FUNCTIONS
// =============================================================================

/**
 * Classify content item into a progression stage.
 *
 * @param item - Content item to classify
 * @returns ProgressionStage (1-5)
 *
 * Classification logic:
 * - Stage 1 (simple_words): CVC, CVCV patterns, 3-4 letters
 * - Stage 2 (growing_words): 4-6 letters, simple blends
 * - Stage 3 (sight_words): High-frequency sight words, abstract terms
 * - Stage 4 (phrases): 2-3 word templates
 * - Stage 5 (micro_sentences): 4+ word sentences
 */
export function getProgressionStage(item: ContentItem): ProgressionStage {
  // Handle empty/invalid input
  if (!item.text || item.text.trim().length === 0) {
    return 1;
  }

  const text = item.text.toLowerCase().trim();
  const words = text.split(/\s+/);
  const wordCount = words.length;

  // Multi-word content
  if (wordCount >= 4) {
    return 5; // micro_sentences
  }

  if (wordCount >= 2) {
    return 4; // phrases
  }

  // Single word classification
  const word = words[0];
  if (!word) return 1; // Empty word defaults to stage 1

  // Sight words (high-frequency)
  if (COMMON_SIGHT_WORDS.has(word)) {
    return 3;
  }

  // Simple words (CVC or simple patterns)
  if (word.length <= 4 && (isCVC(word) || isSimpleRepeated(word))) {
    return 1;
  }

  // Growing words (4-6 letters with moderate complexity)
  if (word.length >= 4 && word.length <= 6) {
    if (hasBlend(word) && !hasDigraph(word) && !hasIrregularPattern(word)) {
      return 2;
    }

    // Simple 4-6 letter words without complex patterns
    if (!hasDigraph(word) && !hasIrregularPattern(word)) {
      return 2;
    }
  }

  // Default to sight words for longer or more complex terms
  return 3;
}

/**
 * Calculate orthographic complexity score.
 *
 * @param item - Content item to analyze
 * @returns Complexity score 1-5
 *
 * Scoring:
 * - 1: Simple CVC patterns
 * - 2: Consonant blends (bl, gr, st)
 * - 3: Digraphs (ch, sh, th)
 * - 4: Irregular patterns (silent letters, unusual combinations)
 * - 5: Advanced/complex (long words, multiple complex patterns)
 */
export function getOrthographicComplexity(item: ContentItem): number {
  if (!item.text || item.text.trim().length === 0) {
    return 1;
  }

  const text = item.text.toLowerCase().trim();
  const words = text.split(/\s+/);

  // For phrases/sentences, average the complexity of component words
  if (words.length > 1) {
    const complexities = words.map(word => {
      // Skip very short words (articles, etc.)
      if (word.length <= 2) return 1;

      return calculateWordComplexity(word);
    });

    const avgComplexity = complexities.reduce((a, b) => a + b, 0) / complexities.length;
    return Math.round(avgComplexity);
  }

  const firstWord = words[0];
  return firstWord ? calculateWordComplexity(firstWord) : 1;
}

/**
 * Helper: Calculate complexity for a single word
 */
function calculateWordComplexity(word: string): number {
  // Advanced complexity (long or multiple complex patterns)
  if (word.length > 8 || hasIrregularPattern(word)) {
    return 5;
  }

  // Irregular patterns (silent letters, unusual combinations)
  if (hasIrregularPattern(word)) {
    return 4;
  }

  // Digraphs
  if (hasDigraph(word)) {
    return 3;
  }

  // Blends
  if (hasBlend(word)) {
    return 2;
  }

  // Simple (CVC or short words)
  return 1;
}

/**
 * Calculate semantic concreteness score.
 *
 * @param item - Content item to analyze
 * @returns Concreteness score 0-1
 *
 * Scoring:
 * - 1.0: Highly visual/concrete (animals, objects, places)
 * - 0.6-0.8: Actions (verbs)
 * - 0.3-0.5: Abstract concepts (feelings, tech, fantasy)
 * - 0.0: Pure function words (articles, prepositions)
 */
export function getSemanticConcreteness(item: ContentItem): number {
  if (!item.text || item.text.trim().length === 0) {
    return 0.5; // Neutral default
  }

  const text = item.text.toLowerCase().trim();
  const words = text.split(/\s+/);
  const firstWord = words[0];

  // Check for sight words first (typically function words with low concreteness)
  // This takes precedence over category
  if (firstWord && COMMON_SIGHT_WORDS.has(firstWord)) {
    return 0.2;
  }

  // Has emoji - likely concrete (high priority)
  if (item.emoji) {
    return 0.9;
  }

  // Has image support - likely concrete
  if (item.hasImage) {
    return 0.85;
  }

  // Category-based scoring
  if (CONCRETE_CATEGORIES.has(item.category)) {
    return 1.0;
  }

  if (item.category === "actions") {
    return 0.7;
  }

  if (ABSTRACT_CATEGORIES.has(item.category)) {
    return 0.4;
  }

  // "nowWords" category - context-dependent
  if (item.category === "nowWords") {
    return 0.5;
  }

  // Default to moderate concreteness
  return 0.5;
}

/**
 * Classify content item into SR bin based on learner profile.
 *
 * @param item - Content item to classify
 * @param profile - Learner's current profile with SR history
 * @returns SR bin: "A" (new), "B" (learning), or "C" (mastered)
 *
 * Logic:
 * - Items already in SR bins stay there (read from profile)
 * - New items start in "A"
 * - Classification is deterministic based on profile state
 */
export function classifyForSR(
  item: ContentItem,
  profile: LearnerProfile
): "A" | "B" | "C" {
  // Check if item already classified in profile
  if (profile.spacedRepetition.A.includes(item.id)) {
    return "A";
  }

  if (profile.spacedRepetition.B.includes(item.id)) {
    return "B";
  }

  if (profile.spacedRepetition.C.includes(item.id)) {
    return "C";
  }

  // New item - starts in "A" (new/unseen)
  return "A";
}

/**
 * Batch classify multiple items for SR bins.
 * Useful for initializing a set of content.
 *
 * @param items - Content items to classify
 * @param profile - Learner profile
 * @returns Map of item ID to SR bin
 */
export function batchClassifyForSR(
  items: ContentItem[],
  profile: LearnerProfile
): Map<string, "A" | "B" | "C"> {
  const classifications = new Map<string, "A" | "B" | "C">();

  for (const item of items) {
    classifications.set(item.id, classifyForSR(item, profile));
  }

  return classifications;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a word is a sight word.
 * Exposed for testing and external use.
 *
 * @param word - Word to check
 * @returns True if word is in sight word list
 */
export function isSightWord(word: string): boolean {
  return COMMON_SIGHT_WORDS.has(word.toLowerCase().trim());
}

/**
 * Get detailed classification breakdown for debugging.
 *
 * @param item - Content item to analyze
 * @returns Detailed breakdown of classification features
 */
export function getClassificationBreakdown(item: ContentItem): {
  stage: ProgressionStage;
  complexity: number;
  concreteness: number;
  features: {
    isCVC: boolean;
    hasBlend: boolean;
    hasDigraph: boolean;
    hasIrregular: boolean;
    isSightWord: boolean;
    wordCount: number;
    letterCount: number;
  };
} {
  const text = item.text.toLowerCase().trim();
  const words = text.split(/\s+/);
  const firstWord = words[0] || '';

  return {
    stage: getProgressionStage(item),
    complexity: getOrthographicComplexity(item),
    concreteness: getSemanticConcreteness(item),
    features: {
      isCVC: words.length === 1 && firstWord ? isCVC(firstWord) : false,
      hasBlend: hasBlend(text),
      hasDigraph: hasDigraph(text),
      hasIrregular: hasIrregularPattern(text),
      isSightWord: firstWord ? isSightWord(firstWord) : false,
      wordCount: words.length,
      letterCount: text.replace(/\s/g, '').length
    }
  };
}
