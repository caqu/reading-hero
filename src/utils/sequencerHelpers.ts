/**
 * sequencerHelpers.ts
 *
 * Helper functions for integrating the adaptive sequencer into the game loop.
 * Handles:
 * - Content library conversion (Word → ContentItem)
 * - Motor metrics tracking
 * - History entry creation
 * - Profile state updates
 */

import { Word, Profile, WordResult, HistoryEntry, LearnerProfile } from "../types";
import { ContentItem, Category } from "../types/ContentItem";
import { EMOJI_WORDS } from "../data/emojiWords";
import * as highInterest from "../data/highInterest";

// =============================================================================
// CONTENT LIBRARY CONVERSION
// =============================================================================

/**
 * Convert a Word to a ContentItem for use in the adaptive sequencer.
 * Performs automatic classification and enrichment.
 */
export function wordToContentItem(word: Word): ContentItem {
  const text = word.text;
  const letterCount = text.replace(/\s/g, "").length;
  const syllableCount = word.syllables
    ? word.syllables.split("-").length
    : estimateSyllables(text);

  // Determine stage based on length and complexity
  let stage: 1 | 2 | 3 | 4 | 5 = 1;
  if (text.includes(" ")) {
    // Multi-word = phrase or sentence
    const wordCount = text.split(" ").length;
    stage = wordCount <= 2 ? 4 : 5;
  } else if (letterCount <= 3) {
    stage = 1; // Simple words
  } else if (letterCount <= 6) {
    stage = 2; // Growing words
  } else {
    stage = 3; // Sight words
  }

  // Determine category
  const category = determineCategory(word);

  // Calculate orthographic complexity (1-5)
  const orthographicComplexity = calculateOrthographicComplexity(text);

  // Calculate novelty score (0-1)
  const noveltyScore = word.emoji ? 0.8 : 0.5;

  // Calculate concreteness score (0-1)
  const concretenessScore = word.emoji || word.imageUrl ? 0.9 : 0.4;

  return {
    id: word.id,
    text: word.text,
    type: text.includes(" ") ? (text.split(" ").length > 2 ? "sentence" : "phrase") : "word",
    stage,
    category,
    syllables: syllableCount,
    letterCount,
    orthographicComplexity,
    emoji: word.emoji,
    hasImage: !!word.imageUrl || !!word.emoji,
    hasASL: !!word.signVideoUrl,
    hasSpanish: false, // TODO: Add Spanish detection
    srBin: "A", // Default to bin A
    noveltyScore,
    concretenessScore,
  };
}

/**
 * Build complete content library from all available words.
 */
export function buildContentLibrary(words: Word[]): ContentItem[] {
  return words.map(wordToContentItem);
}

/**
 * Estimate syllable count for a word (simple heuristic)
 */
function estimateSyllables(text: string): number {
  // Remove spaces and make lowercase
  const cleaned = text.toLowerCase().replace(/\s/g, "");

  // Count vowel groups
  const vowelGroups = cleaned.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Adjust for silent e
  if (cleaned.endsWith("e") && count > 1) {
    count--;
  }

  return Math.max(1, count);
}

/**
 * Calculate orthographic complexity (1-5 scale)
 */
function calculateOrthographicComplexity(text: string): number {
  const hasCapitals = /[A-Z]/.test(text);
  const hasPunctuation = /[.,!?;:]/.test(text);
  const hasMultipleWords = text.includes(" ");
  const hasComplexPatterns = /[qxz]|ch|sh|th|tion|sion/.test(text.toLowerCase());

  let complexity = 1;
  if (hasComplexPatterns) complexity++;
  if (hasMultipleWords) complexity++;
  if (hasPunctuation) complexity++;
  if (hasCapitals && text.length > 1) complexity++;

  return Math.min(5, complexity);
}

/**
 * Determine category for a word
 */
