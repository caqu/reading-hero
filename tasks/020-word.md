## TASK 021 `/tasks/task_wordbank_v1.md`

````md
# Reading Hero – WordBank v1 (Dolch/Fry + Metadata)
**Task ID:** RH_T_WORD_BANK_V1  
**Goal:** Create the first structured word bank for Reading Hero using Dolch + Fry sight words and a small set of high-interest extras, with metadata to support clustering, ASL, and engagement.

---

## 📝 Summary

We want a central `WordBank` data module that:

- Combines **Dolch** and **Fry** sight words into a single pool
- Adds a small curated list of **extra high-interest words**
- Provides rich metadata per word (grade band, categories, function/content, emoji, etc.)
- Exposes APIs for querying subsets (by grade, by theme, etc.)

This serves as the backbone for all game modes, clustering, and later ASL integration.

---

## 🎯 Requirements

### 1. Source Data (Human-Curated CSV/JSON)

Create a source file (for example in `/data/wordbank/wordbank_v1.csv` or `.json`) with at least:

- Dolch words (Pre-K → 3rd grade)
- Fry words up to at least the **300** most frequent words
- A small curated set of **high-interest extras** (e.g. dinosaur, pizza, unicorn, robot, etc.)

Each row/object should include:

- `text` – the English word (e.g. `"dog"`)
- `gradeBand` – `"K"`, `"1-2"`, `"3-5"` (approx. target)
- `isFunctionWord` – boolean (true for articles, prepositions, pronouns, auxiliaries)
- `categories` – array of tags (`["animal", "pet"]`, `["color"]`, `["family"]`, etc.)
- `emoji` – an emoji candidate if applicable (string or empty)
- `isHighInterestExtra` – boolean
- `notes` – optional human note (e.g. “great for jokes”, “ASL-first priority”)

> NOTE: The human team will fill this file. The coding agent just needs to define the schema and loader.

---

### 2. TypeScript Model

Create:

`src/wordbank/types.ts`

```ts
export type GradeBand = "K" | "1-2" | "3-5";

export interface WordEntry {
  id: string;          // canonical id, typically same as text for now, e.g. "dog"
  text: string;        // display form, e.g. "dog"
  gradeBand: GradeBand;
  isFunctionWord: boolean;
  categories: string[];
  emoji?: string;
  isHighInterestExtra: boolean;
  notes?: string;

  // forward-looking fields
  signVideoUrl?: string | null;
}
````

---

### 3. WordBank Module

Create:

`src/wordbank/WordBank.ts`

Responsibilities:

* Load `wordbank_v1` data at build time or runtime
* Normalize into `WordEntry[]`
* Provide helper functions, e.g.:

```ts
export function getAllWords(): WordEntry[];
export function getWordsByGrade(gradeBand: GradeBand): WordEntry[];
export function getWordsByCategory(category: string): WordEntry[];
export function getFunctionWords(gradeBand?: GradeBand): WordEntry[];
export function getContentWords(gradeBand?: GradeBand): WordEntry[];
export function getRandomWords(options: {
  gradeBand?: GradeBand;
  categories?: string[];
  limit: number;
  includeHighInterestExtras?: boolean;
}): WordEntry[];
```

Implementation details:

* Ensure stable `id` (e.g. `text.toLowerCase()` with slugging).
* Validate that `text` is unique across the word bank.
* Log warnings for duplicates or invalid grade bands.

---

### 4. Dev-Only Inspection Page

Create a simple internal page:

`src/pages/WordBankDebugPage.tsx` (route e.g. `/dev/wordbank`)

Features:

* Table view of all words (`text`, `emoji`, `gradeBand`, `categories`, `isFunctionWord`, `isHighInterestExtra`)
* Filter by grade band
* Filter by category
* Count totals per grade

No need for fancy styling; this is for internal QA.

---

## 🧪 Acceptance Criteria

* A single `WordBank` module serves as the canonical source of words.
* We can query words by grade band, category, and flags (function word, high-interest extra).
* The `WordBankDebugPage` loads and renders without errors.
* Word entries include emoji when meaningful, and tags cover major themes (animals, food, school, family, feelings, actions…).

---

## 📦 Deliverables

* `/data/wordbank/wordbank_v1.(csv|json)` schema
* `src/wordbank/types.ts`
* `src/wordbank/WordBank.ts`
* `src/pages/WordBankDebugPage.tsx`

````

---

## TASK 022 `/tasks/task_word_clusters_and_paths.md`

```md
# Reading Hero – Word Clusters & Learning Paths
**Task ID:** RH_T_CLUSTERS_PATHS  
**Goal:** Create a simple but extensible system for grouping words into thematic clusters and learner “paths” (e.g., Animals, My World, School), to drive progression and context-based practice.

