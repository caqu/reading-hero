# Master Plan: Motor-Plan Literacy Game (MVP)

**Working title:** `ASL Reading Hero` (changeable)
**Goal:** Build a browser-based MVP that helps children (especially deaf/HoH and low-phonological learners) connect **written words** to **meaning** via **visuals (pictures/signs)** and **motor plans (typing patterns)** — *without relying on sound*.

This document is written for a **master coding agent** that can create subtasks and recruit sub-agents.

---

## 0. Overall Product Vision (for the agent to understand)

### 0.1. Core Idea

Hearing kids often use sound (phonology) as a bridge:

> letters → sounds → known spoken word → meaning

Many deaf/HoH kids can’t rely on this, so we instead use:

> letters → **motor plan (typing sequence)** + visual → meaning

The app should:

* Show a **picture and/or ASL sign** for a word (e.g., CAT).
* Present a **typing task** where the child types the word using an **on-screen keyboard and/or physical keyboard**.
* Use **motor memory** (repeated typing sequence) as the “phonics alternative”.

### 0.2. MVP Scope (strict)

The MVP should **run in a browser** with **no backend required** (static hosting is fine) and support:

* A **fixed list** of ~10–20 simple words (e.g., cat, dog, sun, bed, mom, dad…).
* One primary game mode:

  * **Guided Typing Mode**:

    * Show picture of the word.
    * Show the word as blank tiles or lightly ghosted text.
    * Show an **on-screen keyboard**.
    * Provide **visual guidance** (e.g., highlight keys) so the child types the word.
    * Once the word is typed correctly, give simple positive feedback and go to next word.
* Basic **progress tracking** per session (e.g., words completed, attempts, accuracy) stored in memory (no login).
* Simple, intuitive UI that can be used on **desktop** first. (Mobile is a nice-to-have, not required.)

**Out of scope for MVP** (can be stubbed, but not required to be functional):

* User accounts, logins, or cloud storage.
* Teacher dashboards.
* Full ASL video library integration (can use placeholder images or a simple asset folder).
* Multiple game modes (we can sketch the structure for future modes, but only **one** must work end-to-end).

---

## 1. Technical Overview

### 1.1. Proposed Stack (modifiable by agent, but good default)

* **Front-end framework:** React + TypeScript
* **Build tooling:** Vite or Create React App (agent may choose)
* **Styling:** Simple CSS or CSS-in-JS (e.g., CSS Modules)
* **State management:** React state/hooks only (no heavy state library needed for MVP)
* **Deployment target:** Any static hosting (GitHub, AWS)

### 1.2. High-Level Architecture

* `src/`

  * `main.tsx` / `index.tsx` (entry)
  * `App.tsx` (routing + high-level layout)
  * `components/`

    * `GameScreen.tsx`
    * `WordCard.tsx` (handles image + word prompt)
    * `OnScreenKeyboard.tsx`
    * `FallingLetterGuide.tsx` (if used)
    * `ProgressBar.tsx`
    * `SettingsPanel.tsx` (basic toggles)
  * `data/`

    * `words.ts` (JSON-like word list)
  * `hooks/`

    * `useGameState.ts`
  * `types/`

    * `index.ts` (Word, GameState types)
  * `styles/`

    * `global.css` or equivalent
* No backend required.

---

## 2. Functional Requirements (MVP)

### 2.1. User Flow

1. User opens the app → sees a **home screen**.
2. Press **“Start”** → navigates to **Game Screen**.
3. Game Screen for a word:

   * Shows **picture** (placeholder image) for the word.
   * Option: also show placeholder for **sign image/GIF** (can be a static image for MVP).
   * Shows **blank tiles** or lightly ghosted **CAT** (gray) to indicate letter slots.
   * Shows an **on-screen keyboard**.
   * User types (clicks or uses physical keys) to spell the word.
