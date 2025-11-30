/**
 * EngagementTracker
 *
 * Simplified engagement scoring system that updates after each word.
 * Tracks learner engagement on a 0-100 scale based on speed and accuracy.
 */

import { LearnerProfile } from "../types/LearnerProfile";
import { WordResult } from "../types/index";

/**
 * Update engagement score based on word performance.
 *
 * Rules:
 * - Fast (< 0.8x baseline): +3
 * - Slow (> 1.5x baseline): -3
 * - Perfect (0 errors): +4
 * - Many errors (>= 3): -4
 * - Score clamped to 0-100
 *
 * @param profile - Learner profile with current engagement score and baselines
 * @param wordResult - Result of word attempt including time and errors
 * @returns Updated engagement score (0-100)
 */
export function updateEngagementScore(
  profile: LearnerProfile,
  wordResult: WordResult
): number {
  const currentScore = profile.engagementScore;
  const timeMs = wordResult.timeToComplete;
  const baseline = profile.typingSpeedBaseline * wordResult.wordLength;
  const errors = wordResult.wrongKeyPresses;

  let delta = 0;

  // Speed comparison
  if (timeMs < baseline * 0.8) {
    delta += 3; // Much faster
  } else if (timeMs > baseline * 1.5) {
    delta -= 3; // Much slower
  }

  // Error comparison
  if (errors === 0) {
    delta += 4; // Perfect
  } else if (errors >= 3) {
    delta -= 4; // Many errors
  }

  // Clamp 0-100
  return Math.max(0, Math.min(100, currentScore + delta));
}

/**
 * Categorize engagement score into levels.
 *
 * @param score - Engagement score (0-100)
 * @returns Engagement level category
 */
export function getEngagementLevel(
  score: number
): "low" | "medium" | "high" {
  if (score < 30) {
    return "low";
  } else if (score <= 70) {
    return "medium";
  } else {
    return "high";
  }
}

/**
 * Check if engagement is low enough to hold steady.
 * Used by sequencer to avoid advancing when learner is struggling.
 *
 * @param score - Engagement score (0-100)
 * @returns True if score < 30 (engagement recovery mode)
 */
export function shouldHoldSteady(score: number): boolean {
  return score < 30;
}

/**
 * Check if engagement is high enough to advance.
 * Used by sequencer to allow upward progression.
 *
 * @param score - Engagement score (0-100)
 * @returns True if score > 60 (ready for progression)
 */
export function shouldAdvance(score: number): boolean {
  return score > 60;
}
