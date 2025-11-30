/**
 * End-to-End Testing for Adaptive Sequencer System
 *
 * Comprehensive test suite validating all aspects of the adaptive sequencer:
 * - Progression direction (advance/downshift/stable)
 * - Phrase/sentence insertion
 * - Motor-learning effects
 * - Spaced repetition review scheduling
 * - Category affinity
 * - Recent duplicate avoidance
 */

import { describe, it, expect, beforeEach } from "vitest";
import { getNextItem } from "../engine/AdaptiveSequencer";
import { ContentItem, ProgressionStage, Category } from "../types/ContentItem";
import { LearnerProfile } from "../types/LearnerProfile";
import { HistoryEntry } from "../types/HistoryEntry";

// =============================================================================
// MOCK UTILITIES
// =============================================================================

/**
 * Creates a mock learner profile with sensible defaults
 */
function createMockProfile(overrides?: Partial<LearnerProfile>): LearnerProfile {
  return {
    id: "test-profile-123",
    name: "Test Learner",
    createdAt: Date.now(),
    progressionState: 2,
    engagementScore: 50,
    typingSpeedBaseline: 200, // ms per letter
    errorBaseline: 1.0,
    categoryAffinity: {
      animals: 50,
      food: 50,
      fantasy: 50,
      tech: 50,
      nature: 50,
      actions: 50,
      feelings: 50,
      places: 50,
      activities: 50,
      nowWords: 50,
    },
    motor: {
      leftHandErrors: 0,
      rightHandErrors: 0,
      rowTransitionSpeed: 150,
      commonLetterErrors: {},
    },
    spacedRepetition: {
      A: [],
      B: [],
      C: [],
    },
    lastTenItems: [],
    totalCompleted: 0,
    ...overrides,
  };
}

/**
 * Creates mock history entries with specified performance characteristics
 */
function createMockHistory(
  count: number,
  options?: {
    stage?: ProgressionStage;
    avgTimeMs?: number;
    avgErrors?: number;
    engagementScore?: number;
  }
): HistoryEntry[] {
  const {
    stage = 2,
    avgTimeMs = 1000,
    avgErrors = 1,
    engagementScore = 50,
  } = options || {};

  const history: HistoryEntry[] = [];
  for (let i = 0; i < count; i++) {
    history.push({
      id: `entry-${i}`,
      timestamp: Date.now() - (count - i) * 1000,
      itemId: `item-${i}`,
      stage,
      timeMs: avgTimeMs + (Math.random() - 0.5) * 200, // Add some variance
      errors: Math.max(0, avgErrors + Math.floor((Math.random() - 0.5) * 2)),
      firstTryCorrect: avgErrors === 0,
      motorSnapshot: {
        leftHandErrors: 0,
        rightHandErrors: 0,
        rowTransitions: 0,
        letterErrors: {},
      },
      engagementBefore: engagementScore,
      engagementAfter: engagementScore + (Math.random() - 0.5) * 4,
      srBefore: "A",
      srAfter: "B",
    });
  }
  return history;
}

/**
 * Creates a mock content library with diverse items across all stages
 */
