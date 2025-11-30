/**
 * LearnerProfile Schema
 *
 * Single source of truth for adaptive sequencing.
 * Stores learner's progression state, performance metrics, interests, and SR bins.
 * Persisted in localStorage.
 */

import { Category, ProgressionStage } from "./ContentItem";

export interface LearnerProfile {
  id: string;
  name: string;
  createdAt: number;

  // --- Current adaptive position ---
  progressionState: ProgressionStage;  // 1–5
  engagementScore: number;             // 0–100

  // --- Baselines (updated every word) ---
  typingSpeedBaseline: number;         // ms per letter
  errorBaseline: number;               // avg errors per word

  // --- Category affinity (interests) ---
  categoryAffinity: Record<Category, number>; // 0–100

  // --- Motor-learning metrics ---
  motor: {
    leftHandErrors: number;
    rightHandErrors: number;
    rowTransitionSpeed: number; // ms
    commonLetterErrors: Record<string, number>;
  };

  // --- Spaced Repetition (SR-lite) ---
  spacedRepetition: {
    A: string[]; // new
    B: string[]; // learning
    C: string[]; // mastered
  };

  // --- Recent history references ---
  lastTenItems: string[];   // last 10 item IDs
  totalCompleted: number;   // word/phrase/sentence count
}
