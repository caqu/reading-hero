// src/hooks/useGameState.ts

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Word, UseGameState, HistoryEntry } from "../types";
import type { ContentItem } from "../types/ContentItem";
import { getNextItem } from "../engine/AdaptiveSequencer";
import { getActiveProfile } from "../engine/ProfileManager";
import {
  buildContentLibrary,
  profileToLearnerProfile,
  contentItemToWord,
} from "../utils/sequencerHelpers";

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
 * - Word progression via adaptive sequencer
 * - Game reset with sequencer-driven word selection
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
  const [words, setWords] = useState<Word[]>(initialWords);
  const [state, setState] = useState<GameStateInternal>({
    currentWordIndex: 0,
    currentLetterIndex: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
  });

  // Build content library from words
  const [contentLibrary, setContentLibrary] = useState<ContentItem[]>([]);
  const [historyWindow, setHistoryWindow] = useState<HistoryEntry[]>([]);

  // Initialize content library when words change
  useEffect(() => {
    if (initialWords.length > 0) {
      console.log('[useGameState] Building content library from', initialWords.length, 'words');
      const library = buildContentLibrary(initialWords);
      setContentLibrary(library);
      setWords(initialWords);
    }
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
   * Advances to the next word using the adaptive sequencer.
   * Resets the letter index to 0.
   * Used for manual word progression or skipping.
   */
  const nextWord = useCallback(() => {
    // Get active profile
    const profile = getActiveProfile();
    if (!profile || contentLibrary.length === 0) {
      console.warn('[useGameState] Cannot get next word - no profile or empty library');
      return;
    }

    try {
      // Convert profile to learner profile
      const learnerProfile = profileToLearnerProfile(profile);

      // Get next item from sequencer
      const sequencerOutput = getNextItem(
        learnerProfile,
        historyWindow,
        contentLibrary
      );

      console.log('[SEQ] Selected item:', sequencerOutput.item.text);
      console.log('[SEQ] Stage:', sequencerOutput.item.stage);
      console.log('[SEQ] Reason:', {
        progressionState: sequencerOutput.reason.progressionState,
        matchedCandidates: sequencerOutput.reason.matchedCandidates,
        selectedRank: sequencerOutput.reason.selectedRank,
        usedSurprise: sequencerOutput.reason.usedSurprise,
        injectedReview: sequencerOutput.reason.injectedReview,
      });

      // Convert content item back to word
      const nextWordItem = contentItemToWord(sequencerOutput.item, words);

      // Find or add word to words array
      let wordIndex = words.findIndex(w => w.id === nextWordItem.id);
      if (wordIndex === -1) {
        // Add word to array
        const newWords = [...words, nextWordItem];
        setWords(newWords);
        wordIndex = newWords.length - 1;
      }

      // Update state to show new word
      setState({
        ...state,
        currentWordIndex: wordIndex,
        currentLetterIndex: 0,
      });
    } catch (error) {
      console.error('[useGameState] Error getting next word from sequencer:', error);
      // Fallback to old behavior
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
    }
  }, [words, contentLibrary, historyWindow, state]);

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
   * Uses adaptive sequencer to select first word.
   */
  const resetGame = useCallback(() => {
    console.log('[useGameState] Resetting game');
    setWords(initialWords);
    setHistoryWindow([]);
    setState({
      currentWordIndex: 0,
      currentLetterIndex: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
    });

    // Get first word from sequencer
    const profile = getActiveProfile();
    if (profile && contentLibrary.length > 0) {
      try {
        const learnerProfile = profileToLearnerProfile(profile);
        const sequencerOutput = getNextItem(
          learnerProfile,
          [],
          contentLibrary
        );

        console.log('[SEQ] First word:', sequencerOutput.item.text);

        const firstWord = contentItemToWord(sequencerOutput.item, initialWords);
        const wordIndex = initialWords.findIndex(w => w.id === firstWord.id);

        if (wordIndex !== -1) {
          setState({
            currentWordIndex: wordIndex,
            currentLetterIndex: 0,
            correctAttempts: 0,
            incorrectAttempts: 0,
          });
        }
      } catch (error) {
        console.error('[useGameState] Error getting first word:', error);
      }
    }
  }, [initialWords, contentLibrary]);

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