4. System checks input:

   * If **correct letter** next in sequence → reveal letter in tile; provide small positive feedback.
   * If **incorrect** → gentle visual indication (e.g., shake, brief red outline) and allow retry.
5. When the full word is typed correctly:

   * Play simple celebration (green flash, checkmark, maybe a small animation).
   * Increment progress and move to the next word (or show “You finished!” if all done).
6. User can exit back to home from a simple **menu button**.

### 2.2. Game Logic

* The game should accept input both from:

  * On-screen key clicks.
  * Physical keyboard inputs (for users who can touch-type).
* For each word:

  * Maintain an index `currentLetterIndex`.
  * On key press:

    * If pressed key matches `word[currentLetterIndex]` (case-insensitive):

      * Advance index, reveal that letter in the UI.
    * Else:

      * Show non-intrusive error feedback (but don’t advance index).
* When `currentLetterIndex === word.length`:

  * Trigger success state.
  * Delay briefly, then move to next word or show completion screen.

### 2.3. Data / Content Model

Define a `Word` type:

```ts
type Word = {
  id: string;
  text: string;          // e.g., "cat"
  imageUrl: string;      // path to image asset
  signImageUrl?: string; // optional; can be same as imageUrl for MVP
  difficulty?: 'easy' | 'medium' | 'hard';
};
```

For MVP, maintain a **hardcoded array** (`words.ts`) with ~10–20 items.

---

## 3. Non-Functional Requirements

* **Performance:** Load quickly on a typical laptop; no heavy assets.
* **Accessibility:**

  * Clear visual feedback (no reliance on sound).
  * High-contrast options if possible (simple toggle or default).
  * Keyboard accessible for basic navigation.
* **Internationalization:** Not needed for MVP; assume English UI and words.
* **Resilience:** The app should not crash on invalid input; handle unexpected states gracefully.

---

## 4. Task 0 – Meta-Planning Task for Master Agent

> **Task ID:** T0
> **Title:** Analyze spec, confirm scope, and generate detailed execution plan

**Goal:**
Create a detailed, actionable breakdown of all coding work required to produce the MVP described in this document, then spawn sub-agents to implement each part.

**Inputs:**

* This `MASTER_PLAN.md` file.
* Default assumptions about environment (e.g., ability to create Git repo, install dependencies).

**Required Outputs:**

1. **Finalized Tech Stack Decision**

   * Confirm or adjust:

     * Framework (default: React + TypeScript).
     * Build tool (default: Vite).
     * Testing approach (default: Jest + React Testing Library or similar).
   * Justify changes if they diverge from the defaults above.

2. **Repository Initialization Plan**

   * Steps to:

     * Initialize a Git repository.
     * Initialize the chosen front-end template.
     * Set up basic project structure (folders, entry point).
   * File/folder sketch (with filenames) ready for implementation.

3. **Task Breakdown (T1, T2, …)**

   Create a task list with dependencies, each with:

   * Task ID (e.g., `T1_UI_Scaffold`, `T2_Game_State`, etc.)
   * Short title.
   * Summary.
   * Input & output expectations.
   * Skills required (e.g., “React/TypeScript”, “CSS”, “Testing”).
   * Dependencies (which tasks must be done first).

   **At minimum, include tasks for:**

   * **T1:** Project setup & tooling
   * **T2:** Data model & word list
   * **T3:** Core game state & logic
   * **T4:** UI components (game screen, keyboard, tiles, feedback)
   * **T5:** Input handling (on-screen + physical keyboard)
   * **T6:** Simple progress tracking (per session)
   * **T7:** Basic styling & layout
   * **T8:** Basic tests (key logic units + a simple integration test)
   * **T9:** Build & deploy configuration (e.g., GitHub/AWS)

4. **Sub-Agent Assignment Strategy**

   * For each task, specify whether it can be executed **in parallel** or must be **sequential**.
   * Provide a short note on:

     * “How to verify this task is done” (acceptance criteria).
     * “What artifacts to produce” (e.g., which files, main functions, or components to output).

