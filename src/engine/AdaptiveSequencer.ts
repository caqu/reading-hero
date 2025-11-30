/**
 * AdaptiveSequencer.ts
 *
 * Main adaptive sequencer that selects the next content item.
 * This is a PURE FUNCTION with no side effects.
 *
 * Algorithm:
 * 1. Compute target difficulty state (1-5) based on recent performance
 * 2. Build candidate pool (5-12 items) by filtering content library
 * 3. Score candidates with weighted ranking (40% difficulty, 30% category, 20% novelty, 10% random)
 * 4. Check for fun injection (every ~7 items, 10% chance)
 * 5. Check for SR review injection
 * 6. Select from top 3 candidates with slight randomness
 */

import { ContentItem, ProgressionStage } from "../types/ContentItem";
import { LearnerProfile } from "../types/LearnerProfile";
import { HistoryEntry } from "../types/HistoryEntry";
import { SequencerOutput } from "../types/Sequencer";

import { getProgressionStage } from "./ContentClassifier";
import { shouldInjectReview, selectReviewItem } from "./SpacedRepetitionLite";
import { shouldHoldSteady, shouldAdvance } from "./EngagementTracker";

// =============================================================================
// MAIN SEQUENCER FUNCTION
// =============================================================================

/**
 * Select the next content item for the learner.
 *
 * @param profile - Current learner profile
 * @param history - Recent history entries (used for performance analysis)
 * @param contentLibrary - All available content items
 * @returns Next item to present + reasoning trace
 */
