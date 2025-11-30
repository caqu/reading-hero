**`task_define_word_schema_and_build_core_lists.md`**

---

# **task_define_word_schema_and_build_core_lists.md**

**Task ID:** `T_DEFINE_WORD_SCHEMA_AND_BUILD_CORE_LISTS`

**Goal:**
Create a **canonical word data model** (Word) and a separate **WordList** system for grouping words (e.g., “Kindergarten Core”), including data lineage, instructional purpose, and attributes useful for filtering and sorting. Seed this with an initial **Kindergarten** list based on Dolch/Fry + a few engaging words (like “dog / barks”) as examples.

---

## 📝 Task Summary

We want to stop thinking of words as a flat array and instead build:

1. A reusable **Word** object (one per spelling / lemma)
2. A set of **WordList** + **WordListEntry** objects that reference words by ID
3. A **data lineage & purpose** system so we always know:

   * where a word came from (Dolch, Fry, emoji, custom, etc.)
   * why it’s there (sight word vs phonics vs “engaging meaning”)
4. A first concrete list: **Kindergarten Core** with entries like:

   * `the` → in Dolch, article, sight word, gradeband K–1
   * `dog` → noun, sight word, engaging (animal, emoji)
   * `barks` → verb, engaging by meaning, pairs with “dog”

This must be implemented in TypeScript, with JSON/TS data files that the rest of the app can import.

---

## 🎯 Part A — Define the Core Word Schema

Create a file:

```ts
src/data/wordSchema.ts
```

Define the following types and interfaces:

### 1. Enumerations

```ts
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
```

### 2. Lineage & multimodal metadata

```ts
export interface WordLineage {
  sources: WordSource[];      // e.g., ["dolch_core", "fry_1_100"]
  notes?: string;             // short provenance note
}

export interface AslMetadata {
  gloss?: string;             // e.g. "DOG"
  hasRecordedSignVideo: boolean;
  signVideoStatus: "missing" | "recorded" | "approved";
  signVideoPath?: string;     // used if approved
}

export interface EmojiMetadata {
  defaultEmoji?: string;      // e.g. "🐶"
  emojiLabel?: string;        // description
  isPrimaryVisual: boolean;   // true if we show the emoji as main art
}
```

### 3. Core `Word` interface

```ts
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
```

---

## 🎯 Part B — Define WordList & WordListEntry

Still in `wordSchema.ts`, add:

```ts
export type WordListType =
  | "grade_level"
  | "theme"
  | "game_mode"
  | "story_template"
  | "assessment";

export interface WordList {
  id: string;                 // "kindergarten_core", "emoji_animals"
  name: string;               // "Kindergarten Core Sight Words"
  description?: string;
  listType: WordListType;
  gradeBands: GradeBand[];    // for grade-level lists; empty if thematic only
  lineage: WordLineage;       // how THIS LIST was constructed
}

export interface WordListEntry {
  listId: string;
  wordId: string;             // links to Word.id
  order: number;              // order in this list
  isCore: boolean;            // core vs enrichment in list
  purposeInList?: string;     // e.g. "anchor_article", "story_pair_with_dog"
  notes?: string;
}
```

---

## 🎯 Part C — Implement Data Files for Words & Lists

Create:

* `src/data/words.core.ts`
* `src/data/wordLists.core.ts`

These will **export arrays** of `Word`, `WordList`, and `WordListEntry`.

### 1. Seed minimal sample Words

In `src/data/words.core.ts`, export at least these three fully annotated examples:

#### `the`

Matches user’s idea: in Dolch, article, sight word, gradeband K–1.

```ts
import { Word } from "./wordSchema";

export const coreWords: Word[] = [
  {
    id: "the",
    text: "the",
    gradeBands: ["K", "1"],
    partOfSpeech: "article",
    instructionalPurposes: ["sight_word", "connector_function"],
    decodingPattern: "irregular",
    syllables: ["the"],
    segments: ["the"],
    frequencyRank: 1,                 // Fry rank (example)
    isSightWord: true,
    isHighFrequency: true,
    semanticCategories: [],
    engagementTags: [],
    emoji: {
      defaultEmoji: undefined,
      emojiLabel: undefined,
      isPrimaryVisual: false
    },
    asl: {
      gloss: undefined,
      hasRecordedSignVideo: false,
      signVideoStatus: "missing"
    },
    lineage: {
      sources: ["dolch_core", "fry_1_100"],
      notes: "High-frequency article from Dolch Pre-K/K and Fry 1–100."
    }
  },
```

#### `dog`

Noun, sight word, engaging by meaning.

