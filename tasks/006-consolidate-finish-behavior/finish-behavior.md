# **consolidate_finish_screen.md**

**Task ID:** `T_CONSOLIDATE_FINISH_SCREEN`
**Goal:** Replace the current “success → return to start” behavior with a single unified **Finish Screen** that appears whenever the user completes the full sequence of words. The Finish Screen should display the new app logo and provide a clear **Restart** button.

---

## 📝 Summary

The app currently:

1. Shows a separate “Success” screen (with a message).
2. Then navigates back to the older “Start” screen that we removed from the intended flow.

We want to simplify this into **one unified screen**:

* **Finish Screen** (formerly “Start Screen,” but renamed and repurposed)
* The screen should appear only at the end of the word list.
* The Finish Screen must include a **Restart button** that resets the game.
* The Finish Screen must display the new logo located at:

```
public/assets/ASL-Reading-Hero-logo.png
```

This screen will function as both the entry point and the post-completion endpoint.

---

# 🎯 Detailed Requirements

## A. Replace Start + Success screens with a single **Finish Screen**

### The Finish Screen should:

* Display the logo (large, centered)
* Include a short, simple positive visual or text indicator such as:

  * “You’re Done!”
  * or a visual-only celebration (no large overlays)
* Include a **Restart** button
* Include a **Play** or **Start** button **only** on first app load

### Behavior:

* On app launch → Finish Screen (acts as the initial entry screen)
* After completing all words → Finish Screen (acts as completion screen)

---

## B. Design Requirements

### 1. Logo Placement

Use the file:

```
public/assets/ASL-Reading-Hero-logo.png
```

Place it:

* Centered horizontally
* Near the top of the screen
* Sized appropriately (agent may choose responsive dimensions)

### 2. Button Layout

At least one prominent button:

```
[ Restart ]
```

If desired, agent may include:

```
[ Start ]
```

but typically one button that reloads the game list is enough.

Buttons should be:

* Large
* Kid-friendly
* Centered
* High contrast
* Responsive

### 3. Screen Style

The Finish Screen should be:

* Clean
* Non-cluttered
* Accessible
* Centered vertically and horizontally
* Consistent with the overall app theme

---

## C. Functional Requirements

### 1. Replace the old “success” modal/overlay

Remove all references to:

* “Great Job” modal
* Overlay components
* Auto-navigation popups

### 2. Add a new route or conditional UI panel

The coding agent may choose:

* A dedicated React Component: `FinishScreen.tsx`
* A route (if using React Router)
* Or a conditional render inside `App` or `GameScreen`

### 3. Restart Logic

The Restart button should:

* Reset game state
* Reinitialize word sequence (including emoji shuffle)
* Navigate to the first word of the new sequence
* Not reload the browser tab

### 4. Ensure smooth navigation

Transitions from:

* App startup → Finish Screen
* Completion of final word → Finish Screen

should be smooth and instantaneous.

---

## D. Code Updates Required

The coding agent must:

1. Create or update `FinishScreen.tsx` with:

   * Logo import
   * Layout
   * Restart logic
2. Update the main app flow:

   * Remove or disable old Start Screen
   * Remove or disable Success modal
   * Update GameScreen to detect "end of word list" and route to Finish Screen
3. Update styling (CSS modules or global styles)
4. Ensure the logo file is referenced correctly:

   ```
   import logo from "/assets/ASL-Reading-Hero-logo.png";
   ```
5. Update any navigation logic impacted
6. Remove unused components

---

# 🧪 Acceptance Criteria

This task is complete when:

1. The old “Start” and “Success” screens no longer appear.
2. A single **Finish Screen** appears:

   * on app launch
   * after completing all words
3. The Finish Screen displays the new logo centered at the top.
4. A Restart button successfully resets the game and starts a new sequence.
5. Layout is responsive, clean, and does not overlap other UI.
6. No leftover modals or blocking overlays remain in the codebase.
7. The app enters and exits gameplay through this one unified screen.

---

# 📦 Deliverables

* New or updated `FinishScreen.tsx`
* Updated navigation logic
* Updated state reset logic
* Removal of old success / start components
* Verified working logo
* Verified working Restart button
