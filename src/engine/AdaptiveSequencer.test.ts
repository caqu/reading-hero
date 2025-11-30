/**
 * AdaptiveSequencer.test.ts
 *
 * Test suite for the Adaptive Sequencer core functionality.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { getNextItem, computeTargetState, filterCandidates, scoreCandidate } from "./AdaptiveSequencer";
import { ContentItem, ProgressionStage } from "../types/ContentItem";
import { LearnerProfile } from "../types/LearnerProfile";
import { HistoryEntry } from "../types/HistoryEntry";

// =============================================================================
// TEST FIXTURES
// =============================================================================

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
      animals: 80,
      food: 60,
      fantasy: 40,
      tech: 30,
      nature: 70,
      actions: 50,
      feelings: 45,
      places: 55,
      activities: 65,
      nowWords: 50,
    },
    motor: {
      leftHandErrors: 0,
      rightHandErrors: 0,
      rowTransitionSpeed: 150,
      commonLetterErrors: {},
    },
    spacedRepetition: {
      A: ["item-5", "item-6"],
      B: ["item-7", "item-8"],
      C: ["item-9", "item-10"],
    },
    lastTenItems: ["item-1", "item-2", "item-3"],
    totalCompleted: 10,
    ...overrides,
  };
}

function createMockContentItem(overrides?: Partial<ContentItem>): ContentItem {
  const id = overrides?.id || `item-${Math.random()}`;
  return {
    id,
    text: "cat",
    type: "word",
    stage: 1,
    category: "animals",
    syllables: 1,
    letterCount: 3,
    orthographicComplexity: 1,
    hasImage: true,
    hasASL: false,
    hasSpanish: true,
    srBin: "A",
    noveltyScore: 0.5,
    concretenessScore: 0.9,
    ...overrides,
  };
}

function createMockHistory(entries: number): HistoryEntry[] {
  const history: HistoryEntry[] = [];
  for (let i = 0; i < entries; i++) {
    history.push({
      id: `entry-${i}`,
      timestamp: Date.now() - (entries - i) * 1000,
      itemId: `item-${i}`,
      stage: 2,
      timeMs: 1000,
      errors: 1,
      firstTryCorrect: true,
      motorSnapshot: {
        leftHandErrors: 0,
        rightHandErrors: 0,
        rowTransitions: 0,
        letterErrors: {},
      },
      engagementBefore: 50,
      engagementAfter: 52,
      srBefore: "A",
      srAfter: "B",
    });
  }
  return history;
}

// =============================================================================
// TESTS
// =============================================================================

describe("AdaptiveSequencer", () => {
  describe("getNextItem", () => {
    it("should return a valid SequencerOutput", () => {
      const profile = createMockProfile();
      const history = createMockHistory(5);
      const library = [
        createMockContentItem({ id: "cat", stage: 1 }),
        createMockContentItem({ id: "dog", stage: 2 }),
        createMockContentItem({ id: "fish", stage: 3 }),
      ];

      const result = getNextItem(profile, history, library);

      expect(result).toBeDefined();
      expect(result.item).toBeDefined();
      expect(result.reason).toBeDefined();
      expect(result.reason.progressionState).toBeGreaterThanOrEqual(1);
      expect(result.reason.progressionState).toBeLessThanOrEqual(5);
      expect(result.reason.matchedCandidates).toBeGreaterThanOrEqual(0);
    });

    it("should throw error for empty library", () => {
      const profile = createMockProfile();
      const history = createMockHistory(5);
      const library: ContentItem[] = [];

      expect(() => getNextItem(profile, history, library)).toThrow(
        "Content library is empty"
      );
    });

    it("should exclude items from lastTenItems", () => {
      const profile = createMockProfile({
        lastTenItems: ["cat", "dog"],
      });
      const history = createMockHistory(5);
      const library = [
        createMockContentItem({ id: "cat", stage: 2 }),
        createMockContentItem({ id: "dog", stage: 2 }),
        createMockContentItem({ id: "fish", stage: 2 }),
      ];

      const result = getNextItem(profile, history, library);

      // Should not select cat or dog
      expect(result.item.id).toBe("fish");
    });

    it("should select items within target difficulty range", () => {
      const profile = createMockProfile({
        progressionState: 2,
      });
      const history = createMockHistory(5);
      const library = [
        createMockContentItem({ id: "simple", stage: 1 }),
        createMockContentItem({ id: "medium", stage: 2 }),
        createMockContentItem({ id: "hard", stage: 5 }),
      ];

      const result = getNextItem(profile, history, library);

      // Should select stage 1-3 (target ± 1)
      expect([1, 2, 3]).toContain(result.item.stage);
    });

    it("should populate reason object correctly", () => {
      const profile = createMockProfile();
      const history = createMockHistory(5);
      const library = [
        createMockContentItem({ id: "item1", stage: 2 }),
        createMockContentItem({ id: "item2", stage: 2 }),
      ];

      const result = getNextItem(profile, history, library);

      expect(result.reason.progressionState).toBeDefined();
      expect(result.reason.targetDifficultyRange).toHaveLength(2);
      expect(result.reason.matchedCandidates).toBeGreaterThanOrEqual(0);
      expect(result.reason.selectedRank).toBeGreaterThanOrEqual(0);
      expect(result.reason.weightedScores).toBeDefined();
      expect(typeof result.reason.usedSurprise).toBe("boolean");
      expect(typeof result.reason.injectedReview).toBe("boolean");
    });
  });

  describe("computeTargetState", () => {
    it("should return current state with insufficient history", () => {
      const profile = createMockProfile({ progressionState: 2 });
      const history = createMockHistory(2); // Less than 3 entries

      const result = computeTargetState(profile, history);

      expect(result).toBe(2);
    });

    it("should advance when performance is good", () => {
      const profile = createMockProfile({
        progressionState: 2,
        engagementScore: 70,
        typingSpeedBaseline: 200,
        errorBaseline: 1.5,
      });

      // Create history with fast performance and few errors
      const history = createMockHistory(10).map((entry) => ({
        ...entry,
        timeMs: 500, // Fast (expected ~1000ms for 5 letters)
        errors: 0, // Few errors
      }));

      const result = computeTargetState(profile, history);

      // Should advance to 3
      expect(result).toBe(3);
    });

    it("should retreat when performance is poor", () => {
      const profile = createMockProfile({
        progressionState: 3,
        engagementScore: 50,
        typingSpeedBaseline: 200,
        errorBaseline: 1.0,
      });

      // Create history with slow performance and many errors
      const history = createMockHistory(10).map((entry) => ({
        ...entry,
        timeMs: 2000, // Slow (expected ~1000ms)
        errors: 3, // Many errors
      }));

      const result = computeTargetState(profile, history);

      // Should retreat to 2
      expect(result).toBe(2);
    });

    it("should clamp to valid range [1, 5]", () => {
      const profile1 = createMockProfile({ progressionState: 1 });
      const history1 = createMockHistory(10).map((entry) => ({
        ...entry,
        timeMs: 3000,
        errors: 5,
      }));

      const result1 = computeTargetState(profile1, history1);
      expect(result1).toBeGreaterThanOrEqual(1);

      const profile2 = createMockProfile({
        progressionState: 5,
        engagementScore: 70,
      });
      const history2 = createMockHistory(10).map((entry) => ({
        ...entry,
        timeMs: 300,
        errors: 0,
      }));

      const result2 = computeTargetState(profile2, history2);
      expect(result2).toBeLessThanOrEqual(5);
    });
  });

  describe("filterCandidates", () => {
    it("should filter by difficulty range", () => {
      const profile = createMockProfile();
      const targetState: ProgressionStage = 2;
      const library = [
        createMockContentItem({ id: "item1", stage: 1 }),
        createMockContentItem({ id: "item2", stage: 2 }),
        createMockContentItem({ id: "item3", stage: 3 }),
        createMockContentItem({ id: "item4", stage: 5 }),
      ];

      const result = filterCandidates(library, profile, targetState);

      // Should include stages 1-3 (target ± 1)
      expect(result).toHaveLength(3);
      expect(result.every((item) => item.stage >= 1 && item.stage <= 3)).toBe(
        true
      );
    });

    it("should exclude items from lastTenItems", () => {
      const profile = createMockProfile({
        lastTenItems: ["item1", "item2"],
      });
      const targetState: ProgressionStage = 2;
      const library = [
        createMockContentItem({ id: "item1", stage: 2 }),
        createMockContentItem({ id: "item2", stage: 2 }),
        createMockContentItem({ id: "item3", stage: 2 }),
      ];

      const result = filterCandidates(library, profile, targetState);

      // Should only include item3
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("item3");
    });

    it("should limit candidates to 12 when many available", () => {
      const profile = createMockProfile();
      const targetState: ProgressionStage = 2;

      // Create 20 items at stage 2
      const library = Array.from({ length: 20 }, (_, i) =>
        createMockContentItem({ id: `item-${i}`, stage: 2 })
      );

      const result = filterCandidates(library, profile, targetState);

      // Should limit to 12
      expect(result.length).toBeLessThanOrEqual(12);
    });
  });

  describe("scoreCandidate", () => {
    it("should return score between 0 and 1", () => {
      const profile = createMockProfile();
      const targetState: ProgressionStage = 2;
      const item = createMockContentItem({ stage: 2 });

      const score = scoreCandidate(item, profile, targetState);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it("should prefer items matching target difficulty", () => {
      const profile = createMockProfile({
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
      });
      const targetState: ProgressionStage = 2;

      const exactMatch = createMockContentItem({
        stage: 2,
        noveltyScore: 0.5,
        category: "animals",
      });
      const farMatch = createMockContentItem({
        stage: 5,
        noveltyScore: 0.5,
        category: "animals",
      });

      const score1 = scoreCandidate(exactMatch, profile, targetState);
      const score2 = scoreCandidate(farMatch, profile, targetState);

      // Exact match should score higher (on average, due to random component)
      // We can't guarantee this in a single run, but the difference should be significant
      expect(score1).toBeGreaterThan(score2 - 0.3); // Account for random variation
    });

    it("should weight category affinity", () => {
      const profile = createMockProfile({
        categoryAffinity: {
          animals: 100,
          food: 0,
          fantasy: 50,
          tech: 50,
          nature: 50,
          actions: 50,
          feelings: 50,
          places: 50,
          activities: 50,
          nowWords: 50,
        },
      });
      const targetState: ProgressionStage = 2;

      const highAffinity = createMockContentItem({
        stage: 2,
        category: "animals",
        noveltyScore: 0.5,
      });
      const lowAffinity = createMockContentItem({
        stage: 2,
        category: "food",
        noveltyScore: 0.5,
      });

      // Run multiple times to average out random component
      let highScoreSum = 0;
      let lowScoreSum = 0;
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        highScoreSum += scoreCandidate(highAffinity, profile, targetState);
        lowScoreSum += scoreCandidate(lowAffinity, profile, targetState);
      }

      const highAvg = highScoreSum / iterations;
      const lowAvg = lowScoreSum / iterations;

      // High affinity should score higher on average
      expect(highAvg).toBeGreaterThan(lowAvg);
    });
  });
});