---

## 📝 Summary

Using the `WordBank` as the foundation, implement:

- A `WordCluster` model (small sets of related words)
- A `LearningPath` model (ordered groups of clusters)
- APIs for retrieving the next word/cluster for a given profile

These structures will let us present words in **contextual themes** (“Pets”, “Food”, “Feelings”), which is key for engagement.

---

## 🎯 Requirements

### 1. Types

Create:

`src/wordbank/paths.ts`

```ts
export type ClusterMode = "single" | "pair" | "sentence" | "mixed";

export interface WordCluster {
  id: string;             // "animals_pets"
  name: string;           // "Animals: Pets"
  description?: string;
  wordIds: string[];      // ["dog", "cat", "fish", ...]
  recommendedMode: ClusterMode;
  gradeBand: "K" | "1-2" | "3-5";
}

export interface LearningPath {
  id: string;             // "path_animals"
  name: string;           // "Animals"
  description?: string;
  clusterIds: string[];   // ["animals_pets", "animals_farm", ...]
  gradeBand: "K" | "1-2" | "3-5";
}
````

---

### 2. Seed Configuration

Create a config file:

`src/wordbank/paths_config.ts`

Seed with a **minimal but real** set, for example:

* Path: `My World`

  * Cluster: `Family` (mom, dad, sister, brother, baby, home, etc.)
  * Cluster: `Feelings` (happy, sad, mad, scared, etc.)
* Path: `Animals`

  * Cluster: `Pets` (dog, cat, fish, bird)
  * Cluster: `Farm` (cow, horse, pig, chicken)
* Path: `School & Play`

  * Cluster: `School` (teacher, school, book, desk, write)

Each cluster’s `wordIds` must reference existing `WordEntry.id` from the WordBank.

---

### 3. Helper APIs

In `paths.ts` or `WordBank.ts`, implement:

```ts
export function getClustersForPath(pathId: string): WordCluster[];
export function getPathById(pathId: string): LearningPath | undefined;
export function getClusterById(clusterId: string): WordCluster | undefined;
export function getDefaultPathForGradeBand(gradeBand: GradeBand): LearningPath;
```

And progression helpers:

```ts
export function getNextClusterForProfile(pathId: string, profileId: string): WordCluster;
export function getNextWordInCluster(
  clusterId: string,
  profileId: string
): WordEntry;
```

> NOTE: For now, the “profile” integration can be stubbed by simply moving sequentially through clusters/words; later tasks will hook in mastery stats.

---

### 4. Developer Preview Page

Add:

`src/pages/PathsDebugPage.tsx` (route `/dev/paths`)

Shows:

* List of paths
* Clicking a path shows its clusters and words
* Per-cluster details: number of words, grade band, recommendedMode

---

## 🧪 Acceptance Criteria

* Clusters and paths load without errors.
* All `wordIds` resolve to existing `WordEntry.id`.
* The debug page can navigate through paths and clusters.
* The “next cluster” and “next word in cluster” helpers work sequentially (even if naive for now).

---

## 📦 Deliverables

* `src/wordbank/paths.ts`
* `src/wordbank/paths_config.ts`
* `src/pages/PathsDebugPage.tsx`

````

---

## TASK 023 `/tasks/task_game_modes_single_pair_sentence.md`

```md
# Reading Hero – Core Game Modes (Single, Pair, Sentence)
**Task ID:** RH_T_GAME_MODES  
**Goal:** Refactor and extend the current gameplay into three explicit modes: Single Word, Word Pair, and Mini-Sentence, built on top of WordBank & Clusters.

---

## 📝 Summary

We want three core, switchable game modes:

1. **SingleWordGame** – current behavior, type one target word.
2. **WordPairGame** – type an adjective+noun or verb+noun phrase.
3. **MiniSentenceGame** – type a short 3–5 word sentence.

Each mode:

- Uses `WordEntry` (and clusters/paths) to supply content.
- Integrates with existing visual layout (emoji, sign, tiles, keyboard).
- Reports results into a shared stats/mastery system (future task will use this).

---

## 🎯 Requirements

### 1. Game Mode Abstraction

Create a shared interface:

`src/game/types.ts`

