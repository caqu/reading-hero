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
