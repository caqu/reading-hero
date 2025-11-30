/**
 * Core Word Lists - Initial Seed Data
 *
 * This file defines WordLists and WordListEntries that group words for specific purposes.
 * Currently includes:
 * - Kindergarten Core Sight Words list
 *
 * Future expansion will include:
 * - Additional grade-level lists (1st grade, 2nd grade, etc.)
 * - Thematic lists (animals, food, family, etc.)
 * - Game mode-specific lists
 */

import { WordList, WordListEntry } from "./wordSchema";

// =============================================================================
// WORD LISTS
// =============================================================================

export const coreWordLists: WordList[] = [
  {
    id: "kindergarten_core",
    name: "Kindergarten Core Sight Words",
    description: "Dolch Pre-K and K sight words plus a small set of highly engaging concrete nouns and simple verbs.",
    listType: "grade_level",
    gradeBands: ["K"],
    lineage: {
      sources: ["dolch_core", "dolch_noun", "custom_thematic"],
      notes: "Seeded from Dolch Pre-K/K lists and a handful of engaging custom words (e.g., 'barks')."
    }
  }
];

// =============================================================================
// WORD LIST ENTRIES
// =============================================================================

export const coreWordListEntries: WordListEntry[] = [
  {
    listId: "kindergarten_core",
    wordId: "the",
    order: 1,
    isCore: true,
    purposeInList: "anchor_article",
    notes: "High-frequency article; appears in many K-level sentences."
  },
  {
    listId: "kindergarten_core",
    wordId: "dog",
    order: 20,
    isCore: true,
    purposeInList: "concrete_noun",
    notes: "Concrete, emoji-backed noun; good early anchor for animals theme."
  },
  {
    listId: "kindergarten_core",
    wordId: "barks",
    order: 21,
    isCore: false,
    purposeInList: "story_pair_with_dog",
    notes: "Supports simple sentences like 'The dog barks.' for engagement and syntax practice."
  }
];

/**
 * Get all core word lists.
 */
export function getCoreWordLists(): WordList[] {
  return [...coreWordLists];
}

/**
 * Get a core word list by ID.
 */
export function getCoreWordListById(id: string): WordList | undefined {
  return coreWordLists.find(list => list.id === id);
}

/**
 * Get all entries for a specific list ID.
 */
export function getCoreWordListEntries(listId: string): WordListEntry[] {
  return coreWordListEntries.filter(entry => entry.listId === listId);
}
