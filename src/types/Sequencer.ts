/**
 * Sequencer Input/Output Schema
 *
 * Defines the interface for the adaptive sequencer as a pure function.
 * Input: profile + history + content library
 * Output: next item + reasoning trace
 */

import { ContentItem } from "./ContentItem";
import { LearnerProfile } from "./LearnerProfile";
import { HistoryEntry } from "./HistoryEntry";

export interface SequencerInput {
  profile: LearnerProfile;
  history: HistoryEntry[];
  contentLibrary: ContentItem[];
}

export interface SequencerOutput {
  item: ContentItem;
  reason: {
    progressionState: number;
    targetDifficultyRange: [number, number];
    matchedCandidates: number;
    selectedRank: number;
    weightedScores: Record<string, number>; // itemId → score
    usedSurprise: boolean;
    injectedReview: boolean;
  };
}
