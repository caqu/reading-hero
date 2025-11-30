// src/types/index.ts

/**
 * Difficulty level for words
 */
export type Difficulty = "easy" | "medium" | "hard";

/**
 * Source of the word - built-in or user-generated
 */
export type WordSource = "builtin" | "user";

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
  /** Syllable divisions with dashes (e.g., 'mon-key') */
  syllables?: string;
  /** Segment divisions with dots (e.g., 'mon·key') */
  segments?: string;
  /** Source of the word - builtin or user-generated */
  source?: WordSource;
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
  /** Set the current word by its ID */
  setWordById: (wordId: string) => boolean;
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

/**
 * Level type for adaptive difficulty system (1-5)
 */
export type Level = 1 | 2 | 3 | 4 | 5;

/**
 * Word result for leveling engine
 */
export interface WordResult {
  wordId: string;
  correct: boolean;
  wrongKeyPresses: number;
  firstTryCorrect: boolean;
  timeToComplete: number;
  wordLength: number;
}

/**
 * Leveling engine state stored per profile
 */
export interface ProfileLevelingState {
  /** Current level (1-5) */
  currentLevel: Level;
  /** Word completion history for performance tracking */
  wordHistory: WordResult[];
  /** Number of words completed when current level started */
  levelStartWordCount: number;
  /** Set of unique word IDs completed (for Level 2 criteria) */
  uniqueWordsCompleted: string[];
}

/**
 * Represents a user profile in the multi-profile system
 */
export interface Profile {
  /** Unique identifier for the profile (UUID or timestamp) */
  id: string;
  /** Display name for the profile */
  name: string;
  /** Emoji avatar for the profile */
  avatar: string;
  /** Current level (from leveling engine) */
  level: number;
  /** ID of the last word the user was working on */
  lastWordId: string | null;
  /** Performance statistics */
  stats: ProfileStats;
  /** Leveling engine state */
  levelingState: ProfileLevelingState;
  /** Timestamp when the profile was created */
  createdAt: number;
  /** Timestamp when the profile was last updated */
  updatedAt: number;
}

/**
 * Statistics tracked per profile
 */
export interface ProfileStats {
  /** Total accuracy percentage */
  accuracy: number;
  /** Total words completed */
  wordsCompleted: number;
  /** Total correct attempts */
  correctAttempts: number;
  /** Total incorrect attempts */
  incorrectAttempts: number;
  /** Total keystrokes */
  totalKeystrokes: number;
}

/**
 * Container for all profiles and active profile ID
 */
export interface ProfilesData {
  /** Array of all profiles */
  profiles: Profile[];
  /** ID of the currently active profile */
  activeProfileId: string | null;
}

/**
 * Generic content item used for curated word lists and assets
 */
export interface ContentItem {
  id: string;
  text: string;
  type?: "word" | string;
  stage?: number;
  category?: string;
  emoji?: string;
  syllables?: number;
  letterCount?: number;
  orthographicComplexity?: number;
  noveltyScore?: number;
  concretenessScore?: number;
  spanish?: {
    text?: string;
    voiceGender?: "female" | "male" | string;
  };
  asl?: {
    placeholderId?: string;
    hasVideo?: boolean;
  };
  hasImage?: boolean;
  hasASL?: boolean;
  hasSpanish?: boolean;
  srBin?: string;
}
