// src/hooks/useGameState.ts

import { useState, useCallback, useMemo } from "react";
import type { Word, UseGameState } from "../types";

interface GameStateInternal {
  currentWordIndex: number;
  currentLetterIndex: number;
  correctAttempts: number;
  incorrectAttempts: number;
}

/**
 * Custom React hook for managing the game state and logic.
 *
 * This hook handles:
 * - Game initialization with a word list
 * - Current word and letter tracking
 * - Input validation (case-insensitive)
 * - Word progression
 * - Game reset
 * - Attempt tracking and statistics
 *
 * @param initialWords - Array of words to use in the game
 * @returns Game state and action functions
 *
 * @example
 * ```tsx
 * const game = useGameState(words);
 *
 * const handleKeyDown = (event: KeyboardEvent) => {
 *   if (event.key.length === 1) {
 *     game.handleKeyPress(event.key);
 *   }
 * };
 * ```
 */
export function useGameState(initialWords: Word[]): UseGameState {
  // Core state - use a single state object to avoid closure issues
  const [words] = useState<Word[]>(initialWords);
  const [state, setState] = useState<GameStateInternal>({
    currentWordIndex: 0,
    currentLetterIndex: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
  });

  // Computed state
  const currentWord = useMemo(() => {
    return words[state.currentWordIndex] || null;
  }, [words, state.currentWordIndex]);

  const currentLetter = useMemo(() => {
    if (!currentWord) return null;
    return currentWord.text[state.currentLetterIndex] || null;
  }, [currentWord, state.currentLetterIndex]);

  const isComplete = useMemo(() => {
    return state.currentWordIndex >= words.length;
  }, [state.currentWordIndex, words.length]);

  const totalAttempts = useMemo(() => {
    return state.correctAttempts + state.incorrectAttempts;
  }, [state.correctAttempts, state.incorrectAttempts]);

  /**
   * Handles a key press event.
   * Validates the input against the current expected letter (case-insensitive).
   * If correct, advances to the next letter or word automatically.
   *
   * @param key - The key that was pressed
   * @returns true if the key was correct, false otherwise
   */
  const handleKeyPress = useCallback((key: string): boolean => {
    let isCorrectResult = false;

    setState(currentState => {
      // Check if game is complete
      if (currentState.currentWordIndex >= words.length) {
        return currentState;
      }

      const word = words[currentState.currentWordIndex];
      if (!word) {
        return currentState;
      }

      const expectedLetter = word.text[currentState.currentLetterIndex];
      if (!expectedLetter) {
        return currentState;
      }

      // Case-insensitive comparison
      const normalizedKey = key.toLowerCase();
      const normalizedExpected = expectedLetter.toLowerCase();
      const isCorrect = normalizedKey === normalizedExpected;
      isCorrectResult = isCorrect;

      if (isCorrect) {
        // Move to next letter (don't auto-advance to next word - let parent handle that)
        return {
          ...currentState,
          currentLetterIndex: currentState.currentLetterIndex + 1,
          correctAttempts: currentState.correctAttempts + 1,
        };
      } else {
        // Incorrect attempt
        return {
          ...currentState,
          incorrectAttempts: currentState.incorrectAttempts + 1,
        };
      }
    });

    return isCorrectResult;
  }, [words]);

  /**
   * Advances to the next word in the list.
   * Resets the letter index to 0.
   * Used for manual word progression or skipping.
   */
  const nextWord = useCallback(() => {
    setState(currentState => {
      if (currentState.currentWordIndex < words.length) {
        return {
          ...currentState,
          currentWordIndex: currentState.currentWordIndex + 1,
          currentLetterIndex: 0,
        };
      }
      return currentState;
    });
  }, [words.length]);

  /**
   * Resets the game to its initial state.
   * Clears all progress and statistics.
   */
  const resetGame = useCallback(() => {
    setState({
      currentWordIndex: 0,
      currentLetterIndex: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
    });
  }, []);

  return {
    // State
    words,
    currentWordIndex: state.currentWordIndex,
    currentLetterIndex: state.currentLetterIndex,
    isComplete,
    correctAttempts: state.correctAttempts,
    incorrectAttempts: state.incorrectAttempts,
    totalAttempts,
    currentWord,
    currentLetter,
    // Actions
    handleKeyPress,
    nextWord,
    resetGame,
  };
}
