// src/hooks/useGameState.ts

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Word, UseGameState } from "../types";

interface GameStateInternal {
  currentWordIndex: number;
  currentLetterIndex: number;
  correctAttempts: number;
  incorrectAttempts: number;
}

/**
 * Shuffles an array using the Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}

/**
 * Custom React hook for managing the game state and logic.
 *
 * This hook handles:
 * - Game initialization with a word list
 * - Current word and letter tracking
 * - Input validation (case-insensitive)
 * - Word progression
 * - Game reset with word shuffling
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
  const [words, setWords] = useState<Word[]>(shuffleArray(initialWords));
  const [state, setState] = useState<GameStateInternal>({
    currentWordIndex: 0,
    currentLetterIndex: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
  });

  // Update words when initialWords changes (e.g., after ASL video enrichment)
  useEffect(() => {
    console.log('[useGameState] Updating words after enrichment');
    setWords(shuffleArray(initialWords));
  }, [initialWords]);

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
    // Read current state before processing
    const currentState = state;

    // Check if game is complete
    if (currentState.currentWordIndex >= words.length) {
      return true;
    }

    const word = words[currentState.currentWordIndex];
    if (!word) {
      return false;
    }

    const expectedLetter = word.text[currentState.currentLetterIndex];

    // If we're beyond the word length, the word is complete
    // Ignore further input (return true to avoid showing error)
    if (!expectedLetter || currentState.currentLetterIndex >= word.text.length) {
      return true; // Don't show error for keys pressed after word completion
    }

    // Case-insensitive comparison
    const normalizedKey = key.toLowerCase();
    const normalizedExpected = expectedLetter.toLowerCase();
    const isCorrect = normalizedKey === normalizedExpected;

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
   * Sets the current word by its ID.
   * Finds the word in the list and updates the index accordingly.
   * Resets the letter index to 0.
   *
   * @param wordId - The ID of the word to navigate to
   * @returns true if word was found and set, false otherwise
   */
  const setWordById = useCallback((wordId: string): boolean => {
    const wordIndex = words.findIndex(word => word.id === wordId);

    if (wordIndex >= 0) {
      setState(currentState => ({
        ...currentState,
        currentWordIndex: wordIndex,
        currentLetterIndex: 0,
      }));
      return true;
    }

    return false;
  }, [words]);

  /**
   * Resets the game to its initial state.
   * Clears all progress and statistics.
   * Shuffles the word list for a new game sequence.
   */
  const resetGame = useCallback(() => {
    setWords(shuffleArray(initialWords));
    setState({
      currentWordIndex: 0,
      currentLetterIndex: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
    });
  }, [initialWords]);

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
    setWordById,
    resetGame,
  };
}
