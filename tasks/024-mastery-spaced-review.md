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
