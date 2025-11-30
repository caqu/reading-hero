/**
 * AdaptiveSequencer.example.ts
 *
 * Demonstrates the adaptive sequencer in action with a realistic scenario.
 */

import { getNextItem } from "./AdaptiveSequencer";
import { ContentItem, ProgressionStage, Category } from "../types/ContentItem";
import { LearnerProfile } from "../types/LearnerProfile";
import { HistoryEntry } from "../types/HistoryEntry";

// =============================================================================
// SAMPLE DATA
// =============================================================================

/**
 * Create a sample content library with diverse items
 */
function createSampleLibrary(): ContentItem[] {
  return [
    // Stage 1: Simple words
    {
      id: "word-cat",
      text: "cat",
      type: "word",
      stage: 1,
      category: "animals",
      syllables: 1,
      letterCount: 3,
      orthographicComplexity: 1,
      emoji: "🐱",
      hasImage: true,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.3,
      concretenessScore: 0.95,
    },
    {
      id: "word-dog",
      text: "dog",
      type: "word",
      stage: 1,
      category: "animals",
      syllables: 1,
      letterCount: 3,
      orthographicComplexity: 1,
      emoji: "🐶",
      hasImage: true,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.3,
      concretenessScore: 0.95,
    },
    {
      id: "word-sun",
      text: "sun",
      type: "word",
      stage: 1,
      category: "nature",
      syllables: 1,
      letterCount: 3,
      orthographicComplexity: 1,
      emoji: "☀️",
      hasImage: true,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.2,
      concretenessScore: 0.9,
    },

    // Stage 2: Growing words
    {
      id: "word-tree",
      text: "tree",
      type: "word",
      stage: 2,
      category: "nature",
      syllables: 1,
      letterCount: 4,
      orthographicComplexity: 2,
      emoji: "🌳",
      hasImage: true,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.4,
      concretenessScore: 0.9,
    },
    {
      id: "word-frog",
      text: "frog",
      type: "word",
      stage: 2,
      category: "animals",
      syllables: 1,
      letterCount: 4,
      orthographicComplexity: 2,
      emoji: "🐸",
      hasImage: true,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.5,
      concretenessScore: 0.9,
    },
    {
      id: "word-jump",
      text: "jump",
      type: "word",
      stage: 2,
      category: "actions",
      syllables: 1,
      letterCount: 4,
      orthographicComplexity: 2,
      emoji: "🦘",
      hasImage: true,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.6,
      concretenessScore: 0.7,
    },

    // Stage 3: Sight words
    {
      id: "word-the",
      text: "the",
      type: "word",
      stage: 3,
      category: "nowWords",
      syllables: 1,
      letterCount: 3,
      orthographicComplexity: 1,
      hasImage: false,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.1,
      concretenessScore: 0.2,
    },
    {
      id: "word-look",
      text: "look",
      type: "word",
      stage: 3,
      category: "actions",
      syllables: 1,
      letterCount: 4,
      orthographicComplexity: 2,
      emoji: "👀",
      hasImage: true,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.4,
      concretenessScore: 0.6,
    },

    // Stage 4: Phrases
    {
      id: "phrase-big-cat",
      text: "big cat",
      type: "phrase",
      stage: 4,
      category: "animals",
      syllables: 2,
      letterCount: 7,
      orthographicComplexity: 2,
      emoji: "🐱",
      hasImage: true,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.5,
      concretenessScore: 0.9,
    },
    {
      id: "phrase-red-car",
      text: "red car",
      type: "phrase",
      stage: 4,
      category: "places",
      syllables: 2,
      letterCount: 7,
      orthographicComplexity: 2,
      emoji: "🚗",
      hasImage: true,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.6,
      concretenessScore: 0.85,
    },

    // Stage 5: Micro sentences
    {
      id: "sentence-cat-is-happy",
      text: "The cat is happy",
      type: "sentence",
      stage: 5,
      category: "feelings",
      syllables: 5,
      letterCount: 16,
      orthographicComplexity: 2,
      emoji: "😊",
      hasImage: true,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.7,
      concretenessScore: 0.6,
    },

    // Fun/silly items
    {
      id: "word-pizza",
      text: "pizza",
      type: "word",
      stage: 2,
      category: "food",
      syllables: 2,
      letterCount: 5,
      orthographicComplexity: 2,
      emoji: "🍕",
      hasImage: true,
      hasASL: true,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.9, // High novelty for fun injection
      concretenessScore: 0.95,
    },
    {
      id: "word-unicorn",
      text: "unicorn",
      type: "word",
      stage: 3,
      category: "fantasy",
      syllables: 3,
      letterCount: 7,
      orthographicComplexity: 3,
      emoji: "🦄",
      hasImage: true,
      hasASL: false,
      hasSpanish: true,
      srBin: "A",
      noveltyScore: 0.95, // Very high novelty
      concretenessScore: 0.8,
    },
  ];
}

