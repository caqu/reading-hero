/**
 * Core Words - Initial Seed Data
 *
 * This file contains fully-annotated Word objects for the initial seed set.
 * Currently includes three examples:
 * - "the" (Dolch/Fry article, sight word)
 * - "dog" (Dolch noun, engaging animal with emoji)
 * - "barks" (custom engaging verb, pairs with "dog")
 *
 * Future expansion will include:
 * - Full Dolch Pre-K and K word sets
 * - Fry 1-100 high-frequency words
 * - Additional engaging concrete nouns and simple verbs
 */

import { Word } from "./wordSchema";

export const coreWords: Word[] = [
  // ==========================================================================
  // "the" - High-frequency article
  // ==========================================================================
  {
    id: "the",
    text: "the",
    gradeBands: ["K", "1"],
    partOfSpeech: "article",
    instructionalPurposes: ["sight_word", "connector_function"],
    decodingPattern: "irregular",
    syllables: ["the"],
    segments: ["the"],
    frequencyRank: 1,                 // Fry rank (most frequent word)
    isSightWord: true,
    isHighFrequency: true,
    semanticCategories: [],
    engagementTags: [],
    emoji: {
      defaultEmoji: undefined,
      emojiLabel: undefined,
      isPrimaryVisual: false
    },
    asl: {
      gloss: undefined,
      hasRecordedSignVideo: false,
      signVideoStatus: "missing"
    },
    lineage: {
      sources: ["dolch_core", "fry_1_100"],
      notes: "High-frequency article from Dolch Pre-K/K and Fry 1–100. Essential for sentence construction."
    }
  },

  // ==========================================================================
  // "dog" - Concrete noun with emoji support
  // ==========================================================================
  {
    id: "dog",
    text: "dog",
    gradeBands: ["K", "1"],
    partOfSpeech: "noun",
    instructionalPurposes: ["sight_word", "phonics_regular", "engaging_meaning"],
    decodingPattern: "CVC",
    syllables: ["dog"],
    segments: ["d", "og"],
    frequencyRank: 150,               // placeholder rank
    isSightWord: true,                // Dolch noun
    isHighFrequency: true,
    semanticCategories: ["animal", "pet"],
    engagementTags: ["animal", "story_hook"],
    emoji: {
      defaultEmoji: "🐶",
      emojiLabel: "dog face",
      isPrimaryVisual: true
    },
    asl: {
      gloss: "DOG",
      hasRecordedSignVideo: false,
      signVideoStatus: "missing"
    },
    lineage: {
      sources: ["dolch_noun", "emoji_seed"],
      notes: "Dolch noun; concrete, visually engaging; mapped to 🐶 and ASL gloss DOG. Excellent anchor for animal-themed content."
    }
  },

  // ==========================================================================
  // "barks" - Engaging verb for sentence building
  // ==========================================================================
  {
    id: "barks",
    text: "barks",
    lemma: "bark",
    gradeBands: ["1", "2"],
    partOfSpeech: "verb",
    instructionalPurposes: ["morphology_derived", "engaging_meaning"],
    decodingPattern: "CVC",
    syllables: ["barks"],
    segments: ["bark", "s"],
    frequencyRank: undefined,
    isSightWord: false,
    isHighFrequency: false,
    semanticCategories: ["animal_sound"],
    engagementTags: ["animal", "story_hook", "silly_potential"],
    emoji: {
      defaultEmoji: "🐕",
      emojiLabel: "dog",
      isPrimaryVisual: false
    },
    asl: {
      gloss: "DOG-BARK",
      hasRecordedSignVideo: false,
      signVideoStatus: "missing"
    },
    lineage: {
      sources: ["custom_thematic"],
      notes: "Added to make engaging mini-sentences with 'dog' (e.g., 'The dog barks.'). Demonstrates morphology (bark + s) and verb-noun pairing."
    }
  }
];

/**
 * Get all core words.
 */
export function getCoreWords(): Word[] {
  return [...coreWords];
}

/**
 * Get a core word by ID.
 */
export function getCoreWordById(id: string): Word | undefined {
  return coreWords.find(w => w.id === id);
}
