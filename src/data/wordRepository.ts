/**
 * Word Repository - Central access layer for words and word lists
 *
 * This module provides a clean API for accessing words, word lists, and their relationships.
 * It serves as the main entry point for other parts of the application that need word data.
 *
 * Usage:
 *   import { getWordById, getKindergartenCoreWords } from '@/data/wordRepository';
 *
 *   const dogWord = getWordById('dog');
 *   const kindergartenWords = getKindergartenCoreWords();
 */

import { Word, WordList, WordListEntry } from "./wordSchema";
import { coreWords } from "./words.core";
import { coreWordLists, coreWordListEntries } from "./wordLists.core";

// =============================================================================
// WORD ACCESS
// =============================================================================

/**
 * Get all available words from all sources.
 */
export function getAllWords(): Word[] {
  return [...coreWords];
}

/**
 * Get a specific word by its ID.
 *
 * @param id - The word ID (e.g., "dog", "the", "barks")
 * @returns The word object, or undefined if not found
 */
export function getWordById(id: string): Word | undefined {
  return coreWords.find(w => w.id === id);
}

/**
 * Get all words matching a specific grade band.
 *
 * @param gradeBand - The target grade band (e.g., "K", "1", "2")
 * @returns Array of words that include this grade band
 */
export function getWordsByGradeBand(gradeBand: string): Word[] {
  return coreWords.filter(w => w.gradeBands.includes(gradeBand as any));
}

/**
 * Get all sight words.
 *
 * @returns Array of words marked as sight words
 */
export function getSightWords(): Word[] {
  return coreWords.filter(w => w.isSightWord);
}

/**
 * Get all high-frequency words (Dolch/Fry <= 500).
 *
 * @returns Array of high-frequency words
 */
export function getHighFrequencyWords(): Word[] {
  return coreWords.filter(w => w.isHighFrequency);
}

// =============================================================================
// WORD LIST ACCESS
// =============================================================================

/**
 * Get all available word lists.
 */
export function getAllWordLists(): WordList[] {
  return [...coreWordLists];
}

/**
 * Get a specific word list by its ID.
 *
 * @param id - The list ID (e.g., "kindergarten_core")
 * @returns The word list object, or undefined if not found
 */
export function getWordListById(id: string): WordList | undefined {
  return coreWordLists.find(list => list.id === id);
}

/**
 * Get all list entries for a specific word list.
 *
 * @param listId - The list ID
 * @returns Array of word list entries, sorted by order
 */
export function getEntriesForList(listId: string): WordListEntry[] {
  return coreWordListEntries
    .filter(entry => entry.listId === listId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get all words for a specific word list.
 * This joins the list entries with the actual word objects.
 *
 * @param listId - The list ID
 * @returns Array of words in the list, in order
 */
export function getWordsForList(listId: string): Word[] {
  const entries = getEntriesForList(listId);
  const words: Word[] = [];

  for (const entry of entries) {
    const word = getWordById(entry.wordId);
    if (word) {
      words.push(word);
    } else {
      console.warn(`Word not found for entry: ${entry.wordId} in list ${listId}`);
    }
  }

  return words;
}

// =============================================================================
// CONVENIENCE FUNCTIONS FOR SPECIFIC LISTS
// =============================================================================

/**
 * Get all words in the Kindergarten Core list.
 * This is a shortcut for getWordsForList("kindergarten_core").
 *
 * @returns Array of kindergarten core words
 */
export function getKindergartenCoreWords(): Word[] {
  return getWordsForList("kindergarten_core");
}

/**
 * Get core words only (excluding enrichment) for a specific list.
 *
 * @param listId - The list ID
 * @returns Array of core words only
 */
export function getCoreWordsForList(listId: string): Word[] {
  const entries = getEntriesForList(listId).filter(entry => entry.isCore);
  const words: Word[] = [];

  for (const entry of entries) {
    const word = getWordById(entry.wordId);
    if (word) {
      words.push(word);
    }
  }

  return words;
}

// =============================================================================
// STATISTICS & METADATA
// =============================================================================

/**
 * Get statistics about the word repository.
 *
 * @returns Object containing counts and metadata
 */
export function getRepositoryStats() {
  const allWords = getAllWords();

  return {
    totalWords: allWords.length,
    sightWords: allWords.filter(w => w.isSightWord).length,
    highFrequencyWords: allWords.filter(w => w.isHighFrequency).length,
    wordsWithEmoji: allWords.filter(w => w.emoji?.defaultEmoji).length,
    wordsWithASL: allWords.filter(w => w.asl?.hasRecordedSignVideo).length,
    totalLists: getAllWordLists().length,
    totalEntries: coreWordListEntries.length
  };
}

/**
 * Debug helper: Log repository stats to console.
 */
export function logRepositoryStats() {
  const stats = getRepositoryStats();
  console.log("=== Word Repository Statistics ===");
  console.log(`Total Words: ${stats.totalWords}`);
  console.log(`Sight Words: ${stats.sightWords}`);
  console.log(`High-Frequency Words: ${stats.highFrequencyWords}`);
  console.log(`Words with Emoji: ${stats.wordsWithEmoji}`);
  console.log(`Words with ASL Videos: ${stats.wordsWithASL}`);
  console.log(`Total Lists: ${stats.totalLists}`);
  console.log(`Total List Entries: ${stats.totalEntries}`);
  console.log("=====================================");
}