```ts
  {
    id: "dog",
    text: "dog",
    gradeBands: ["K", "1"],
    partOfSpeech: "noun",
    instructionalPurposes: ["sight_word", "phonics_regular", "engaging_meaning"],
    decodingPattern: "CVC",
    syllables: ["dog"],
    segments: ["d", "og"],
    frequencyRank: 150,               // placeholder
    isSightWord: true,                // Dolch noun
    isHighFrequency: true,
    semanticCategories: ["animal", "pet"],
    engagementTags: ["animal", "story_hook"],
    emoji: {
      defaultEmoji: "🐶",
      emojiLabel: "dog face",
      isPrimaryVisual: true
    },
    asl: {
      gloss: "DOG",
      hasRecordedSignVideo: false,
      signVideoStatus: "missing"
    },
    lineage: {
      sources: ["dolch_noun", "emoji_seed"],
      notes: "Dolch noun; concrete, visually engaging; mapped to 🐶 and ASL gloss DOG."
    }
  },
```

#### `barks`

Verb, engaging by meaning, pairs with dog.

```ts
  {
    id: "barks",
    text: "barks",
    lemma: "bark",
    gradeBands: ["1", "2"],
    partOfSpeech: "verb",
    instructionalPurposes: ["morphology_derived", "engaging_meaning"],
    decodingPattern: "CVC",
    syllables: ["barks"],
    segments: ["bark", "s"],
    frequencyRank: undefined,
    isSightWord: false,
    isHighFrequency: false,
    semanticCategories: ["animal_sound"],
    engagementTags: ["animal", "story_hook", "silly_potential"],
    emoji: {
      defaultEmoji: "🐕",
      emojiLabel: "dog",
      isPrimaryVisual: false
    },
    asl: {
      gloss: "DOG-BARK",
      hasRecordedSignVideo: false,
      signVideoStatus: "missing"
    },
    lineage: {
      sources: ["custom_thematic"],
      notes: "Added to make engaging mini-sentences with 'dog' (e.g., 'The dog barks.')."
    }
  }
];
```

> **Note:** For now, it’s fine that `coreWords` only has a few entries; the agent can later extend this with full Dolch/Fry import logic.

---

### 2. Seed the **Kindergarten Core** WordList

In `src/data/wordLists.core.ts`:

```ts
import { WordList, WordListEntry } from "./wordSchema";

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
```

Later, the agent will extend `coreWords` and `coreWordListEntries` to cover the full Dolch K set, but this initial sample ensures the schema + wiring are correct.

---

## 🎯 Part D — Utility Functions to Access Words & Lists

Create:

```ts
src/data/wordRepository.ts
```

Implement functions:

```ts
import { Word, WordList, WordListEntry } from "./wordSchema";
import { coreWords } from "./words.core";
import { coreWordLists, coreWordListEntries } from "./wordLists.core";

export function getAllWords(): Word[] { /* ... */ }
export function getWordById(id: string): Word | undefined { /* ... */ }

export function getAllWordLists(): WordList[] { /* ... */ }
export function getWordListById(id: string): WordList | undefined { /* ... */ }

export function getEntriesForList(listId: string): WordListEntry[] { /* ... */ }

export function getWordsForList(listId: string): Word[] {
  // join entries with coreWords
}

export function getKindergartenCoreWords(): Word[] {
  return getWordsForList("kindergarten_core");
}
```

These will be used elsewhere (e.g., game engine, recording inventory, etc.).

---

## 🎯 Part E — Optional: TSV / CSV Editing Bridge

(Not required to fully implement now, but **please design for it**.)

* Document in comments that the schema is designed so we can have a flat TSV later with columns like:

  ```text
  word_id  text  sources         pos    purposes                      gradeBands  engagementTags
  the      the   dolch_core,fry  article  sight_word,connector_function  K,1     ""
  dog      dog   dolch_noun      noun     sight_word,phonics_regular,engaging_meaning K,1 animal,story_hook
  barks    barks custom_thematic verb     morphology_derived,engaging_meaning 1,2 animal,story_hook
  ```

* A future script could ingest TSV → `Word[]`.

Just leave doc comments noting this intent.

---

## 🧪 Acceptance Criteria

This task is complete when:

1. `src/data/wordSchema.ts` defines:

   * `Word`, `WordList`, `WordListEntry`
   * all described enums and metadata types
2. `src/data/words.core.ts` exports `coreWords` including at least:

   * `the` (Dolch/Fry article, sight word)
   * `dog` (Dolch noun, engaging animal)
   * `barks` (custom engaging verb, pairs with “dog”)
3. `src/data/wordLists.core.ts` exports:

   * one `WordList` with `id = "kindergarten_core"`
   * `WordListEntry[]` linking that list to `the`, `dog`, `barks` with appropriate order and list-level notes
4. `src/data/wordRepository.ts` provides:

   * helpers to get all words, get word by id, get list by id, and get words for a list
5. All types compile cleanly in TypeScript and are importable by other parts of the app.
6. The design clearly encodes:

   * data lineage (sources + notes)
   * instructional purpose (sight word, phonics, engaging)
   * attributes useful for filtering/sorting (gradeBands, partOfSpeech, engagementTags, decodingPattern, ASL/emoji status).

---

## 📦 Deliverables

* `src/data/wordSchema.ts`
* `src/data/words.core.ts`
* `src/data/wordLists.core.ts`
* `src/data/wordRepository.ts`
* (Optional comments about TSV/CSV import/export strategy)
