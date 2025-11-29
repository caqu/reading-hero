# ✅ **TASK 1 — Create `/record-signs` Hidden Recording Route**

**Goal:** Add a dedicated hidden route for professional ASL recording.

## Requirements

### 1. Create Route

Add new page:

```
src/pages/RecordSignsPage.tsx
```

Accessible ONLY by URL:

```
/record-signs
```

Do NOT add it to sidebar or nav.

### 2. Page Layout

Components:

* Word prompt (large, centered)
* Video preview box (live camera)
* Status area ("Next word in 3… 2… 1…")
* Pause / Continue buttons (small, bottom-left)
* Recording indicator (red dot)
* Optional: show remaining count (e.g., "42/228 recorded")

### 3. Load Full Inventory

Use a dedicated list:

```
src/data/recordingWordList.ts
```

Initially: your 228 emoji words.

Later scalable to thousands.

### Acceptance Criteria

✔ Hidden route loads
✔ Shows recording interface skeleton
✔ Displays the next unrecorded word
