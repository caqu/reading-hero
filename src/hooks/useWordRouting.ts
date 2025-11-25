// src/hooks/useWordRouting.ts

import { useEffect, useCallback, useState } from 'react';
import { Word } from '../types';

/**
 * Hook for managing URL-based routing with word query parameters.
 *
 * This hook provides:
 * - URL parsing on initialization
 * - URL synchronization when words change
 * - Browser back/forward navigation support
 * - Fallback handling for invalid word IDs
 *
 * @param words - List of all available words
 * @param onWordChange - Callback when URL indicates a word change
 * @returns Current word ID from URL and utilities to sync URL
 */
export function useWordRouting(
  words: Word[],
  onWordChange: (wordId: string | null) => void
) {
  const [currentWordId, setCurrentWordId] = useState<string | null>(null);

  /**
   * Parse the 'word' query parameter from the URL
   */
  const getWordIdFromURL = useCallback((): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get('word');
  }, []);

  /**
   * Find a word by its ID in the word list
   */
  const findWordById = useCallback((wordId: string | null): Word | null => {
    if (!wordId) return null;
    return words.find(word => word.id === wordId) || null;
  }, [words]);

  /**
   * Update the URL to reflect the current word ID
   * Uses pushState to avoid page reload
   *
   * @param wordId - The word ID to set in the URL
   * @param replace - If true, replaces history entry instead of pushing new one
   */
  const syncURLToWordId = useCallback((wordId: string, replace = false) => {
    const url = `/?word=${encodeURIComponent(wordId)}`;

    if (replace) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }

    setCurrentWordId(wordId);
  }, []);

  /**
   * Initialize from URL on mount
   * Reads the word parameter and validates it
   */
  const initializeFromURL = useCallback(() => {
    const wordIdFromURL = getWordIdFromURL();

    if (wordIdFromURL) {
      const word = findWordById(wordIdFromURL);
      if (word) {
        // Valid word ID found in URL
        setCurrentWordId(wordIdFromURL);
        onWordChange(wordIdFromURL);
        return;
      }
    }

    // No valid word ID in URL - signal to use default (first word)
    onWordChange(null);
  }, [getWordIdFromURL, findWordById, onWordChange]);

  /**
   * Set the current word by ID
   * Updates both internal state and URL
   *
   * @param wordId - The word ID to navigate to
   */
  const setWordId = useCallback((wordId: string) => {
    const word = findWordById(wordId);

    if (word) {
      syncURLToWordId(wordId, false);
      onWordChange(wordId);
    } else {
      // Invalid word ID - fallback to first word
      const firstWord = words[0];
      if (firstWord) {
        syncURLToWordId(firstWord.id, true);
        onWordChange(firstWord.id);
      }
    }
  }, [findWordById, syncURLToWordId, onWordChange, words]);

  /**
   * Handle browser back/forward navigation
   * Listens to popstate events and updates the current word
   */
  useEffect(() => {
    const handlePopState = () => {
      const wordIdFromURL = getWordIdFromURL();

      if (wordIdFromURL) {
        const word = findWordById(wordIdFromURL);
        if (word) {
          setCurrentWordId(wordIdFromURL);
          onWordChange(wordIdFromURL);
          return;
        }
      }

      // Invalid or missing word ID - fallback to first word
      const firstWord = words[0];
      if (firstWord) {
        window.history.replaceState({}, '', `/?word=${encodeURIComponent(firstWord.id)}`);
        setCurrentWordId(firstWord.id);
        onWordChange(firstWord.id);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [getWordIdFromURL, findWordById, onWordChange, words]);

  return {
    currentWordId,
    setWordId,
    initializeFromURL,
    syncURLToWordId,
  };
}
