
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
