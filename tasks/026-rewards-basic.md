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
