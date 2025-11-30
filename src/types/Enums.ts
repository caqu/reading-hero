/**
 * Enums and Constants
 *
 * Shared constants for progression stages and categories.
 * Used for validation and human-readable stage names.
 */

export const PROGRESSION_STAGES = {
  1: "simple_words",
  2: "growing_words",
  3: "sight_words",
  4: "phrases",
  5: "micro_sentences",
} as const;

export const CATEGORIES = [
  "animals",
  "food",
  "fantasy",
  "tech",
  "nature",
  "actions",
  "feelings",
  "places",
  "activities",
  "nowWords",
] as const;