```ts
export type GameModeId = "single" | "pair" | "sentence";

export interface GameItem {
  id: string;          // unique instance id
  displayText: string; // what is shown
  targetText: string;  // what user must type
  wordIds: string[];   // associated WordEntry ids
  mode: GameModeId;
}
````

---

### 2. SingleWordGame

Refactor existing logic into:

`src/game/modes/SingleWordGame.tsx`

* Input: a `WordEntry` plus optional difficulty settings.
* Output: a `GameItem` with `targetText = word.text`.
* On success:

  * calls a shared callback `onGameItemComplete(gameItem, stats)`.

This should preserve current behavior for:

* tiles
* image/emoji
* TTS letters and whole-word (when enabled)

---

### 3. WordPairGame

Create:

`src/game/modes/WordPairGame.tsx`

Behavior:

* Given a cluster, select:

  * a **modifier** (adjective or function “big, red, funny, little”)
  * a **head noun** (e.g., dog, cat, ball)
* `displayText` and `targetText` = `"big dog"` (space-separated).
* Use emoji for the noun where possible; optionally show a small visual cue for the adjective later.
* Minimum: Type full pair as one string.

For now, you can seed a tiny map of allowed modifiers per category:

```ts
const ADJECTIVES_FOR_CATEGORY = {
  animal: ["big", "little", "funny"],
  food: ["hot", "cold", "yummy"],
};
```

---

### 4. MiniSentenceGame

Create:

`src/game/modes/MiniSentenceGame.tsx`

Behavior:

* For now, use a **hard-coded list** of 20–30 sample sentences, each tied to `WordEntry` ids.

  * Later, these can be generated from clusters.
* `displayText = targetText`, e.g. `"The dog is big."`.
* Optionally allow:

  * type the whole sentence, or
  * only type key words (config flag; start with full sentence).

---

### 5. Game Mode Selector & Routing

Create a simple selector:

`src/game/GameRunner.tsx`

Props:

```ts
interface GameRunnerProps {
  mode: GameModeId;
  pathId?: string;
}
```

Responsibilities:

* Decide the current cluster/word(s) using `WordBank` + `paths`.
* Instantiate the appropriate mode component.
* Provide shared layout wrapper (emoji, sign video, tiles, keyboard).
* Accept callbacks for completion (used later by mastery system).

Add a **temporary dev menu** to choose the mode and path (e.g., `/dev/play?mode=single&path=path_animals`).

---

## 🧪 Acceptance Criteria

* Existing “single word typing” works via `SingleWordGame` with no regression.
* `WordPairGame` can be run and shows phrases like `big dog`, `red ball`.
* `MiniSentenceGame` works with a small initial set of sentences.
* `GameRunner` can switch between modes based on props/query params.
* All three modes share a consistent look & feel.

---

## 📦 Deliverables

* `src/game/types.ts`
* `src/game/modes/SingleWordGame.tsx`
* `src/game/modes/WordPairGame.tsx`
* `src/game/modes/MiniSentenceGame.tsx`
* `src/game/GameRunner.tsx`
* Dev entry route/page to run different modes

````

---

## TASK 024 `/tasks/task_mastery_and_spaced_review.md`

```md
# Reading Hero – Mastery & Spaced Review Model
**Task ID:** RH_T_MASTERY_SPACED_REVIEW  
**Goal:** Track per-profile mastery of each word and use it to drive a simple spaced review / progression system.

---

## 📝 Summary

We need a lightweight model that:

- Records attempts and correctness per word per profile.
- Computes a simple `masteryScore` per word (0–1).
- Uses mastery + recency to select the next word(s) to practice.

This will later influence which mode/cluster to use, but for now it can drive **which word** appears next.

---

## 🎯 Requirements

### 1. Types & Storage

Create:

`src/mastery/types.ts`

```ts
export interface WordMastery {
  wordId: string;
  attempts: number;
  correct: number;
  lastSeenAt: number;   // timestamp
  masteryScore: number; // 0–1
}

export interface ProfileMasteryState {
  profileId: string;
  words: Record<string, WordMastery>; // key = wordId
}
````

Implement a `MasteryStore`:

`src/mastery/MasteryStore.ts`

* Persists per-profile data to `localStorage` under a key like:

  * `readingHero.mastery.<profileId>`
* Public API:

```ts
getMastery(profileId: string, wordId: string): WordMastery | null;
updateAfterAttempt(profileId: string, wordId: string, wasCorrect: boolean, timeMs: number): void;
getAllForProfile(profileId: string): WordMastery[];
```

Mastery formula (simple first pass):

* Initialize `masteryScore = 0`
* On each correct attempt: small bump, e.g.
  `masteryScore = min(1, masteryScore + 0.15)`
* On incorrect attempt: drop slightly, e.g.
  `masteryScore = max(0, masteryScore - 0.1)`
* Consider time: optionally give a bigger bump for fast correct attempts (< threshold).

---

### 2. Integrate With Game Modes

In each game mode (Single, Pair, Sentence):

* When the user completes a `GameItem`:

  * For each `wordId` in `gameItem.wordIds`, call:

    * `updateAfterAttempt(profileId, wordId, wasCorrect, timeMs)`

For now, `wasCorrect = true` if they eventually completed it; we can refine to track first-try vs multiple corrections later.

---

### 3. Word Selection Heuristic

Implement a helper:

`src/mastery/NextWordSelector.ts`

```ts
interface NextWordOptions {
  profileId: string;
  candidateWordIds: string[];
  maxNewRatio?: number; // e.g. 0.3 = 30% new
}

