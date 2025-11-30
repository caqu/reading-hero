/**
 * ContentItem Schema
 *
 * Represents a single piece of content: word, phrase, or micro-sentence.
 * Used by the adaptive sequencer to select appropriate learning items.
 */

export type ProgressionStage =
  | 1 // simple_words
  | 2 // growing_words
  | 3 // sight_words
  | 4 // phrases
  | 5; // micro_sentences

export type Category =
  | "animals"
  | "food"
  | "fantasy"
  | "tech"
  | "nature"
  | "actions"
  | "feelings"
  | "places"
  | "activities"
  | "nowWords";

export interface ContentItem {
  id: string;             // unique internal ID
  text: string;           // display string: word, phrase, or sentence
  type: "word" | "phrase" | "sentence";

  // --- Core classification ---
  stage: ProgressionStage;
  category: Category;
  syllables: number;      // computed for words, sum for phrases
  letterCount: number;    // includes spaces only for multi-word
  orthographicComplexity: number; // 1–5 simple→complex

  // --- Multimodal support ---
  emoji?: string;         // e.g. "🐶"
  hasImage: boolean;
  hasASL: boolean;
  hasSpanish: boolean;

  // --- SR-lite bin assignment ---
  srBin: "A" | "B" | "C";

  // --- Internal sequencing usefulness ---
  noveltyScore: number;    // 0–1 (silliness, rarity, fun-factor)
  concretenessScore: number; // 0–1 (visual concreteness)
}