function determineCategory(word: Word): Category {
  // Check if word exists in high-interest categories
  const allHighInterest = [
    ...highInterest.animals,
    ...highInterest.foods,
    ...highInterest.places,
    ...highInterest.activities,
    ...highInterest.feelings,
    ...highInterest.tech,
    ...highInterest.fantasy,
    ...highInterest.nature,
    ...highInterest.actions,
    ...highInterest.nowWords,
  ];

  const found = allHighInterest.find((hw) => hw.word === word.text);
  if (found) {
    // Map high-interest categories to Category type
    const categoryMap: Record<string, Category> = {
      "animals": "animals",
      "foods": "food",
      "places": "places",
      "activities": "activities",
      "feelings": "feelings",
      "tech": "tech",
      "fantasy": "fantasy",
      "nature": "nature",
      "actions": "actions",
      "nowWords": "nowWords",
    };
    return categoryMap[found.category] || "activities";
  }

  // Check emoji words
  const emojiWord = EMOJI_WORDS.find((ew) => ew.id === word.id);
  if (emojiWord) {
    // Categorize based on emoji type
    if (emojiWord.emoji && /[🐶🐱🐭🐹🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🐛🦋🐌🐞🐜🦟🦗🕷🕸🦂🐢🐍🦎🦖🦕🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈]/.test(emojiWord.emoji)) {
      return "animals";
    } else if (emojiWord.emoji && /[🍏🍎🍐🍊🍋🍌🍉🍇🍓🫐🍈🍒🍑🥭🍍🥥🥝🍅🍆🥑🥦🥬🥒🌶🫑🌽🥕🫒🧄🧅🥔🍠🥐🥯🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🦴🌭🍔🍟🍕🫓🥪🥙🧆🌮🌯🫔🥗🥘🫕🥫🍝🍜🍲🍛🍣🍱🥟🦪🍤🍙🍚🍘🍥🥠🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜]/.test(emojiWord.emoji)) {
      return "food";
    } else if (emojiWord.emoji && /[🦸🦹🧙🧚🧛🧜🧝🧞🧟🧌🦄🐉🐲]/.test(emojiWord.emoji)) {
      return "fantasy";
    } else if (emojiWord.emoji && /[💻🖥⌨🖱🖨🖲💽💾💿📀🧮🎮🕹📱📲☎📞📟📠📺📻🎙🎚🎛🔭🔬🩺🩹🩺💊💉🩸🧬🦠]/.test(emojiWord.emoji)) {
      return "tech";
    } else if (emojiWord.emoji && /[🌲🌳🌴🌱🌿☘🍀🎍🎋🍃🍂🍁🍄🐚🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝🌛🌜🌚🌕🌖🌗🌘🌑🌒🌓🌔🌙⭐🌟✨⚡☄💫🔥💧❄☃⛄☔⛱☀🌤⛅🌥☁🌦🌧⛈🌩🌨]/.test(emojiWord.emoji)) {
      return "nature";
    }
  }

  // Default category
  return "activities";
}

// Note: Motor metrics are handled by utils/motorMetrics.ts

// =============================================================================
// HISTORY MANAGEMENT
// =============================================================================

/**
 * Create a history entry after word completion
 */
export function createHistoryEntry(
  itemId: string,
  stage: number,
  timeMs: number,
  errors: number,
  firstTryCorrect: boolean,
  profile: Profile
): HistoryEntry {
  return {
    id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    itemId,
    stage: stage as 1 | 2 | 3 | 4 | 5,
    timeMs,
    errors,
    firstTryCorrect,
    motorSnapshot: {
      leftHandErrors: profile.motor.leftHandErrors,
      rightHandErrors: profile.motor.rightHandErrors,
      rowTransitions: 0, // Not tracked yet
      letterErrors: { ...profile.motor.commonLetterErrors },
    },
    engagementBefore: profile.engagementScore,
    engagementAfter: profile.engagementScore,
    srBefore: "A",
    srAfter: "A",
  };
}

// =============================================================================
// PROFILE CONVERSION
// =============================================================================

/**
 * Convert Profile to LearnerProfile for sequencer
 */
export function profileToLearnerProfile(profile: Profile): LearnerProfile {
  return {
    id: profile.id,
    name: profile.name,
    createdAt: profile.createdAt,
    progressionState: profile.progressionState,
    engagementScore: profile.engagementScore,
    typingSpeedBaseline: profile.typingSpeedBaseline,
    errorBaseline: profile.errorBaseline,
    categoryAffinity: profile.categoryAffinity,
    motor: profile.motor,
    spacedRepetition: profile.spacedRepetition,
    lastTenItems: profile.lastTenItems,
    totalCompleted: profile.totalCompleted,
  };
}

/**
 * Convert ContentItem back to Word for display
 */
export function contentItemToWord(item: ContentItem, originalWords: Word[]): Word {
  // Try to find original word
  const original = originalWords.find((w) => w.id === item.id);
  if (original) {
    return original;
  }

  // Create minimal word from content item
  return {
    id: item.id,
    text: item.text,
    emoji: item.emoji,
  };
}