export function getNextItem(
  profile: LearnerProfile,
  history: HistoryEntry[],
  contentLibrary: ContentItem[]
): SequencerOutput {
  // Edge case: empty library
  if (contentLibrary.length === 0) {
    throw new Error("Content library is empty - cannot select next item");
  }

  // Step 1: Compute target difficulty state
  const targetState = computeTargetState(profile, history);

  // Step 2: Check for SR review injection
  const shouldReview = shouldInjectReview(profile);
  if (shouldReview) {
    const reviewItem = selectReviewItem(profile, contentLibrary);
    if (reviewItem) {
      // Successfully injected review
      return {
        item: reviewItem,
        reason: {
          progressionState: targetState,
          targetDifficultyRange: [targetState - 1, targetState + 1],
          matchedCandidates: 1,
          selectedRank: 1,
          weightedScores: { [reviewItem.id]: 1.0 },
          usedSurprise: false,
          injectedReview: true,
        },
      };
    }
    // If no review item available, fall through to normal selection
  }

  // Step 3: Check for fun injection
  const shouldInjectFun = shouldInjectFunItem(profile.totalCompleted);
  if (shouldInjectFun) {
    const funItem = selectFunItem(contentLibrary, profile);
    if (funItem) {
      // Successfully injected fun item
      return {
        item: funItem,
        reason: {
          progressionState: targetState,
          targetDifficultyRange: [targetState - 1, targetState + 1],
          matchedCandidates: 1,
          selectedRank: 1,
          weightedScores: { [funItem.id]: 1.0 },
          usedSurprise: true,
          injectedReview: false,
        },
      };
    }
    // If no fun item available, fall through to normal selection
  }

  // Step 4: Build candidate pool
  const candidates = filterCandidates(contentLibrary, profile, targetState);

  // Edge case: no candidates found
  if (candidates.length === 0) {
    // Fallback: select any item not in lastTenItems
    const fallbackItems = contentLibrary.filter(
      (item) => !profile.lastTenItems.includes(item.id)
    );

    if (fallbackItems.length === 0) {
      // Last resort: just return first item
      const firstItem = contentLibrary[0];
      if (!firstItem) {
        throw new Error("Content library is empty");
      }
      return {
        item: firstItem,
        reason: {
          progressionState: targetState,
          targetDifficultyRange: [targetState - 1, targetState + 1],
          matchedCandidates: 0,
          selectedRank: 0,
          weightedScores: {},
          usedSurprise: false,
          injectedReview: false,
        },
      };
    }

    // Return random fallback item
    const fallbackItem =
      fallbackItems[Math.floor(Math.random() * fallbackItems.length)];
    if (!fallbackItem) {
      throw new Error("Fallback item selection failed");
    }
    return {
      item: fallbackItem,
      reason: {
        progressionState: targetState,
        targetDifficultyRange: [targetState - 1, targetState + 1],
        matchedCandidates: 0,
        selectedRank: 0,
        weightedScores: { [fallbackItem.id]: 0.5 },
        usedSurprise: false,
        injectedReview: false,
      },
    };
  }

  // Step 5: Score all candidates
  const scoredCandidates = candidates.map((item) => ({
    item,
    score: scoreCandidate(item, profile, targetState),
  }));

  // Step 6: Sort by score (descending)
  scoredCandidates.sort((a, b) => b.score - a.score);

  // Step 7: Select from top 3 with slight randomness
  const topCandidates = scoredCandidates.slice(0, 3);
  const selectedCandidate =
    topCandidates[Math.floor(Math.random() * topCandidates.length)];

  if (!selectedCandidate) {
    throw new Error("Failed to select candidate from top candidates");
  }

  // Find rank of selected item
  const selectedRank =
    scoredCandidates.findIndex(
      (sc) => sc.item.id === selectedCandidate.item.id
    ) + 1;

  // Build weighted scores map
  const weightedScores: Record<string, number> = {};
  for (const sc of scoredCandidates) {
    weightedScores[sc.item.id] = sc.score;
  }

  return {
    item: selectedCandidate.item,
    reason: {
      progressionState: targetState,
      targetDifficultyRange: [targetState - 1, targetState + 1],
      matchedCandidates: candidates.length,
      selectedRank,
      weightedScores,
      usedSurprise: false,
      injectedReview: false,
    },
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Compute target difficulty state based on recent performance.
 *
 * Rules:
 * - If fast + few errors → shift up 1
 * - If slow + many errors → shift down 1
 * - If engagement low (<30) → hold steady
 * - If engagement high (>60) → allow advancement
 * - Else → stay at current state
 * - Clamp within [1, 5]
 *
 * @param profile - Learner profile
 * @param history - Recent history entries
 * @returns Target progression state (1-5)
 */
function computeTargetState(
  profile: LearnerProfile,
  history: HistoryEntry[]
): ProgressionStage {
  const currentState = profile.progressionState;

  // Check engagement
  if (shouldHoldSteady(profile.engagementScore)) {
    // Low engagement - hold steady or go down
    return Math.max(1, currentState - 1) as ProgressionStage;
  }

  // Analyze recent 10 entries
  const recentEntries = history.slice(-10);
  if (recentEntries.length < 3) {
    // Not enough data - stay at current state
    return currentState;
  }

  // Calculate average speed vs baseline
  const avgSpeed =
    recentEntries.reduce((sum, entry) => sum + entry.timeMs, 0) /
    recentEntries.length;

  // Estimate expected time based on baseline
  // Rough estimate: assume average word length of 5 letters
  const expectedTime = profile.typingSpeedBaseline * 5;

  // Calculate average errors
  const avgErrors =
    recentEntries.reduce((sum, entry) => sum + entry.errors, 0) /
    recentEntries.length;

  // Determine shift direction
  const isFast = avgSpeed < expectedTime * 0.8;
  const isSlow = avgSpeed > expectedTime * 1.5;
  const fewErrors = avgErrors < profile.errorBaseline * 0.7;
  const manyErrors = avgErrors > profile.errorBaseline * 1.5;

  // Decision logic
  if (isFast && fewErrors && shouldAdvance(profile.engagementScore)) {
    // Advance one stage
    return Math.min(5, currentState + 1) as ProgressionStage;
  } else if (isSlow && manyErrors) {
    // Drop one stage
    return Math.max(1, currentState - 1) as ProgressionStage;
  }

  // Stay at current state
  return currentState;
}

/**
 * Filter content library to build candidate pool.
 *
 * Filters:
 * - Target difficulty state ± 1
 * - Exclude items in lastTenItems
 * - Prefer items matching category affinity
 *
 * Aim for 5-12 candidates.
 *
 * @param library - All content items
 * @param profile - Learner profile
 * @param targetState - Target progression state
 * @returns Filtered candidate items
 */
function filterCandidates(
  library: ContentItem[],
  profile: LearnerProfile,
  targetState: ProgressionStage
): ContentItem[] {
  const minStage = Math.max(1, targetState - 1);
  const maxStage = Math.min(5, targetState + 1);

  // Filter by difficulty range and recency
  const candidates = library.filter((item) => {
    // Check stage range - use item's stage property directly
    if (item.stage < minStage || item.stage > maxStage) {
      return false;
    }

    // Exclude recent items
    if (profile.lastTenItems.includes(item.id)) {
      return false;
    }

    return true;
  });

  // If we have too many candidates, narrow by category affinity
  if (candidates.length > 12) {
    // Sort by category affinity and take top 12
    const sortedByCategoryAffinity = candidates.sort((a, b) => {
      const affinityA = profile.categoryAffinity[a.category] || 50;
      const affinityB = profile.categoryAffinity[b.category] || 50;
      return affinityB - affinityA;
    });
    return sortedByCategoryAffinity.slice(0, 12);
  }

  return candidates;
}

/**
 * Score a candidate item using weighted ranking.
 *
 * Weights:
 * - 40% difficulty match
 * - 30% category affinity
 * - 20% novelty score
 * - 10% random variation
 *
 * @param item - Candidate item
 * @param profile - Learner profile
 * @param targetState - Target progression state
 * @returns Weighted score (0-1)
 */
function scoreCandidate(
  item: ContentItem,
  profile: LearnerProfile,
  targetState: ProgressionStage
): number {
  // 1. Difficulty match (40%)
  // Use item's stage property directly (already classified)
  const stageDiff = Math.abs(item.stage - targetState);
  const difficultyMatch = 1 - stageDiff / 5; // 0-1 scale

  // 2. Category affinity (30%)
  const categoryAffinity = (profile.categoryAffinity[item.category] || 50) / 100;

  // 3. Novelty score (20%)
  const noveltyScore = item.noveltyScore;

  // 4. Random variation (10%)
  const randomScore = Math.random();

  // Weighted sum
  const score =
    difficultyMatch * 0.4 +
    categoryAffinity * 0.3 +
    noveltyScore * 0.2 +
    randomScore * 0.1;

  return score;
}

/**
 * Check if a fun item should be injected.
 *
 * Every ~7 items, 10% chance to inject a fun/silly item.
 *
 * @param itemCount - Total items completed
 * @returns True if fun item should be injected
 */
function shouldInjectFunItem(itemCount: number): boolean {
  // Check if we're at a ~7 item interval
  const interval = 7;
  if (itemCount % interval !== 0) {
    return false;
  }

  // 10% chance
  return Math.random() < 0.1;
}

/**
 * Select a fun/silly item from the library.
 *
 * Prioritizes items with:
 * - High novelty score (> 0.7)
 * - Silly/fun categories (animals, fantasy)
 * - Not in lastTenItems
 *
 * @param library - All content items
 * @param profile - Learner profile
 * @returns Fun item or null if none available
 */
function selectFunItem(
  library: ContentItem[],
  profile: LearnerProfile
): ContentItem | null {
  const funCategories = new Set(["animals", "fantasy", "activities"]);

  const funItems = library.filter((item) => {
    // Not recently seen
    if (profile.lastTenItems.includes(item.id)) {
      return false;
    }

    // High novelty or fun category
    if (item.noveltyScore > 0.7 || funCategories.has(item.category)) {
      return true;
    }

    return false;
  });

  if (funItems.length === 0) {
    return null;
  }

  // Select random fun item
  const selectedFunItem = funItems[Math.floor(Math.random() * funItems.length)];
  return selectedFunItem || null;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { computeTargetState, filterCandidates, scoreCandidate, shouldInjectFunItem, selectFunItem };
