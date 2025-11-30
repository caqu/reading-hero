/**
 * HistoryEntry Schema
 *
 * Logged after every word/phrase/sentence completion.
 * Used to track performance trends, motor learning, and engagement.
 * Stored in a rolling window (last 100 entries).
 */

import { ProgressionStage } from "./ContentItem";

export interface HistoryEntry {
  id: string;                 // entry ID
  timestamp: number;

  // What was shown:
  itemId: string;
  stage: ProgressionStage;

  // Performance:
  timeMs: number;
  errors: number;
  firstTryCorrect: boolean;

  // Motor:
  motorSnapshot: {
    leftHandErrors: number;
    rightHandErrors: number;
    rowTransitions: number;
    letterErrors: Record<string, number>;
  };

  // Engagement:
  engagementBefore: number;
  engagementAfter: number;

  // Spaced repetition:
  srBefore: "A" | "B" | "C";
  srAfter: "A" | "B" | "C";
}