5. **Risk / Complexity Notes**

   * Identify any potential tricky parts in the MVP (e.g., on-screen keyboard responsiveness, integrating both mouse & keyboard input).
   * Suggest simplifications if time is short.

**Acceptance Criteria for Task 0:**

* There is a **clear, ordered list of tasks T1–T9 (or more)**.
* Each task has enough detail that a coding agent can complete it **without further clarification**.
* All required features from the MVP scope are covered by at least one task.
* The plan fits within a hackathon-level effort but uses **parallelization** where possible.

---

## 5. Suggested Subtasks (Outline for T0 to refine)

> These are suggested; Task 0 may refine/rename them.

### T1 – Project Setup & Scaffolding

* Initialize React + TypeScript project (using Vite or CRA).
* Configure linting + basic formatting (optional but preferred).
* Verify local dev server runs with a “Hello, ASL Reading Hero” placeholder.

### T2 – Data Model & Word List

* Create `Word` type.
* Implement `data/words.ts` with a small curated list.
* Ensure each word has a placeholder image path.

### T3 – Core Game State & Logic

* Implement `useGameState` hook:

  * Manage current word index, current letter index, attempts, successes.
  * Functions: `startGame`, `nextWord`, `handleKeyPress`, `resetGame`.
* Write unit tests for this logic.

### T4 – UI Layout & Game Screen

* Build `App` with two main views:

  * `HomeScreen` (Start button).
  * `GameScreen` (main gameplay).
* Implement `WordCard` (shows image and, optionally, ghosted word/tiles).
* Implement `GameScreen` layout (word prompt + tiles + keyboard + feedback).

### T5 – On-Screen Keyboard & Input Handling

* Implement `OnScreenKeyboard` component:

  * Renders standard QWERTY layout.
  * Emits key events when clicked.
* Hook up physical keyboard events (e.g., `keydown`) to game logic.
* Ensure inputs from both places route through `handleKeyPress`.

### T6 – Feedback & Progress Tracking

* Add real-time progress display:

  * e.g., `Word 3 of 10`, `Correct letters`, `Error count`.
* Add visual feedback for:

  * Correct letter (e.g., gentle highlight).
  * Incorrect letter (e.g., brief shake or red highlight).
* Add success transition between words (brief delay before next).

### T7 – Styling & Basic Theming

* Implement simple, kid-friendly theme:

  * Large fonts.
  * Clear buttons.
  * High contrast.
* Ensure layout works on common desktop resolutions.

### T8 – Testing & QA

* Write tests for:

  * Game state transitions.
  * Input handling (correct vs incorrect letter).
* Basic snapshot or rendering test for `GameScreen`.

### T9 – Build & Deployment

* Configure build command for chosen bundler.
* Add simple deploy config (e.g., instructions for `npm run build` + static hosting).
* Verify build output runs as expected.

---

## 6. Future Extensions (Not Required for MVP, for context only)

* Additional game modes:

  * Tile drag-and-drop matching.
  * Falling-letter “piano” mode.
* Integration of real ASL video clips from a library.
* Teacher dashboard & custom word list creation.
* Saving progress per user.
* Mobile-optimized layout.

---

## 7. Instructions to the Master Coding Agent

1. **Start with Task 0 (T0)** exactly as defined.
2. Produce:

   * A finalized task list and dependency graph.
   * Concrete file/component names for each task.
3. After T0 is complete, **spawn sub-agents** for T1–T9 (or refined tasks), running tasks in parallel wherever dependencies allow.
4. Each sub-agent should:

   * Work within the chosen stack.
   * Follow TypeScript best practices.
   * Include brief inline comments for non-obvious logic.
   * Provide a short summary of what was implemented and how it can be tested.
5. Ensure that by the end:

   * The project builds and runs.
   * The specified MVP flow is usable end-to-end.
   * There’s at least minimal documentation (`README.md`) describing how to install, run, and build the project.
