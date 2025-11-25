# **improve_feedback_system.md**

**Task ID:** `T_FEEDBACK_REDESIGN`
**Goal:** Redesign the in-game feedback (positive and negative) to be gentle, non-verbal, and non-intrusive, removing full-screen overlays and replacing them with subtle visual cues and confetti animations.

---

## 📝 **Task Summary**

The current feedback system uses large modal-style overlays that block the keyboard, sign image, and letter tiles. This is too disruptive for gameplay and inappropriate for young deaf/HoH learners who may not read “Try Again” or “Great Job”.

This task requires redesigning the feedback interactions so they are:

* 🟢 gentle
* 🟢 non-verbal (visual only)
* 🟢 child-friendly
* 🟢 lightweight (no screen takeover)
* 🟢 consistent with the rest of the UI

The agent should produce a new **modular feedback system** and apply it to:

* A. Incorrect key press
* B. Correct letter press
* C. Completing the full word

---

# 🎯 **Detailed Requirements**

## **A. WRONG LETTER FEEDBACK (Soft gentle cue)**

Replace the current shaking box + “Try Again” modal.

### New behavior:

* No text (“Try Again” removed)
* No modal overlay
* No full-screen shake
* Instead:

### Implement:

1. **Shake the incorrect key on the on-screen keyboard**

   * The key the user *pressed* should do a small 100–150ms shake animation.
   * Use CSS transform: small jitter left/right.
   * Key briefly turns soft red (#f8d7da or similar), then fades back to normal.

2. **Glow or pulse the correct key**

   * For 300ms, apply a soft orange or yellow pulse (already partially implemented).
   * Reinforce guidance toward correct letter.

3. **Optional**: A small, subtle red “x” near the tile area for 300ms fade-out (not required, optional).

### Never:

* Cover screen
* Show text
* Interrupt gameplay

---

## **B. CORRECT LETTER FEEDBACK**

(Current behavior: tile turns green — keep that, improve subtly.)

### Implement:

* Keep green fill for correct letters
* Add a gentle **scale-up micro animation** (1.05x for 120ms)
* No text
* No overlays

**Do NOT** confetti on each correct letter — only on word completion.

---

## **C. FULL WORD COMPLETION FEEDBACK**

Current behavior: giant modal that blocks everything.

### Replace with:

* 🎉 **Confetti burst** (recommended: lightweight JS or CSS animation)
* No text
* No modal
* Do NOT block the screen

### Required specifics:

* Confetti should be:

  * lightweight (prefer canvas or CSS-based)
  * automatically disappear within 600–1000ms
  * not require user to click “OK”
* After confetti ends, automatically move to next word after a 400–600ms delay.

### Allowed libraries:

* `canvas-confetti` (npm package)
* OR pure CSS particles if agent prefers

Agent should choose the best minimal dependency approach.

### Position:

* Confetti should originate from top center (not covering sign/video fully)
* Should not obscure keyboard
* Should not obscure sign image or tiles significantly

---

# 🧱 **Implementation Requirements**

### 1. Build a new feedback manager component

Create:

```
src/components/FeedbackSystem.tsx
```

This component should handle:

* incorrect feedback animations
* correct letter animations
* full-word confetti

### 2. Replace old feedback logic in GameScreen

Remove:

* Try Again modal
* Great Job modal
* Large blocks that overlay the UI

Replace with:

* Inline animations
* Confetti event

### 3. Add animation classes

Create CSS classes for:

* `.key-wrong-shake`
* `.key-wrong-flash`
* `.key-highlight-correct`
* `.letter-tile-correct-animate`
* `confetti-container` if needed

### 4. Add a hook or utility:

```
useFeedback()
```

that provides:

* `triggerWrongKey(key)`
* `triggerCorrectLetter(tileIndex)`
* `triggerWordComplete()` (fires confetti)

### 5. Ensure accessibility

* All animations must be <= 1 second
* No flashing faster than 3 Hz
* No harsh red/green flashing
* Animations should be subtle, gentle

---

# 🧪 **Acceptance Criteria**

This task is complete when:

### Wrong key press:

* The wrong on-screen key shakes gently
* No text appears
* No overlays
* Correct key gently pulses afterwards

### Correct letter press:

* Letter tile fills green
* Tile does a soft 1.05x bounce
* No text appears

### Full word complete:

* Confetti appears for < 1 second
* No modal
* Screen remains interactive
* Auto-advances to next word

### Code:

* Old modal components fully removed
* Feedback logic centralized
* Feedback component isolated and reusable

---

# 📦 **Deliverables for the Agent**

* Updated GameScreen
* New FeedbackSystem component
* New animations (CSS or keyframes)
* Confetti implementation
* Removed old modals
* Verified in Safari/Chrome/Firefox
