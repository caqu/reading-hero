/**
 * Game Runner
 *
 * Orchestrates the different game modes and provides a unified interface.
 * This component:
 * - Selects the appropriate game mode
 * - Manages game state across modes
 * - Provides shared visual layout (keyboard, tiles, word card)
 * - Handles completion and progression
 */

import { useState, useEffect, useCallback } from 'react';
import { Word } from '../types';
import { GameModeId, GameItemStats, GameModeConfig } from './types';
import { useSingleWordGame } from './modes/SingleWordGame';
import { useWordPairGame } from './modes/WordPairGame';
import { useMiniSentenceGame, MiniSentence, SEED_SENTENCES, getRandomSentence } from './modes/MiniSentenceGame';

/**
 * Props for GameRunner
 */
export interface GameRunnerProps {
  /** Current game mode */
  mode: GameModeId;

  /** Words available for gameplay (used by single and pair modes) */
  words: Word[];

  /** Optional path ID (for future use with WordBank paths) */
  pathId?: string;

  /** Optional category for filtering content */
  category?: string;

  /** Game configuration */
  config?: GameModeConfig;

  /** Callback when a game item is completed */
  onItemComplete?: (stats: GameItemStats) => void;

  /** Callback when all items in session are complete */
  onSessionComplete?: () => void;

  /** Callback for key presses (for feedback effects) */
  onKeyPress?: (key: string, correct: boolean) => void;
}

/**
 * GameRunner State
 */
interface GameRunnerState {
  /** Current item index */
  currentIndex: number;

  /** Whether session is complete */
  isComplete: boolean;

  /** Mode-specific state */
  mode: GameModeId;
}

/**
 * GameRunner Component
 *
 * The main orchestrator for game modes. Handles mode switching,
 * content selection, and progression.
 */
export function useGameRunner(props: GameRunnerProps) {
  const {
    mode,
    words,
    pathId,
    category,
    config,
    onItemComplete,
    onSessionComplete,
    onKeyPress,
  } = props;

  const [state, setState] = useState<GameRunnerState>({
    currentIndex: 0,
    isComplete: false,
    mode,
  });

  // Shuffle words for variety
  const [shuffledWords] = useState(() => {
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  });

  // Select sentences for sentence mode
  const [sentences] = useState(() => {
    if (mode === 'sentence') {
      return category
        ? SEED_SENTENCES.filter(s => s.category === category)
        : SEED_SENTENCES;
    }
    return [];
  });

  // Get current content based on mode
  const getCurrentContent = useCallback(() => {
    switch (mode) {
      case 'single':
        return shuffledWords[state.currentIndex];
      case 'pair':
        return shuffledWords[state.currentIndex];
      case 'sentence':
        return sentences[state.currentIndex] || getRandomSentence(category);
      default:
        return shuffledWords[0];
    }
  }, [mode, state.currentIndex, shuffledWords, sentences, category]);

  const currentContent = getCurrentContent();

  // Single word game hook
  const singleGame = useSingleWordGame(
    mode === 'single' ? (currentContent as Word) : shuffledWords[0]!,
    config,
    onItemComplete,
    onKeyPress
  );

  // Word pair game hook
  const pairGame = useWordPairGame(
    mode === 'pair' ? (currentContent as Word) : shuffledWords[0]!,
    undefined, // Let it pick a random modifier
    category,
    config,
    onItemComplete,
    onKeyPress
  );

  // Mini sentence game hook
  const sentenceGame = useMiniSentenceGame(
    mode === 'sentence' ? (currentContent as MiniSentence) : sentences[0] || SEED_SENTENCES[0]!,
    config,
    onItemComplete,
    onKeyPress
  );

  // Get the active game based on mode
  const getActiveGame = () => {
    switch (mode) {
      case 'single':
        return singleGame;
      case 'pair':
        return pairGame;
      case 'sentence':
        return sentenceGame;
      default:
        return singleGame;
    }
  };

  const activeGame = getActiveGame();

  // Handle item completion - advance to next item
  const handleItemComplete = useCallback((stats: GameItemStats) => {
    console.log('[GameRunner] Item completed:', stats);
    onItemComplete?.(stats);

    // Advance to next item after a short delay
    setTimeout(() => {
      setState(prev => {
        const maxItems = mode === 'sentence' ? sentences.length : shuffledWords.length;
        const nextIndex = prev.currentIndex + 1;

        if (nextIndex >= maxItems) {
          // Session complete
          onSessionComplete?.();
          return {
            ...prev,
            isComplete: true,
          };
        }

        return {
          ...prev,
          currentIndex: nextIndex,
        };
      });
    }, 1500); // Give time for celebration
  }, [mode, sentences.length, shuffledWords.length, onItemComplete, onSessionComplete]);

  // Reset when mode changes
  useEffect(() => {
    setState({
      currentIndex: 0,
      isComplete: false,
      mode,
    });
  }, [mode]);

  return {
    // State
    mode,
    currentIndex: state.currentIndex,
    isComplete: state.isComplete,
    currentContent,

    // Active game state and handlers
    gameState: activeGame.state,
    handleKeyPress: activeGame.handleKeyPress,
    reset: activeGame.reset,

    // Session info
    totalItems: mode === 'sentence' ? sentences.length : shuffledWords.length,
  };
}

/**
 * Get display name for a game mode
 */
export function getModeName(mode: GameModeId): string {
  switch (mode) {
    case 'single':
      return 'Single Word';
    case 'pair':
      return 'Word Pair';
    case 'sentence':
      return 'Mini Sentence';
    default:
      return 'Unknown Mode';
  }
}

/**
 * Get description for a game mode
 */
export function getModeDescription(mode: GameModeId): string {
  switch (mode) {
    case 'single':
      return 'Type one word at a time';
    case 'pair':
      return 'Type two-word phrases like "big dog"';
    case 'sentence':
      return 'Type short 3-5 word sentences';
    default:
      return '';
  }
}
