/**
 * PhraseSentenceGenerator.ts
 *
 * Generates phrases and micro-sentences from seed words.
 * Produces simple 2-word phrases and short 4-7 word sentences with visual appeal.
 *
 * Phrases (Stage 4):
 * - Pattern: [article | adjective] + [noun]
 * - Examples: "big dog", "the monkey", "silly cat"
 * - Max 2 words
 *
 * Micro-Sentences (Stage 5):
 * - Patterns: "The [noun] [verb].", "The [noun] is [adjective].", "[noun] [verb]s."
 * - Examples: "The dog barks.", "The monkey is silly.", "Pizza rocks."
 * - Max 7 words
 */

import type { ContentItem, Category } from '../types/ContentItem';

// ============================================================================
// TEMPLATE DATA
// ============================================================================

/**
 * Articles used in phrase and sentence generation
 */
const ARTICLES = ['the', 'a'] as const;

/**
 * Adjectives for descriptive phrases and sentences
 */
const ADJECTIVES = [
  'big',
  'small',
  'silly',
  'happy',
  'fast',
  'slow',
  'cool',
  'funny',
  'brave',
  'smart',
] as const;

/**
 * Verbs for action sentences
 */
const VERBS = [
  'runs',
  'jumps',
  'dances',
  'sparkles',
  'flies',
  'swims',
  'eats',
  'plays',
  'sleeps',
  'rocks',
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for a content item
 */
function generateId(text: string, type: 'phrase' | 'sentence'): string {
  return `${type}-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
}

/**
 * Count syllables in a word (simple heuristic)
 * This is a rough approximation based on vowel groups
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Adjust for silent e
  if (word.endsWith('e')) {
    count--;
  }

  return Math.max(1, count);
}

/**
 * Calculate total syllables for a phrase or sentence
 */
function calculateTotalSyllables(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.reduce((total, word) => {
    // Remove punctuation for syllable counting
    const cleanWord = word.replace(/[^\w]/g, '');
    return total + countSyllables(cleanWord);
  }, 0);
}

/**
 * Calculate orthographic complexity (1-5 scale)
 * Based on presence of complex patterns
 */
function calculateOrthographicComplexity(text: string): number {
  const lower = text.toLowerCase();
  let complexity = 1;

  // Increase for digraphs
  if (/sh|ch|th|wh|ph/.test(lower)) complexity++;

  // Increase for consonant blends
  if (/bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|sc|sk|sl|sm|sn|sp|st|sw|tr/.test(lower)) complexity++;

  // Increase for long vowel patterns
  if (/ai|ay|ea|ee|ie|oa|oe|ue/.test(lower)) complexity++;

  // Increase for silent letters
  if (/kn|gn|wr|mb/.test(lower)) complexity++;

  return Math.min(5, complexity);
}

/**
 * Pick a random element from an array
 */
function randomPick<T>(array: readonly T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index]!;
}

/**
 * Assign spaced repetition bin based on complexity and stage
 */
function assignSRBin(stage: number, orthographicComplexity: number): 'A' | 'B' | 'C' {
  // Stage 4 (phrases) and Stage 5 (sentences) with higher complexity go to higher bins
  if (stage === 4) {
    return orthographicComplexity >= 3 ? 'B' : 'A';
  }
  if (stage === 5) {
    return orthographicComplexity >= 4 ? 'C' : orthographicComplexity >= 3 ? 'B' : 'A';
  }
  return 'A';
}

// ============================================================================
// PHRASE GENERATION
// ============================================================================

/**
 * Generate a 2-word phrase from a seed word
 *
 * Patterns:
 * - [article] + [noun]
 * - [adjective] + [noun]
 *
 * @param seedWord - The seed word to use as the noun
 * @returns A ContentItem representing the generated phrase
 *
 * @example
 * ```ts
 * const phrase = generatePhrase(dogWord);
 * // Returns: { text: "big dog", type: "phrase", stage: 4, ... }
 * ```
 */
export function generatePhrase(seedWord: ContentItem): ContentItem {
  const noun = seedWord.text;

  // Randomly choose between article or adjective pattern
  const useArticle = Math.random() < 0.5;
  const modifier = useArticle ? randomPick(ARTICLES) : randomPick(ADJECTIVES);

  const phraseText = `${modifier} ${noun}`;
  const id = generateId(phraseText, 'phrase');

  const totalSyllables = calculateTotalSyllables(phraseText);
  const letterCount = phraseText.length; // Includes space
  const orthographicComplexity = calculateOrthographicComplexity(phraseText);

  // Inherit multimodal properties from seed word
  const hasImage = seedWord.hasImage;
  const hasASL = seedWord.hasASL;
  const hasSpanish = seedWord.hasSpanish;
  const emoji = seedWord.emoji;

  // Calculate novelty: phrases are moderately novel
  const noveltyScore = 0.5 + (Math.random() * 0.2); // 0.5-0.7

  // Inherit concreteness from seed word (phrases maintain noun's concreteness)
  const concretenessScore = seedWord.concretenessScore;

  return {
    id,
    text: phraseText,
    type: 'phrase',
    stage: 4,
    category: seedWord.category,
    syllables: totalSyllables,
    letterCount,
    orthographicComplexity,
    emoji,
    hasImage,
    hasASL,
    hasSpanish,
    srBin: assignSRBin(4, orthographicComplexity),
    noveltyScore,
    concretenessScore,
  };
}

// ============================================================================
// SENTENCE GENERATION
// ============================================================================

/**
 * Generate a 4-7 word micro-sentence from a seed word
 *
 * Patterns:
 * - "The [noun] [verb]."
 * - "The [noun] is [adjective]."
 * - "[noun] [verb]s."
 *
 * @param seedWord - The seed word to use as the noun
 * @returns A ContentItem representing the generated sentence
 *
 * @example
 * ```ts
 * const sentence = generateMicroSentence(dogWord);
 * // Returns: { text: "The dog barks.", type: "sentence", stage: 5, ... }
 * ```
 */
export function generateMicroSentence(seedWord: ContentItem): ContentItem {
  const noun = seedWord.text;
  const nounCapitalized = noun.charAt(0).toUpperCase() + noun.slice(1);

  // Randomly choose sentence pattern
  const patterns = [
    () => `The ${noun} ${randomPick(VERBS)}.`,
    () => `The ${noun} is ${randomPick(ADJECTIVES)}.`,
    () => `${nounCapitalized} ${randomPick(VERBS)}.`,
  ];

  const sentenceText = randomPick(patterns)();
  const id = generateId(sentenceText, 'sentence');

  const totalSyllables = calculateTotalSyllables(sentenceText);
  const letterCount = sentenceText.length; // Includes spaces and punctuation
  const orthographicComplexity = calculateOrthographicComplexity(sentenceText);

  // Inherit multimodal properties from seed word
  const hasImage = seedWord.hasImage;
  const hasASL = seedWord.hasASL;
  const hasSpanish = seedWord.hasSpanish;
  const emoji = seedWord.emoji;

  // Calculate novelty: sentences are more novel than phrases
  const noveltyScore = 0.6 + (Math.random() * 0.3); // 0.6-0.9

  // Inherit concreteness from seed word (sentences maintain noun's concreteness)
  const concretenessScore = seedWord.concretenessScore;

  return {
    id,
    text: sentenceText,
    type: 'sentence',
    stage: 5,
    category: seedWord.category,
    syllables: totalSyllables,
    letterCount,
    orthographicComplexity,
    emoji,
    hasImage,
    hasASL,
    hasSpanish,
    srBin: assignSRBin(5, orthographicComplexity),
    noveltyScore,
    concretenessScore,
  };
}

// ============================================================================
// BATCH GENERATION
// ============================================================================

/**
 * Generate multiple phrases from a seed word
 *
 * @param seedWord - The seed word to use as the noun
 * @param count - Number of phrases to generate
 * @returns Array of ContentItems representing phrases
 */
export function generatePhrases(seedWord: ContentItem, count: number): ContentItem[] {
  const phrases: ContentItem[] = [];
  const generated = new Set<string>();

  let attempts = 0;
  const maxAttempts = count * 10; // Prevent infinite loops

  while (phrases.length < count && attempts < maxAttempts) {
    const phrase = generatePhrase(seedWord);

    // Ensure uniqueness
    if (!generated.has(phrase.text)) {
      generated.add(phrase.text);
      phrases.push(phrase);
    }

    attempts++;
  }

  return phrases;
}

/**
 * Generate multiple micro-sentences from a seed word
 *
 * @param seedWord - The seed word to use as the noun
 * @param count - Number of sentences to generate
 * @returns Array of ContentItems representing sentences
 */
export function generateMicroSentences(seedWord: ContentItem, count: number): ContentItem[] {
  const sentences: ContentItem[] = [];
  const generated = new Set<string>();

  let attempts = 0;
  const maxAttempts = count * 10; // Prevent infinite loops

  while (sentences.length < count && attempts < maxAttempts) {
    const sentence = generateMicroSentence(seedWord);

    // Ensure uniqueness
    if (!generated.has(sentence.text)) {
      generated.add(sentence.text);
      sentences.push(sentence);
    }

    attempts++;
  }

  return sentences;
}