/**
 * Create a sample learner profile
 */
function createSampleProfile(): LearnerProfile {
  return {
    id: "learner-demo-001",
    name: "Sam",
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
    progressionState: 2, // Growing words stage
    engagementScore: 65, // Good engagement
    typingSpeedBaseline: 180, // ms per letter
    errorBaseline: 0.8, // avg errors per word
    categoryAffinity: {
      animals: 90, // Loves animals
      food: 70,
      fantasy: 60,
      tech: 30,
      nature: 80,
      actions: 50,
      feelings: 40,
      places: 55,
      activities: 65,
      nowWords: 45,
    },
    motor: {
      leftHandErrors: 3,
      rightHandErrors: 5,
      rowTransitionSpeed: 200,
      commonLetterErrors: {
        t: 2,
        r: 1,
        y: 3,
      },
    },
    spacedRepetition: {
      A: ["word-sun", "word-the", "word-pizza"],
      B: ["word-cat", "word-dog"],
      C: ["word-tree"],
    },
    lastTenItems: ["word-cat", "word-dog", "word-tree"],
    totalCompleted: 45,
  };
}

/**
 * Create sample history entries
 */
function createSampleHistory(): HistoryEntry[] {
  const history: HistoryEntry[] = [];

  // Recent 10 entries showing good performance
  for (let i = 0; i < 10; i++) {
    history.push({
      id: `entry-${i}`,
      timestamp: Date.now() - (10 - i) * 60 * 1000, // Last 10 minutes
      itemId: `item-${i}`,
      stage: 2,
      timeMs: 800 + Math.random() * 200, // Fast typing (avg 900ms)
      errors: Math.floor(Math.random() * 2), // 0-1 errors
      firstTryCorrect: Math.random() > 0.3,
      motorSnapshot: {
        leftHandErrors: 1,
        rightHandErrors: 2,
        rowTransitions: 3,
        letterErrors: { t: 1 },
      },
      engagementBefore: 60,
      engagementAfter: 65,
      srBefore: "A",
      srAfter: "B",
    });
  }

  return history;
}

// =============================================================================
// DEMO SCENARIOS
// =============================================================================

/**
 * Scenario 1: Normal progression
 */