function createMockLibrary(): ContentItem[] {
  const library: ContentItem[] = [];

  // Stage 1: Simple words (CVC patterns)
  const stage1Words = ["cat", "dog", "sun", "fox", "pig", "bug", "hen", "cup"];
  stage1Words.forEach((word, idx) => {
    library.push({
      id: `stage1-${word}`,
      text: word,
      type: "word",
      stage: 1,
      category: idx % 2 === 0 ? "animals" : "nature",
      syllables: 1,
      letterCount: word.length,
      orthographicComplexity: 1,
      hasImage: true,
      hasASL: false,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.5,
      concretenessScore: 0.9,
    });
  });

  // Stage 2: Growing words
  const stage2Words = ["frog", "blob", "stop", "plan", "drop", "flag", "skip", "clip"];
  stage2Words.forEach((word, idx) => {
    library.push({
      id: `stage2-${word}`,
      text: word,
      type: "word",
      stage: 2,
      category: idx % 3 === 0 ? "animals" : idx % 3 === 1 ? "activities" : "nature",
      syllables: 1,
      letterCount: word.length,
      orthographicComplexity: 2,
      hasImage: true,
      hasASL: false,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.5,
      concretenessScore: 0.8,
    });
  });

  // Stage 3: Sight words
  const stage3Words = ["the", "was", "have", "could", "would", "should", "make", "like"];
  stage3Words.forEach((word, idx) => {
    library.push({
      id: `stage3-${word}`,
      text: word,
      type: "word",
      stage: 3,
      category: "nowWords",
      syllables: 1,
      letterCount: word.length,
      orthographicComplexity: 2,
      hasImage: false,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.3,
      concretenessScore: 0.2,
    });
  });

  // Stage 4: Phrases
  const stage4Phrases = [
    "big dog",
    "silly cat",
    "the monkey",
    "cool fox",
    "happy pig",
    "fast bug",
  ];
  stage4Phrases.forEach((phrase, idx) => {
    library.push({
      id: `stage4-${phrase.replace(/\s+/g, "-")}`,
      text: phrase,
      type: "phrase",
      stage: 4,
      category: idx % 2 === 0 ? "animals" : "activities",
      syllables: 2,
      letterCount: phrase.length,
      orthographicComplexity: 2,
      hasImage: true,
      hasASL: false,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.6,
      concretenessScore: 0.85,
    });
  });

  // Stage 5: Micro-sentences
  const stage5Sentences = [
    "The dog runs.",
    "The cat jumps.",
    "A pig eats.",
    "The fox is fast.",
    "Pizza rocks.",
  ];
  stage5Sentences.forEach((sentence, idx) => {
    library.push({
      id: `stage5-${sentence.replace(/[\s.]+/g, "-").toLowerCase()}`,
      text: sentence,
      type: "sentence",
      stage: 5,
      category: idx % 2 === 0 ? "animals" : "food",
      syllables: 3,
      letterCount: sentence.length,
      orthographicComplexity: 2,
      hasImage: true,
      hasASL: false,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.7,
      concretenessScore: 0.8,
    });
  });

  // Add words with specific letters for motor learning tests
  const motorWords = [
    { text: "kick", letter: "k" },
    { text: "keep", letter: "k" },
    { text: "king", letter: "k" },
    { text: "kite", letter: "k" },
  ];
  motorWords.forEach(({ text, letter }) => {
    library.push({
      id: `motor-${text}`,
      text,
      type: "word",
      stage: 2,
      category: "activities",
      syllables: 1,
      letterCount: text.length,
      orthographicComplexity: 2,
      hasImage: true,
      hasASL: false,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.5,
      concretenessScore: 0.7,
    });
  });

  // Add high-affinity category items
  const highAffinityAnimals = ["lion", "bear", "wolf", "deer", "seal"];
  highAffinityAnimals.forEach((word) => {
    library.push({
      id: `affinity-${word}`,
      text: word,
      type: "word",
      stage: 2,
      category: "animals",
      syllables: 1,
      letterCount: word.length,
      orthographicComplexity: 2,
      hasImage: true,
      hasASL: false,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.5,
      concretenessScore: 0.9,
    });
  });

  return library;
}

// =============================================================================
// TEST SUITE
// =============================================================================

