/**
 * Game Module Exports
 *
 * Central export point for all game-related modules and types.
 */

// Core types
export type {
  GameModeId,
  GameItem,
  GameItemStats,
  OnGameItemComplete,
  GameModeConfig,
} from './types';

// Single Word Game
export {
  useSingleWordGame,
  wordToGameItem,
} from './modes/SingleWordGame';
export type {
  SingleWordGameProps,
  SingleWordGameState,
} from './modes/SingleWordGame';

// Word Pair Game
export {
  useWordPairGame,
} from './modes/WordPairGame';
export type {
  WordPairGameProps,
  WordPairGameState,
} from './modes/WordPairGame';

// Mini Sentence Game
export {
  useMiniSentenceGame,
  getRandomSentence,
  getSentencesByCategory,
  SEED_SENTENCES,
} from './modes/MiniSentenceGame';
export type {
  MiniSentence,
  MiniSentenceGameProps,
  MiniSentenceGameState,
} from './modes/MiniSentenceGame';

// Game Runner
export {
  useGameRunner,
  getModeName,
  getModeDescription,
} from './GameRunner';
export type {
  GameRunnerProps,
} from './GameRunner';