export function pickNextWordId(options: NextWordOptions): string;
```

Logic (simple first version):

* Partition `candidateWordIds` into:

  * **new** (no mastery entry)
  * **known** (have `masteryScore`)
* Prefer:

  * ~30% new words
  * ~70% review words, biased towards:

    * lower `masteryScore`
    * older `lastSeenAt`
* Use random choice weighted by `(1 - masteryScore)` and recency.

---

### 4. Debug Page

Add:

`src/pages/MasteryDebugPage.tsx` (route `/dev/mastery`)

* Show for active profile:

  * table of `wordId`, `masteryScore`, `attempts`, `lastSeenAt`
  * filter by gradeBand, category
* Optional: small histogram of mastery scores.

---

## 🧪 Acceptance Criteria

* Mastery data persists across reloads per profile.
* Attempting words in any game mode updates mastery.
* Next word selection favors a mix of new + weaker/older words.
* Dev page displays and filters mastery correctly.

---

## 📦 Deliverables

* `src/mastery/types.ts`
* `src/mastery/MasteryStore.ts`
* `src/mastery/NextWordSelector.ts`
* `src/pages/MasteryDebugPage.tsx`
* Integration in game modes’ completion handlers

````

---

## TASK 025 `/tasks/task_sign_asset_hook.md`

```md
# Reading Hero – Sign Asset Hook (ASL Video Placeholder)
**Task ID:** RH_T_SIGN_ASSET_HOOK  
**Goal:** Add the plumbing for sign video assets to be attached to words and displayed side-by-side with emoji/image, without yet implementing recording or datasets.

---

## 📝 Summary

We’re planning professional ASL recording later. For now, we:

- Extend `WordEntry` to include `signVideoUrl`.
- Add layout support to show sign videos when available.
- Ensure the layout gracefully falls back to emoji-only when no sign is present.

This lets us drop in sign videos at any time without refactoring UI.

---

## 🎯 Requirements

### 1. Extend WordEntry

In `src/wordbank/types.ts`, ensure we have:

```ts
signVideoUrl?: string | null;
````

For now, default to `null` for all entries.

---

### 2. Word View Component

Create or update a central component:

`src/components/WordDisplay.tsx`

Responsibilities:

* Given a `WordEntry`, render:

  * Emoji or primary image
  * If `signVideoUrl` present:

    * Render `<video>` side-by-side:

      ```jsx
      <video
        src={word.signVideoUrl}
        autoPlay
        loop
        muted
        playsInline
      />
      ```
* Layout rules:

  * **With sign**: two-column arrangement (emoji left, sign right) on desktop; stacked on mobile.
  * **Without sign**: single centered emoji/image.

Replace any existing ad-hoc emoji/image rendering in game modes with `WordDisplay`.

---

### 3. Sample Hard-Coded Sign URLs

For development/testing, allow a small override file:

`src/wordbank/sign_overrides.ts`

```ts
export const SIGN_OVERRIDES: Record<string, string> = {
  // wordId -> video URL
  "dog": "/asl/signs/dog/sign_loop.mp4",
  "cat": "/asl/signs/cat/sign_loop.mp4",
};
```

On WordBank load, merge these into the corresponding `WordEntry.signVideoUrl` if present.

---

### 4. Responsive Behavior

Ensure `WordDisplay` behaves reasonably in:

* Desktop layout (sidebar visible)
* Mobile layout (hamburger sidebar):

  * Emoji and sign video stack vertically or fit in a single column.

Use CSS or existing layout system to avoid overflow and maintain decent size.

---

## 🧪 Acceptance Criteria

* Code compiles and `WordEntry` now has `signVideoUrl`.
* `WordDisplay` renders emoji-only when no sign video is available.
* If `SIGN_OVERRIDES` is provided and sample files exist, the sign video appears next to the emoji.
* All game modes using `WordDisplay` inherit this behavior automatically.

---

## 📦 Deliverables

* Updated `src/wordbank/types.ts`
* `src/wordbank/sign_overrides.ts`
* `src/components/WordDisplay.tsx`
* Replacement of old emoji/image rendering with `WordDisplay` in game screens

````

---

## TASK 026 `/tasks/task_rewards_basic_confetti_stickers.md`

```md
# Reading Hero – Basic Rewards (Confetti & Stickers)
**Task ID:** RH_T_REWARDS_BASIC  
**Goal:** Add a lightweight, low-text reward system (visual confetti + collectible stickers) to make practice feel more like a game without intrusive pop-ups.