describe("End-to-End Sequencer Tests", () => {
  let library: ContentItem[];

  beforeEach(() => {
    library = createMockLibrary();
  });

  // ===========================================================================
  // TEST 1: PROGRESSION DIRECTION - ADVANCE
  // ===========================================================================
  describe("Test 1: Progression Direction - Should advance stage when performance is good", () => {
    it("should eventually select stage 3 items when starting at stage 2 with excellent performance", () => {
      // Setup: profile at stage 2, recent fast times, no errors
      const profile = createMockProfile({
        progressionState: 2,
        engagementScore: 70, // High engagement
        typingSpeedBaseline: 200,
        errorBaseline: 1.0,
      });

      // Create history with fast performance and few errors
      const history = createMockHistory(10, {
        stage: 2,
        avgTimeMs: 600, // Fast (baseline would be ~1000ms for 5 letters)
        avgErrors: 0, // No errors
        engagementScore: 70,
      });

      // Execute: get next 10 items
      const selectedStages: number[] = [];
      for (let i = 0; i < 10; i++) {
        const result = getNextItem(profile, history, library);
        selectedStages.push(result.item.stage);

        // Update profile to simulate progression
        profile.lastTenItems = [...profile.lastTenItems.slice(-9), result.item.id];
      }

      // Assert: should eventually select stage 3 items (or at least attempt to)
      // With good performance, target state should be 3
      const hasStage3Items = selectedStages.some((stage) => stage === 3);
      expect(hasStage3Items).toBe(true);

      // Most selections should be stage 2 or 3 (target ± 1)
      // Allow some variance due to randomness in selection
      const stage2Or3Count = selectedStages.filter((s) => s === 2 || s === 3).length;
      expect(stage2Or3Count).toBeGreaterThanOrEqual(6); // At least 60%
    });
  });

  // ===========================================================================
  // TEST 2: DOWNSHIFT ON ERRORS
  // ===========================================================================
  describe("Test 2: Downshift on errors - Should decrease stage when many errors", () => {
    it("should eventually select stage 2 items when starting at stage 3 with poor performance", () => {
      // Setup: profile at stage 3, recent slow times, many errors
      const profile = createMockProfile({
        progressionState: 3,
        engagementScore: 40, // Lower engagement
        typingSpeedBaseline: 200,
        errorBaseline: 1.0,
      });

      // Create history with slow performance and many errors
      const history = createMockHistory(10, {
        stage: 3,
        avgTimeMs: 1800, // Slow (baseline ~1000ms)
        avgErrors: 3, // Many errors
        engagementScore: 40,
      });

      // Execute: get next 10 items
      const selectedStages: number[] = [];
      for (let i = 0; i < 10; i++) {
        const result = getNextItem(profile, history, library);
        selectedStages.push(result.item.stage);

        // Update profile
        profile.lastTenItems = [...profile.lastTenItems.slice(-9), result.item.id];
      }

      // Assert: should eventually select stage 2 items
      const hasStage2Items = selectedStages.some((stage) => stage === 2);
      expect(hasStage2Items).toBe(true);

      // Most selections should be stage 2 or 3 (target ± 1)
      const stage2Or3Count = selectedStages.filter((s) => s === 2 || s === 3).length;
      expect(stage2Or3Count).toBeGreaterThanOrEqual(7);
    });
  });

  // ===========================================================================
  // TEST 3: STABLE LEVEL
  // ===========================================================================
  describe("Test 3: Stable level - Should stay at stage when mixed signals", () => {
    it("should mostly select stage 2 items when performance is mixed", () => {
      // Setup: profile at stage 2, mixed performance
      const profile = createMockProfile({
        progressionState: 2,
        engagementScore: 50, // Medium engagement
        typingSpeedBaseline: 200,
        errorBaseline: 1.0,
      });

      // Create history with mixed performance
      const history = createMockHistory(10, {
        stage: 2,
        avgTimeMs: 1000, // Average
        avgErrors: 1, // Average
        engagementScore: 50,
      });

      // Execute: get next 20 items
      const selectedStages: number[] = [];
      for (let i = 0; i < 20; i++) {
        const result = getNextItem(profile, history, library);
        selectedStages.push(result.item.stage);

        // Update profile
        profile.lastTenItems = [...profile.lastTenItems.slice(-9), result.item.id];
      }

      // Assert: mostly stage 2 items (current level)
      const stage2Count = selectedStages.filter((s) => s === 2).length;
      expect(stage2Count).toBeGreaterThanOrEqual(8); // At least 40% should be stage 2

      // Should stay within stage 1-3 range (target ± 1)
      // Allow some variance for review injections and fun items
      const inRangeCount = selectedStages.filter((s) => s >= 1 && s <= 3).length;
      expect(inRangeCount).toBeGreaterThanOrEqual(16); // At least 80%
    });
  });

  // ===========================================================================
  // TEST 4: PHRASE/SENTENCE INSERTION
  // ===========================================================================
  describe("Test 4: Phrase/sentence insertion - Should insert phrases at stage 4", () => {
    it("should include phrase items when profile is at stage 4", () => {
      // Setup: profile at stage 4
      const profile = createMockProfile({
        progressionState: 4,
        engagementScore: 60,
      });

      const history = createMockHistory(10, {
        stage: 4,
        avgTimeMs: 1200,
        avgErrors: 1,
        engagementScore: 60,
      });

      // Execute: get next 20 items
      const selectedTypes: string[] = [];
      const selectedStages: number[] = [];
      for (let i = 0; i < 20; i++) {
        const result = getNextItem(profile, history, library);
        selectedTypes.push(result.item.type);
        selectedStages.push(result.item.stage);

        // Update profile
        profile.lastTenItems = [...profile.lastTenItems.slice(-9), result.item.id];
      }

      // Assert: should contain phrase items
      const phraseCount = selectedTypes.filter((type) => type === "phrase").length;
      expect(phraseCount).toBeGreaterThan(0);

      // Should include stage 4 items
      const stage4Count = selectedStages.filter((s) => s === 4).length;
      expect(stage4Count).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // TEST 5: MOTOR LEARNING EFFECTS
  // ===========================================================================
  describe("Test 5: Motor learning effects - Should select words with problem letters", () => {
    it("should select words containing 'k' when learner has high errors on 'k'", () => {
      // Setup: profile with high errors on 'k'
      const profile = createMockProfile({
        progressionState: 2,
        motor: {
          leftHandErrors: 5,
          rightHandErrors: 10,
          rowTransitionSpeed: 150,
          commonLetterErrors: {
            k: 10, // High error count for 'k'
            a: 1,
            b: 1,
          },
        },
      });

      const history = createMockHistory(10, {
        stage: 2,
        avgTimeMs: 1000,
        avgErrors: 1,
      });

      // Execute: get next 20 items
      const selectedItems: ContentItem[] = [];
      for (let i = 0; i < 20; i++) {
        const result = getNextItem(profile, history, library);
        selectedItems.push(result.item);

        // Update profile
        profile.lastTenItems = [...profile.lastTenItems.slice(-9), result.item.id];
      }

      // Assert: many items should contain 'k'
      const itemsWithK = selectedItems.filter((item) =>
        item.text.toLowerCase().includes("k")
      );

      // We have 4 motor words with 'k' in the library at stage 2
      // With proper motor learning, we should see at least some of them
      expect(itemsWithK.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // TEST 6: SR-LITE REVIEW SCHEDULING
  // ===========================================================================
  describe("Test 6: SR-lite review scheduling - Should inject reviews periodically", () => {
    it("should inject review items when profile has items in bins B and C", () => {
      // Setup: profile with items in bins B and C
      const profile = createMockProfile({
        progressionState: 2,
        totalCompleted: 5, // Will trigger review check based on modulo
        spacedRepetition: {
          A: ["stage1-cat", "stage2-frog"],
          B: ["stage1-dog", "stage2-blob"],
          C: ["stage1-sun", "stage2-stop"],
        },
      });

      const history = createMockHistory(10);

      // Execute: get next 20 items and check for reviews
      const reviewInjections: boolean[] = [];
      for (let i = 0; i < 20; i++) {
        const result = getNextItem(profile, history, library);
        reviewInjections.push(result.reason.injectedReview);

        // Update profile
        profile.lastTenItems = [...profile.lastTenItems.slice(-9), result.item.id];
        profile.totalCompleted++;
      }

      // Assert: should contain some review items
      const reviewCount = reviewInjections.filter((injected) => injected).length;
      expect(reviewCount).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // TEST 7: CATEGORY AFFINITY EFFECTS
  // ===========================================================================
  describe("Test 7: Category affinity - Should prefer high-affinity categories", () => {
    it("should mostly select animal items when animals=90, food=20", () => {
      // Setup: profile with high affinity for animals
      const profile = createMockProfile({
        progressionState: 2,
        categoryAffinity: {
          animals: 90,
          food: 20,
          fantasy: 30,
          tech: 30,
          nature: 30,
          actions: 30,
          feelings: 30,
          places: 30,
          activities: 30,
          nowWords: 30,
        },
      });

      const history = createMockHistory(10);

      // Execute: get next 20 items
      const selectedCategories: Category[] = [];
      for (let i = 0; i < 20; i++) {
        const result = getNextItem(profile, history, library);
        selectedCategories.push(result.item.category);

        // Update profile
        profile.lastTenItems = [...profile.lastTenItems.slice(-9), result.item.id];
      }

      // Assert: mostly animal items
      const animalCount = selectedCategories.filter((cat) => cat === "animals").length;
      const foodCount = selectedCategories.filter((cat) => cat === "food").length;

      // Animal items should significantly outnumber food items
      expect(animalCount).toBeGreaterThan(foodCount * 2);
    });
  });

  // ===========================================================================
  // TEST 8: NO RECENT DUPLICATES
  // ===========================================================================
  describe("Test 8: No recent duplicates - Should avoid last 10 items", () => {
    it("should strongly prefer avoiding items from lastTenItems", () => {
      // Setup: profile with lastTenItems filled with some stage 2 items
      // We include items from different stages to ensure enough candidates remain
      const recentItems = [
        "stage1-cat",
        "stage1-dog",
        "stage2-frog",
        "stage2-blob",
        "stage3-the",
        "stage3-was",
      ];

      const profile = createMockProfile({
        progressionState: 2,
        lastTenItems: recentItems,
      });

      const history = createMockHistory(10);

      // Execute: get next 10 items
      const selectedIds: string[] = [];
      for (let i = 0; i < 10; i++) {
        const result = getNextItem(profile, history, library);
        selectedIds.push(result.item.id);

        // Update profile (simulate real usage)
        profile.lastTenItems = [...profile.lastTenItems.slice(-9), result.item.id];
      }

      // Assert: should strongly avoid items from original lastTenItems
      // Allow for fallback cases when no candidates found
      const duplicates = selectedIds.filter((id) => recentItems.includes(id));
      expect(duplicates.length).toBeLessThanOrEqual(3); // Allow max 3 fallbacks (30%)
    });

    it("should maintain recency avoidance across multiple selections", () => {
      const profile = createMockProfile({
        progressionState: 2,
        lastTenItems: [],
      });

      const history = createMockHistory(10);

      // Execute: get 15 items and track what was selected
      const allSelectedIds: string[] = [];
      for (let i = 0; i < 15; i++) {
        const result = getNextItem(profile, history, library);
        allSelectedIds.push(result.item.id);

        // Update lastTenItems as would happen in real usage
        profile.lastTenItems = [...profile.lastTenItems.slice(-9), result.item.id];
      }

      // Assert: last 10 items should not appear in immediate next selection
      const last10 = allSelectedIds.slice(-10);

      // Get one more item
      const finalResult = getNextItem(profile, history, library);

      // This final item should not be in the last 10
      expect(last10).not.toContain(finalResult.item.id);
    });
  });

  // ===========================================================================
  // ADDITIONAL INTEGRATION TESTS
  // ===========================================================================
  describe("Additional integration tests", () => {
    it("should handle empty SR bins gracefully", () => {
      const profile = createMockProfile({
        spacedRepetition: {
          A: [],
          B: [],
          C: [],
        },
      });

      const history = createMockHistory(5);

      expect(() => {
        getNextItem(profile, history, library);
      }).not.toThrow();
    });

    it("should handle profile with no engagement data", () => {
      const profile = createMockProfile({
        engagementScore: 0,
      });

      const history: HistoryEntry[] = [];

      expect(() => {
        getNextItem(profile, history, library);
      }).not.toThrow();
    });

    it("should select items when all items are in lastTenItems (fallback behavior)", () => {
      // Create a minimal library
      const minimalLibrary = library.slice(0, 5);

      const profile = createMockProfile({
        progressionState: 2,
        lastTenItems: minimalLibrary.map((item) => item.id),
      });

      const history = createMockHistory(5);

      // Should still return an item (fallback)
      const result = getNextItem(profile, history, minimalLibrary);
      expect(result.item).toBeDefined();
    });

    it("should maintain diversity in selections", () => {
      const profile = createMockProfile({
        progressionState: 2,
      });

      const history = createMockHistory(10);

      // Get 10 items
      const selectedIds = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const result = getNextItem(profile, history, library);
        selectedIds.add(result.item.id);

        profile.lastTenItems = [...profile.lastTenItems.slice(-9), result.item.id];
      }

      // Should have selected at least 8 different items (some randomness allowed)
      expect(selectedIds.size).toBeGreaterThanOrEqual(8);
    });
  });
});
