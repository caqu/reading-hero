/**
 * SpacedRepetitionLite.ts
 *
 * Simplified 3-bin spaced repetition system for Reading Hero.
 *
 * Bin Definitions:
 * - A (New): Words unseen or seen once
 * - B (Learning): Words practiced 2-4 times
 * - C (Mastered): 5+ successful repetitions
 *
 * Review injection happens every 5-12 items to reinforce learning.
 */

import type { LearnerProfile } from "../types/LearnerProfile";
import type { ContentItem } from "../types/ContentItem";

/**
 * Determines if a review item should be injected into the sequence
 *
 * @param profile - Current learner profile
 * @returns true if a review should be injected
 */
export function shouldInjectReview(profile: LearnerProfile): boolean {
  // Check if there are any items in bins B or C to review
  const hasReviewItems =
    profile.spacedRepetition.B.length > 0 ||
    profile.spacedRepetition.C.length > 0;

  if (!hasReviewItems) {
    return false;
  }

  // Calculate how many items since last review
  // We use modulo to create a cycle between 5-12 items
  const itemsSinceStart = profile.totalCompleted;

  // Inject review every 5-12 items (using a deterministic pattern)
  // We add the profile id hash to create variance between profiles
  const profileHash = profile.id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const reviewInterval = 5 + (profileHash % 8); // 5-12 range

  return itemsSinceStart % reviewInterval === 0;
}

/**
 * Selects a review item from bins B or C
 *
 * Priority: 70% from B (learning), 30% from C (mastered)
 * Avoids items in lastTenItems
 *
 * @param profile - Current learner profile
 * @param contentLibrary - Array of available content items
 * @returns Selected content item or null if none suitable
 */
export function selectReviewItem(
  profile: LearnerProfile,
  contentLibrary: ContentItem[]
): ContentItem | null {
  const { spacedRepetition, lastTenItems } = profile;

  // Filter out items that were recently seen
  const availableB = spacedRepetition.B.filter(
    (id) => !lastTenItems.includes(id)
  );
  const availableC = spacedRepetition.C.filter(
    (id) => !lastTenItems.includes(id)
  );

  // If no suitable items available
  if (availableB.length === 0 && availableC.length === 0) {
    return null;
  }

  // Determine which bin to select from (70/30 split)
  let selectedItemId: string | undefined;

  // Use random number to decide bin (70% B, 30% C)
  const shouldSelectFromB = Math.random() < 0.7;

  if (shouldSelectFromB && availableB.length > 0) {
    // Select random item from B
    selectedItemId = availableB[Math.floor(Math.random() * availableB.length)];
  } else if (availableC.length > 0) {
    // Select random item from C
    selectedItemId = availableC[Math.floor(Math.random() * availableC.length)];
  } else if (availableB.length > 0) {
    // Fallback to B if C is empty
    selectedItemId = availableB[Math.floor(Math.random() * availableB.length)];
  }

  if (!selectedItemId) {
    return null;
  }

  // Find the content item in the library
  const contentItem = contentLibrary.find((item) => item.id === selectedItemId);
  return contentItem || null;
}

/**
 * Updates the spaced repetition bin for an item after completion
 *
 * Success: A → B → C
 * Failure: Move back one bin (B → A, C → B)
 *
 * @param itemId - ID of the completed item
 * @param success - Whether the item was completed successfully
 * @param profile - Learner profile (mutated)
 */
export function updateBinAfterCompletion(
  itemId: string,
  success: boolean,
  profile: LearnerProfile
): void {
  const { spacedRepetition } = profile;

  // Get current bin
  const currentBin = getBinForItem(itemId, profile);

  // Remove item from current bin
  spacedRepetition[currentBin] = spacedRepetition[currentBin].filter(
    (id) => id !== itemId
  );

  if (success) {
    // Move forward: A → B → C
    if (currentBin === "A") {
      spacedRepetition.B.push(itemId);
    } else if (currentBin === "B") {
      spacedRepetition.C.push(itemId);
    } else {
      // Already in C, keep it there
      spacedRepetition.C.push(itemId);
    }
  } else {
    // Move backward: B → A, C → B
    if (currentBin === "A") {
      // Already in A, keep it there
      spacedRepetition.A.push(itemId);
    } else if (currentBin === "B") {
      spacedRepetition.A.push(itemId);
    } else {
      // C → B
      spacedRepetition.B.push(itemId);
    }
  }
}

/**
 * Gets the current bin for an item
 *
 * @param itemId - ID of the item
 * @param profile - Learner profile
 * @returns Current bin ("A", "B", or "C")
 */
export function getBinForItem(
  itemId: string,
  profile: LearnerProfile
): "A" | "B" | "C" {
  const { spacedRepetition } = profile;

  if (spacedRepetition.A.includes(itemId)) {
    return "A";
  } else if (spacedRepetition.B.includes(itemId)) {
    return "B";
  } else if (spacedRepetition.C.includes(itemId)) {
    return "C";
  }

  // Default to A if item not found in any bin (new item)
  return "A";
}