function demoNormalProgression() {
  console.log("\n=== SCENARIO 1: Normal Progression ===");
  console.log("Learner performing well, should advance gradually\n");

  const profile = createSampleProfile();
  const history = createSampleHistory();
  const library = createSampleLibrary();

  const result = getNextItem(profile, history, library);

  console.log("Selected Item:", {
    id: result.item.id,
    text: result.item.text,
    stage: result.item.stage,
    category: result.item.category,
  });

  console.log("\nReasoning:", {
    progressionState: result.reason.progressionState,
    targetDifficultyRange: result.reason.targetDifficultyRange,
    matchedCandidates: result.reason.matchedCandidates,
    selectedRank: result.reason.selectedRank,
    injectedReview: result.reason.injectedReview,
    usedSurprise: result.reason.usedSurprise,
  });

  console.log("\nTop Scores:");
  const sortedScores = Object.entries(result.reason.weightedScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  sortedScores.forEach(([itemId, score]) => {
    const item = library.find((i) => i.id === itemId);
    console.log(`  ${itemId}: ${score.toFixed(3)} - ${item?.text}`);
  });
}

/**
 * Scenario 2: Low engagement
 */
function demoLowEngagement() {
  console.log("\n\n=== SCENARIO 2: Low Engagement ===");
  console.log("Learner struggling, should hold steady or retreat\n");

  const profile = createSampleProfile();
  profile.engagementScore = 25; // Low engagement
  profile.progressionState = 3; // At stage 3

  // Poor performance history
  const history = createSampleHistory().map((entry) => ({
    ...entry,
    timeMs: 2000, // Very slow
    errors: 4, // Many errors
    engagementAfter: 25,
  }));

  const library = createSampleLibrary();

  const result = getNextItem(profile, history, library);

  console.log("Selected Item:", {
    id: result.item.id,
    text: result.item.text,
    stage: result.item.stage,
    category: result.item.category,
  });

  console.log("\nReasoning:", {
    progressionState: result.reason.progressionState,
    targetDifficultyRange: result.reason.targetDifficultyRange,
    matchedCandidates: result.reason.matchedCandidates,
    note: "Should target easier items due to low engagement",
  });
}

/**
 * Scenario 3: Category affinity
 */
function demoCategoryAffinity() {
  console.log("\n\n=== SCENARIO 3: Category Affinity ===");
  console.log("Learner loves animals, should prefer animal content\n");

  const profile = createSampleProfile();
  profile.categoryAffinity.animals = 100; // Maxed out
  profile.categoryAffinity.food = 20; // Low interest
  profile.lastTenItems = []; // Clear recency filter

  const history = createSampleHistory();
  const library = createSampleLibrary();

  const result = getNextItem(profile, history, library);

  console.log("Selected Item:", {
    id: result.item.id,
    text: result.item.text,
    stage: result.item.stage,
    category: result.item.category,
    emoji: result.item.emoji,
  });

  console.log("\nCategory Affinities:");
  console.log("  Animals: 100 (HIGH)");
  console.log("  Food: 20 (LOW)");
  console.log("  Nature: 80 (HIGH)");

  console.log("\nExpectation: Should favor animal or nature content");
}

/**
 * Scenario 4: Multiple selections
 */
function demoMultipleSelections() {
  console.log("\n\n=== SCENARIO 4: Multiple Selections ===");
  console.log("Simulate 10 consecutive selections\n");

  const profile = createSampleProfile();
  const history = createSampleHistory();
  const library = createSampleLibrary();

  console.log("Sequence:");
  for (let i = 0; i < 10; i++) {
    const result = getNextItem(profile, history, library);

    console.log(
      `  ${i + 1}. ${result.item.text.padEnd(20)} (stage ${result.item.stage}, ${
        result.item.category
      }) ${result.reason.injectedReview ? "[REVIEW]" : ""} ${
        result.reason.usedSurprise ? "[FUN!]" : ""
      }`
    );

    // Update profile as if item was completed
    profile.lastTenItems = [result.item.id, ...profile.lastTenItems].slice(
      0,
      10
    );
    profile.totalCompleted++;
  }

  console.log("\nNote: Observe variety and progression logic");
}

// =============================================================================
// RUN DEMOS
// =============================================================================

// Run demos when file is executed directly
console.log("╔═══════════════════════════════════════════════════════════╗");
console.log("║        ADAPTIVE SEQUENCER DEMONSTRATION                  ║");
console.log("╚═══════════════════════════════════════════════════════════╝");

demoNormalProgression();
demoLowEngagement();
demoCategoryAffinity();
demoMultipleSelections();

console.log("\n\n✓ All demo scenarios completed successfully");
