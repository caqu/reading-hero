/**
 * Single Word Game Mode
 *
 * The core gameplay mode where users type a single target word.
 * This preserves the existing behavior with:
 * - Letter-by-letter typing
 * - Visual feedback (tiles, emoji/image)
 * - Optional TTS for letters and words
 * - Sign video support
 */

import { useState, useCallback, useEffect } from 'react';
import { Word } from '../../types';
import { GameItem, GameItemStats, OnGameItemComplete, GameModeConfig } from '../types';

/**
 * Props for SingleWordGame
 */
export interface SingleWordGameProps {
  /** The word to type */
  word: Word;

  /** Game mode configuration */
  config?: GameModeConfig;

  /** Callback when word is completed */
  onComplete?: OnGameItemComplete;

  /** Callback for each key press */
  onKeyPress?: (key: string, correct: boolean) => void;
}

/**
 * State for a single word game instance
 */
export interface SingleWordGameState {
  /** The game item being played */
  gameItem: GameItem;

  /** Current letter index */
  currentLetterIndex: number;

  /** Whether the word is complete */
  isComplete: boolean;

  /** Start time */
  startTime: number;

  /** Number of correct key presses */
  correctKeys: number;

  /** Number of wrong key presses */
  wrongKeys: number;

  /** Whether first try was correct (no wrong keys yet) */
  firstTryCorrect: boolean;
}

/**
 * Convert a Word to a GameItem
 */
export function wordToGameItem(word: Word): GameItem {
  return {
    id: `single:${word.id}`,
    displayText: word.text,
    targetText: word.text.toLowerCase(),
    wordIds: [word.id],
    mode: 'single',
    emoji: word.emoji,
    signVideoUrl: word.signVideoUrl,
    signVideoWebmUrl: word.signVideoWebmUrl,
    imageUrl: word.imageUrl,
  };
}

/**
 * SingleWordGame Hook
 *
 * Manages the state and logic for a single word typing game.
 *
 * @param word - The word to type
 * @param config - Optional configuration
 * @param onComplete - Callback when word is completed
 * @param onKeyPress - Callback for each key press
 * @returns Game state and handlers
 */
export function useSingleWordGame(
  word: Word,
  config?: GameModeConfig,
  onComplete?: OnGameItemComplete,
  onKeyPress?: (key: string, correct: boolean) => void
): {
  state: SingleWordGameState;
  handleKeyPress: (key: string) => boolean;
  reset: () => void;
} {
  const [state, setState] = useState<SingleWordGameState>(() => ({
    gameItem: wordToGameItem(word),
    currentLetterIndex: 0,
    isComplete: false,
    startTime: Date.now(),
    correctKeys: 0,
    wrongKeys: 0,
    firstTryCorrect: true,
  }));

  // Reset when word changes
  useEffect(() => {
    setState({
      gameItem: wordToGameItem(word),
      currentLetterIndex: 0,
      isComplete: false,
      startTime: Date.now(),
      correctKeys: 0,
      wrongKeys: 0,
      firstTryCorrect: true,
    });
  }, [word.id]);

  const handleKeyPress = useCallback((key: string): boolean => {
    setState(currentState => {
      if (currentState.isComplete) {
        return currentState;
      }

      const targetLetter = currentState.gameItem.targetText[currentState.currentLetterIndex];
      if (!targetLetter) {
        return currentState;
      }

      const isCorrect = key.toLowerCase() === targetLetter.toLowerCase();

      // Call parent key press handler
      onKeyPress?.(key, isCorrect);

      if (isCorrect) {
        const newLetterIndex = currentState.currentLetterIndex + 1;
        const newCorrectKeys = currentState.correctKeys + 1;
        const isNowComplete = newLetterIndex >= currentState.gameItem.targetText.length;

        const newState = {
          ...currentState,
          currentLetterIndex: newLetterIndex,
          correctKeys: newCorrectKeys,
          isComplete: isNowComplete,
        };

        // If complete, trigger completion callback
        if (isNowComplete && onComplete) {
          const stats: GameItemStats = {
            gameItem: currentState.gameItem,
            durationMs: Date.now() - currentState.startTime,
            correctKeys: newCorrectKeys,
            wrongKeys: currentState.wrongKeys,
            firstTryCorrect: currentState.firstTryCorrect,
            completedAt: Date.now(),
          };
          onComplete(stats);
        }

        return newState;
      } else {
        // Wrong key
        return {
          ...currentState,
          wrongKeys: currentState.wrongKeys + 1,
          firstTryCorrect: false,
        };
      }
    });

    return state.isComplete;
  }, [onComplete, onKeyPress, state.isComplete]);

  const reset = useCallback(() => {
    setState({
      gameItem: wordToGameItem(word),
      currentLetterIndex: 0,
      isComplete: false,
      startTime: Date.now(),
      correctKeys: 0,
      wrongKeys: 0,
      firstTryCorrect: true,
    });
  }, [word]);

  return {
    state,
    handleKeyPress,
    reset,
  };
}
