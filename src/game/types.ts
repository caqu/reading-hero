/**
 * Game Mode Types
 *
 * This module defines the core abstractions for the three game modes:
 * - Single Word: Type one target word
 * - Word Pair: Type an adjective+noun or verb+noun phrase
 * - Mini Sentence: Type a short 3-5 word sentence
 */

/**
 * Game mode identifier
 */
export type GameModeId = "single" | "pair" | "sentence";

/**
 * A game item represents a single unit of gameplay across all modes.
 * It wraps the content to be typed with metadata for tracking and display.
 */
export interface GameItem {
  /** Unique instance ID for this game item */
  id: string;

  /** What is displayed to the user (may include formatting hints) */
  displayText: string;

  /** What the user must type (normalized) */
  targetText: string;

  /** Associated word IDs from the WordBank (for stats/mastery tracking) */
  wordIds: string[];

  /** Which game mode this item belongs to */
  mode: GameModeId;

  /** Optional emoji for visual representation */
  emoji?: string;

  /** Optional sign video URL */
  signVideoUrl?: string;

  /** Optional sign video WebM URL */
  signVideoWebmUrl?: string;

  /** Optional image URL */
  imageUrl?: string;
}

/**
 * Statistics for a completed game item
 */
export interface GameItemStats {
  /** The game item that was completed */
  gameItem: GameItem;

  /** Total time spent on this item (ms) */
  durationMs: number;

  /** Number of correct key presses */
  correctKeys: number;

  /** Number of wrong key presses */
  wrongKeys: number;

  /** Whether the item was completed on first try (no wrong keys) */
  firstTryCorrect: boolean;

  /** Timestamp when completed */
  completedAt: number;
}

/**
 * Callback when a game item is completed
 */
export type OnGameItemComplete = (stats: GameItemStats) => void;

/**
 * Configuration for game mode behavior
 */
export interface GameModeConfig {
  /** Whether to show the word text immediately */
  showWordText?: boolean;

  /** Whether to play letter sounds */
  playLetterSounds?: boolean;

  /** Whether to play whole-word sound on completion */
  playWordSound?: boolean;

  /** Whether to show sign video */
  showSignVideo?: boolean;

  /** Minimum time to celebrate success (ms) */
  celebrationDurationMs?: number;
}
