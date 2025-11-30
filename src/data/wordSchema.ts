/**
 * Core Word Schema for Reading Hero
 *
 * This module defines the canonical data model for words, word lists, and their metadata.
 *
 * Design Notes:
 * - Schema is designed to support future TSV/CSV import/export
 * - All metadata is structured to be flat-serializable where possible
 * - Lineage tracking ensures we always know the provenance of each word
 */

// =============================================================================
// ENUMERATIONS
// =============================================================================

export type GradeBand = "preK" | "K" | "1" | "2" | "3" | "4" | "5";

export type WordSource =
  | "dolch_core"
  | "dolch_noun"
  | "fry_1_100"
  | "fry_101_200"
  | "fry_201_300"
  | "fry_301_400"
  | "fry_401_500"
  | "custom_thematic"
  | "emoji_seed"
  | "ugc";

export type InstructionalPurpose =
  | "sight_word"
  | "phonics_regular"
  | "phonics_irregular"
  | "morphology_base"
  | "morphology_derived"
  | "engaging_meaning"
  | "connector_function";

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "article"
  | "preposition"
  | "conjunction"
  | "interjection"
  | "other";

export type DecodingPattern =
  | "CVC"
  | "CVCe"
  | "CV"
  | "digraph"
  | "blend"
  | "r_controlled"
  | "vowel_team"
  | "irregular"
  | "multi_syllable"
  | "other";

export type EngagementTag =
  | "animal"
  | "food"
  | "family"
  | "emotion"
  | "school"
  | "action_high_energy"
  | "silly_potential"
  | "color"
  | "number"
  | "name_candidate"
  | "story_hook";

// =============================================================================
// METADATA STRUCTURES
// =============================================================================

/**
 * Tracks where a word or list came from and why it's included.
 * This is critical for understanding the pedagogical intent behind word selection.
 */
export interface WordLineage {
  sources: WordSource[];      // e.g., ["dolch_core", "fry_1_100"]
  notes?: string;             // short provenance note
}

/**
 * ASL (American Sign Language) metadata for multimodal support.
 */
export interface AslMetadata {
  gloss?: string;             // e.g. "DOG"
  hasRecordedSignVideo: boolean;
  signVideoStatus: "missing" | "recorded" | "approved";
  signVideoPath?: string;     // used if approved
}

/**
 * Emoji metadata for visual representation.
 */
export interface EmojiMetadata {
  defaultEmoji?: string;      // e.g. "🐶"
  emojiLabel?: string;        // description
  isPrimaryVisual: boolean;   // true if we show the emoji as main art
}

// =============================================================================
// CORE WORD INTERFACE
// =============================================================================

/**
 * The canonical Word object represents a single spelling/lemma with all its
 * pedagogical, linguistic, and multimodal metadata.
 *
 * Future TSV columns could be:
 * word_id, text, lemma, sources, pos, purposes, gradeBands, decodingPattern,
 * syllables, segments, frequencyRank, isSightWord, isHighFrequency,
 * semanticCategories, engagementTags, emoji, emojiLabel, isPrimaryVisual,
 * aslGloss, signVideoStatus, signVideoPath, lineageNotes
 */
export interface Word {
  id: string;                 // stable ID, e.g. "dog", "the", "bark.v1"
  text: string;               // surface form, e.g. "dog"
  lemma?: string;             // base lemma if needed ("bark" for "barks")

  gradeBands: GradeBand[];    // where we *intend* to introduce/use this word
  partOfSpeech: PartOfSpeech;

  instructionalPurposes: InstructionalPurpose[];
  decodingPattern?: DecodingPattern;

  syllables?: string[];       // e.g. ["dog"], ["ba", "by"], etc.
  segments?: string[];        // orthographic/morphological ["bark", "s"]

  frequencyRank?: number;     // e.g. Fry rank (lower = more frequent)
  isSightWord: boolean;       // targeted for instant recognition
  isHighFrequency: boolean;   // belongs to Dolch/Fry <= 500

  semanticCategories: string[];   // e.g. ["animal", "farm"]
  engagementTags: EngagementTag[];

  emoji?: EmojiMetadata;
  asl?: AslMetadata;

  lineage: WordLineage;       // where/from what list, plus rationale
}

// =============================================================================
// WORD LIST STRUCTURES
// =============================================================================

export type WordListType =
  | "grade_level"
  | "theme"
  | "game_mode"
  | "story_template"
  | "assessment";

/**
 * A WordList groups words for a specific purpose (grade level, theme, etc.).
 */
export interface WordList {
  id: string;                 // "kindergarten_core", "emoji_animals"
  name: string;               // "Kindergarten Core Sight Words"
  description?: string;
  listType: WordListType;
  gradeBands: GradeBand[];    // for grade-level lists; empty if thematic only
  lineage: WordLineage;       // how THIS LIST was constructed
}

/**
 * A WordListEntry links a word to a list with ordering and context.
 */
export interface WordListEntry {
  listId: string;
  wordId: string;             // links to Word.id
  order: number;              // order in this list
  isCore: boolean;            // core vs enrichment in list
  purposeInList?: string;     // e.g. "anchor_article", "story_pair_with_dog"
  notes?: string;
}
