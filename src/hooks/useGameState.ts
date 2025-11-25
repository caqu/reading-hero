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
    // Check game state first
    const currentState = state;

    console.log('[useGameState] handleKeyPress called', {
      key,
      currentWordIndex: currentState.currentWordIndex,
      currentLetterIndex: currentState.currentLetterIndex,
      wordsLength: words.length
    });

    // Check if game is complete
    if (currentState.currentWordIndex >= words.length) {
      console.log('[useGameState] Game is complete, ignoring input');
      return true;
    }

    const word = words[currentState.currentWordIndex];
    if (!word) {
      console.log('[useGameState] No current word found');
      return false;
    }

    const expectedLetter = word.text[currentState.currentLetterIndex];

    console.log('[useGameState] Checking letter', {
      word: word.text,
      expectedLetter,
      currentLetterIndex: currentState.currentLetterIndex,
      wordLength: word.text.length
    });

    // If we're beyond the word length, the word is complete
    // Ignore further input (return true to avoid showing error)
    if (!expectedLetter || currentState.currentLetterIndex >= word.text.length) {
      console.log('[useGameState] Beyond word length, ignoring');
      return true; // Don't show error for keys pressed after word completion
    }

    // Case-insensitive comparison
    const normalizedKey = key.toLowerCase();
    const normalizedExpected = expectedLetter.toLowerCase();
    const isCorrect = normalizedKey === normalizedExpected;

    console.log('[useGameState] Comparison', {
      normalizedKey,
      normalizedExpected,
      isCorrect
    });

    setState(currentStateInner => {
      if (isCorrect) {
        // Move to next letter (don't auto-advance to next word - let parent handle that)
        return {
          ...currentStateInner,
          currentLetterIndex: currentStateInner.currentLetterIndex + 1,
          correctAttempts: currentStateInner.correctAttempts + 1,
        };
      } else {
        // Incorrect attempt
        return {
          ...currentStateInner,
          incorrectAttempts: currentStateInner.incorrectAttempts + 1,
        };
      }
    });

    return isCorrect;
  }, [words, state]);

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