---

## 📝 Summary

We want:

- Small, satisfying celebrations for progress (not every keypress).
- A simple “sticker collection” that grows as the learner practices.
- Controls to enable/disable reward effects in Settings.

---

## 🎯 Requirements

### 1. Reward Events Model

Create:

`src/rewards/types.ts`

```ts
export type RewardEventType = "word_complete" | "cluster_complete";

export interface RewardEvent {
  type: RewardEventType;
  profileId: string;
  wordIds: string[];
  clusterId?: string;
  timestamp: number;
}
````

A simple dispatcher:

`src/rewards/RewardBus.ts`

```ts
type RewardListener = (event: RewardEvent) => void;

export function emitReward(event: RewardEvent): void;
export function subscribe(listener: RewardListener): () => void;
```

---

### 2. Confetti Effect

Create component:

`src/rewards/ConfettiOverlay.tsx`

* Listens to RewardBus.
* On `word_complete` or `cluster_complete`, triggers a short confetti animation (e.g., using a tiny canvas library or CSS).
* Auto-hides after e.g. 800–1200ms.
* Respect Settings:

  * If `settings.rewards.confettiEnabled === false`, do nothing.

Mount `ConfettiOverlay` at the app root so it’s available on all game screens.

---

### 3. Sticker System

Define:

`src/rewards/stickers.ts`

* A small set of 10–20 stickers (emoji or small SVGs) with ids, names, and unlock rules.

  * E.g., “Star Reader” after 20 words, “Animal Lover” after 15 animal words, etc.

Sticker state:

`src/rewards/StickerStore.ts`

```ts
export interface Sticker {
  id: string;
  name: string;
  iconEmoji: string;
  description?: string;
}

export interface StickerUnlockState {
  stickerId: string;
  unlockedAt: number;
}

export interface ProfileStickersState {
  profileId: string;
  unlocked: StickerUnlockState[];
}
```

* Persist to `localStorage` per profile.
* Subscribe to RewardBus:

  * On events, check unlock conditions and grant new stickers.

---

### 4. Sticker Gallery Page

Create:

`src/pages/StickerGalleryPage.tsx` (route `/stickers`)

* Shows all stickers:

  * Locked vs unlocked.
* For unlocked ones:

  * Show large icon + name.
* Add a small link/button from the left sidebar or Settings.

---

### 5. Integration With Game Modes

On successful `GameItem` completion:

* Emit a `RewardEvent` with:

  * type: `"word_complete"`
  * `profileId`
  * `wordIds` from GameItem

On finishing a cluster (later when cluster logic is ready):

* Emit `"cluster_complete"` with `clusterId`.

---

### 6. Settings Integration

Extend Settings:

* Add toggles:

  * `Enable confetti`
  * `Enable stickers/rewards` (global on/off)

Ensure RewardBus listeners respect these flags.

---

## 🧪 Acceptance Criteria

* Confetti appears briefly on word/cluster completion when enabled.
* Stickers can be unlocked based on simple rules (e.g., N words completed).
* Sticker gallery shows locked/unlocked states.
* Settings can disable confetti and/or stickers.
* No modal pop-ups or blocking overlays; rewards feel lightweight and fun.

---

## 📦 Deliverables

* `src/rewards/types.ts`
* `src/rewards/RewardBus.ts`
* `src/rewards/ConfettiOverlay.tsx`
* `src/rewards/stickers.ts`
* `src/rewards/StickerStore.ts`
* `src/pages/StickerGalleryPage.tsx`
* Integration in game completion and Settings

```

---

If you tell me which **subset** you want your coding agent to tackle first (e.g., WordBank + Game Modes, or Mastery + Rewards), I can also generate a **master roadmap file** like `/tasks/roadmap_phase_01.md` that orders these and notes dependencies.
::contentReference[oaicite:0]{index=0}
```
