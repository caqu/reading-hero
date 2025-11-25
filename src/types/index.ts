// src/types/index.ts

/**
 * Difficulty level for words
 */
export type Difficulty = "easy" | "medium" | "hard";

/**
 * Represents a word in the game
 */
export interface Word {
  /** Unique identifier for the word */
  id: string;
  /** The actual word text to be typed */
  text: string;
  /** URL to the image representing the word */
  imageUrl?: string;
  /** URL to the sign language image for the word */
  signImageUrl?: string;
  /** URL to the sign language video (MP4 format) */
  signVideoUrl?: string;
  /** URL to the sign language video (WebM format) */
  signVideoWebmUrl?: string;
  /** URL to the sign language video thumbnail */
  signThumbnailUrl?: string;
  /** Difficulty level of the word */
  difficulty?: Difficulty;
  /** Emoji character for emoji-based words */
  emoji?: string;
  /** CLDR short name description for the emoji */
  emojiDescription?: string;
}

/**
 * Represents the state of the game
 */
export interface GameState {
  /** List of words in the game */
  words: Word[];
  /** Index of the current word being typed */
  currentWordIndex: number;
  /** Index of the current letter being typed within the word */
  currentLetterIndex: number;
  /** Whether the game has been completed */
  isComplete: boolean;
  /** Number of correct attempts */
  correctAttempts: number;
  /** Number of incorrect attempts */
  incorrectAttempts: number;
  /** Total number of keystrokes */
  totalAttempts: number;
}

/**
 * Actions that can be performed on the game state
 */
export interface GameActions {
  /** Handle a key press event */
  handleKeyPress: (key: string) => boolean;
  /** Move to the next word */
  nextWord: () => void;
  /** Reset the game to initial state */
  resetGame: () => void;
}

/**
 * Combined return type for the useGameState hook
 */
export interface UseGameState extends GameState, GameActions {
  /** The current word being typed */
  currentWord: Word | null;
  /** The expected letter at the current position */
  currentLetter: string | null;
}
