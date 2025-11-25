# Task 0: Execution Plan for MotorKeys MVP

**Generated:** 2025-11-25
**Status:** APPROVED

---

## 1. Finalized Tech Stack Decision

### Core Technologies
- **Framework:** React 18+ with TypeScript 5+
- **Build Tool:** Vite 5+ (faster than CRA, better DX, optimized for modern browsers)
- **Package Manager:** npm (standard)
- **Testing:** Vitest + React Testing Library (Vite-native, faster than Jest)
- **Styling:** CSS Modules (scoped, type-safe, no runtime overhead)

### Rationale
- **Vite over CRA:** Faster HMR, better build performance, native ESM support
- **Vitest over Jest:** Native Vite integration, faster test execution, compatible API
- **CSS Modules:** Simple, no extra dependencies, good TypeScript support

---

## 2. Repository Initialization Plan

### Directory Structure
```
reading-hero/
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Root component with routing
│   ├── components/
│   │   ├── HomeScreen.tsx       # Landing page with Start button
│   │   ├── GameScreen.tsx       # Main game container
│   │   ├── WordCard.tsx         # Displays image + word prompt
│   │   ├── LetterTiles.tsx      # Shows blank/revealed letters
│   │   ├── OnScreenKeyboard.tsx # Virtual keyboard
│   │   ├── ProgressBar.tsx      # Progress indicator
│   │   └── FeedbackOverlay.tsx  # Success/error animations
│   ├── hooks/
│   │   └── useGameState.ts      # Core game logic hook
│   ├── data/
│   │   └── words.ts             # Word list with metadata
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── styles/
│   │   ├── global.css           # Global styles
│   │   └── variables.css        # CSS custom properties
│   └── assets/
│       └── images/              # Word images (placeholders)
├── public/                      # Static assets
├── tests/
│   ├── unit/                    # Unit tests
│   └── integration/             # Integration tests
├── tasks/                       # Task documentation (existing)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

### Initialization Steps
1. Initialize Vite React-TypeScript template
2. Install dependencies (React, TypeScript, Vitest, etc.)
3. Configure TypeScript strict mode
4. Set up Vitest configuration
5. Create folder structure
6. Initialize Git with initial commit

---

## 3. Task Breakdown with Dependencies

### Task Dependency Graph
```
T1 (Setup)
  ↓
T2 (Data Model) ──┐
  ↓               ↓
T3 (Game Logic) → T4 (UI Components) ──┐
  ↓               ↓                     ↓
T5 (Input) ────→ T6 (Feedback) ──────→ T7 (Styling)
                                        ↓
                                      T8 (Testing)
                                        ↓
                                      T9 (Deploy)
```

### Parallelization Opportunities
- **After T1:** T2 can start independently
- **After T2:** T3 and initial T4 work can run in parallel
- **After T3:** T5 and T6 can partially overlap
- **After T4-T6:** T7 styling work can happen concurrently
- **After T7:** T8 testing can verify all integrated work

---

## 4. Detailed Task Specifications

### T1: Project Setup & Scaffolding
**Task ID:** T1_PROJECT_SETUP
**Dependencies:** None
**Skills:** Node.js, npm, Vite, Git
**Can Parallelize:** No (foundation for everything)

**Objectives:**
1. Initialize Vite React-TypeScript project
2. Configure TypeScript with strict mode
3. Set up Vitest + React Testing Library
4. Configure ESLint + Prettier (basic)
5. Create folder structure
6. Verify dev server runs with placeholder

**Acceptance Criteria:**
- `npm run dev` launches dev server on localhost
- TypeScript compiles without errors
- ESLint configured with React rules
- Basic "Hello MotorKeys" renders

**Artifacts:**
- `package.json` with all dependencies
- `vite.config.ts` configured
- `vitest.config.ts` configured
- `tsconfig.json` with strict mode
- `.eslintrc.cjs` (optional but recommended)
- Placeholder `App.tsx` rendering

**Complexity:** Low
**Estimated Effort:** 30-45 minutes

---

### T2: Data Model & Word List
**Task ID:** T2_DATA_MODEL
**Dependencies:** T1 (needs TypeScript setup)
**Skills:** TypeScript, basic asset management
**Can Parallelize:** After T1, before T3

**Objectives:**
1. Define `Word` type with all properties
2. Define `GameState` type
3. Create word list with 10-15 words
4. Add placeholder images or image URLs
5. Export typed data structure

**Acceptance Criteria:**
- `types/index.ts` exports `Word`, `GameState` types
- `data/words.ts` exports typed word array
- Each word has valid image path/URL
- Type checking passes

**Artifacts:**
- `src/types/index.ts`:
  ```typescript
  export type Word = {
    id: string;
    text: string;
    imageUrl: string;
    signImageUrl?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  };

  export type GameState = {
    currentWordIndex: number;
    currentLetterIndex: number;
    words: Word[];
    attempts: number;
    correctWords: number;
    isComplete: boolean;
  };
  ```
- `src/data/words.ts`: Array of 10-15 Word objects
- Placeholder images in `src/assets/images/` or use external URLs

**Complexity:** Low
**Estimated Effort:** 20-30 minutes

---

### T3: Core Game State & Logic
**Task ID:** T3_GAME_LOGIC
**Dependencies:** T2 (needs Word type)
**Skills:** React hooks, TypeScript, game logic
**Can Parallelize:** No (critical path)

**Objectives:**
1. Implement `useGameState` custom hook
2. Handle game initialization
3. Implement `handleKeyPress` logic
4. Implement `nextWord` logic
5. Implement `resetGame` logic
6. Write unit tests for all logic

**Acceptance Criteria:**
- Hook correctly initializes game state
- `handleKeyPress` validates input and advances state
- Correct letters advance `currentLetterIndex`
- Incorrect letters don't advance
- Word completion triggers `nextWord`
- All logic covered by unit tests (>80% coverage)

**Artifacts:**
- `src/hooks/useGameState.ts`:
  ```typescript
  export function useGameState(words: Word[]) {
    const [state, setState] = useState<GameState>({...});

    const handleKeyPress = (key: string) => {...};
    const nextWord = () => {...};
    const resetGame = () => {...};

    return { state, handleKeyPress, nextWord, resetGame };
  }
  ```
- `tests/unit/useGameState.test.ts`: Comprehensive unit tests

**Complexity:** Medium-High (core logic)
**Estimated Effort:** 60-90 minutes

---

### T4: UI Layout & Game Screen Components
**Task ID:** T4_UI_COMPONENTS
**Dependencies:** T2 (needs Word type), partially T3
**Skills:** React, TypeScript, component design
**Can Parallelize:** Partially (can start before T3 complete)

**Objectives:**
1. Create `HomeScreen` component with Start button
2. Create `GameScreen` container component
3. Create `WordCard` component (image + prompt)
4. Create `LetterTiles` component (blank/revealed letters)
5. Create `ProgressBar` component
6. Create `FeedbackOverlay` component (success/error)
7. Set up basic routing/navigation in `App.tsx`

**Acceptance Criteria:**
- All components render without errors
- Components accept typed props
- `GameScreen` orchestrates child components
- Navigation between Home and Game works
- Components are modular and testable

**Artifacts:**
- `src/components/HomeScreen.tsx`: Landing page
- `src/components/GameScreen.tsx`: Main game container
- `src/components/WordCard.tsx`: Displays word image
- `src/components/LetterTiles.tsx`: Shows letter slots
- `src/components/ProgressBar.tsx`: Progress indicator
- `src/components/FeedbackOverlay.tsx`: Animation overlay
- `src/App.tsx`: Routing logic

**Complexity:** Medium
**Estimated Effort:** 60-75 minutes

---

### T5: On-Screen Keyboard & Input Handling
**Task ID:** T5_INPUT_HANDLING
**Dependencies:** T3 (needs game logic), T4 (needs GameScreen)
**Skills:** React, event handling, keyboard APIs
**Can Parallelize:** After T3, can work alongside T6

**Objectives:**
1. Create `OnScreenKeyboard` component
2. Render QWERTY layout (letters only for MVP)
3. Handle on-screen key clicks
4. Handle physical keyboard events
5. Route both inputs through `handleKeyPress`
6. Add visual feedback for key presses

**Acceptance Criteria:**
- Keyboard renders all letters A-Z
- Clicking virtual keys triggers game logic
- Physical keyboard presses trigger game logic
- Both inputs behave identically
- Key highlighting works on press
- Keyboard is accessible (tab navigation)

**Artifacts:**
- `src/components/OnScreenKeyboard.tsx`:
  ```typescript
  type OnScreenKeyboardProps = {
    onKeyPress: (key: string) => void;
    highlightKey?: string;
  };
  ```
- Event listener setup in `GameScreen`
- CSS for keyboard layout (grid-based)

**Complexity:** Medium
**Estimated Effort:** 45-60 minutes

---

### T6: Feedback & Progress Tracking
**Task ID:** T6_FEEDBACK_PROGRESS
**Dependencies:** T3, T4, T5
**Skills:** React, animations, CSS
**Can Parallelize:** After T5, alongside T7

**Objectives:**
1. Add real-time progress display (words completed, current word)
2. Implement correct letter feedback (green highlight, sound off)
3. Implement incorrect letter feedback (shake, red outline)
4. Implement word completion animation
5. Add transition delay between words
6. Track and display session statistics

**Acceptance Criteria:**
- Progress bar updates as words complete
- Correct letters show positive visual feedback
- Incorrect letters show error feedback
- Word completion shows celebration animation
- Auto-advance to next word after delay
- No crashes on edge cases

**Artifacts:**
- Enhanced `ProgressBar` component with state
- Animation CSS in component modules
- `FeedbackOverlay` component implementation
- Session stats display in `GameScreen`

**Complexity:** Medium
**Estimated Effort:** 45-60 minutes

---

### T7: Styling & Basic Theming
**Task ID:** T7_STYLING_THEME
**Dependencies:** T4, T5, T6 (needs all UI components)
**Skills:** CSS, design, accessibility
**Can Parallelize:** After T4-T6, alongside T8

**Objectives:**
1. Create CSS custom properties for theming
2. Implement kid-friendly color scheme
3. Set large, readable fonts
4. Ensure high contrast (WCAG AA minimum)
5. Make keyboard visually appealing
6. Ensure responsive layout for desktop (1024px+)
7. Add hover/active states

**Acceptance Criteria:**
- All text is large and readable (18px+ body)
- High contrast between text and background
- Colors are vibrant but not overwhelming
- Keyboard is visually clear and inviting
- Layout works on 1024x768 and up
- No visual bugs or overlaps

**Artifacts:**
- `src/styles/variables.css`: CSS custom properties
- `src/styles/global.css`: Base styles
- Component-specific `.module.css` files
- Consistent spacing and alignment

**Complexity:** Medium
**Estimated Effort:** 45-60 minutes

---

### T8: Testing & QA
**Task ID:** T8_TESTING_QA
**Dependencies:** T3-T7 (needs complete features)
**Skills:** Vitest, React Testing Library, QA
**Can Parallelize:** After T7, before T9

**Objectives:**
1. Write unit tests for `useGameState` (if not done in T3)
2. Write component tests for all major components
3. Write integration test for full game flow
4. Test keyboard input handling
5. Test edge cases (empty input, rapid keys, etc.)
6. Manual QA testing checklist

**Acceptance Criteria:**
- Unit test coverage >80% for game logic
- Component tests for all major components
- At least one full integration test (start to finish)
- All tests pass
- No console errors during manual testing
- Game playable end-to-end

**Artifacts:**
- `tests/unit/useGameState.test.ts`
- `tests/unit/components/*.test.tsx`
- `tests/integration/GameFlow.test.tsx`
- QA checklist document

**Complexity:** Medium
**Estimated Effort:** 60-90 minutes

---

### T9: Build & Deployment Configuration
**Task ID:** T9_BUILD_DEPLOY
**Dependencies:** T8 (needs working, tested app)
**Skills:** Vite, static hosting, DevOps basics
**Can Parallelize:** No (final step)

**Objectives:**
1. Configure Vite build settings
2. Optimize bundle size
3. Test production build locally
4. Create deployment instructions
5. Set up GitHub / AWS config (choose one)
6. Document deployment process

**Acceptance Criteria:**
- `npm run build` produces optimized bundle
- Production build runs correctly
- Bundle size is reasonable (<500KB initial)
- Deployment instructions are clear
- App is deployable to static hosting
- README includes build/deploy steps

**Artifacts:**
- Configured `vite.config.ts` for production
- `public/` folder with necessary static assets
- Deployment config file Imagine Learning's OTKv2 (`resources.yaml`)
- Updated `README.md` with deployment steps

**Complexity:** Low-Medium
**Estimated Effort:** 30-45 minutes

---

## 5. Sub-Agent Assignment Strategy

### Execution Plan
1. **Sequential start:** Execute T1 first (foundation)
2. **First parallelization:** After T1, start T2
3. **Second parallelization:** After T2, spawn agents for T3 and T4 (partial)
4. **Third parallelization:** After T3, spawn agents for T5 and T6
5. **Fourth parallelization:** After T4-T6, spawn agents for T7 and T8
6. **Final step:** Execute T9 sequentially

### Verification Strategy
Each task includes:
- Clear acceptance criteria
- Specific artifact list
- Testing requirements
- Integration points with other tasks

### Quality Gates
- After T1: Dev server must run
- After T3: Unit tests must pass
- After T7: Manual visual QA pass
- After T8: All tests pass, no console errors
- After T9: Production build verified

---

## 6. Risk & Complexity Analysis

### High-Risk Areas
1. **On-screen keyboard layout (T5):**
   - **Risk:** Complex CSS grid, mobile responsiveness
   - **Mitigation:** Start with simple desktop layout, use CSS Grid

2. **Physical + virtual keyboard sync (T5):**
   - **Risk:** Event handling conflicts, duplicate inputs
   - **Mitigation:** Single event handler, clear event flow

3. **Animation timing (T6):**
   - **Risk:** Animations feel sluggish or too fast
   - **Mitigation:** Make timing configurable, test with users

### Medium-Risk Areas
1. **Game state management (T3):**
   - **Risk:** Complex state transitions, edge cases
   - **Mitigation:** Comprehensive unit tests, state machine approach

2. **Image asset management (T2):**
   - **Risk:** Missing images, broken paths
   - **Mitigation:** Use placeholders, validate paths

### Low-Risk Areas
- T1 (standard setup)
- T7 (styling, worst case is ugly but functional)
- T9 (build process is well-documented)

### Simplification Options (if time-constrained)
1. **Skip ASL sign images:** Use only word pictures
2. **Simplify keyboard:** Single-row alphabet instead of QWERTY
3. **Reduce word list:** 5-8 words instead of 10-15
4. **Minimal styling:** Focus on functionality over polish
5. **Skip physical keyboard:** On-screen only

---

## 7. Success Criteria

### Minimum Viable Product Must:
1. ✅ Run in a browser without backend
2. ✅ Display 10+ words with images
3. ✅ Show on-screen keyboard
4. ✅ Accept typed input (both virtual and physical)
5. ✅ Validate input letter-by-letter
6. ✅ Show visual feedback (correct/incorrect)
7. ✅ Advance through word list
8. ✅ Display completion message
9. ✅ Build to static assets
10. ✅ Be deployable to GitHub/AWS (OTKv2)

### Quality Benchmarks:
- No critical bugs
- No console errors in production
- Loads in <3 seconds on standard connection
- Works on Chrome, Firefox, Safari (desktop)
- Basic accessibility (keyboard nav, high contrast)

---

## 8. Timeline Estimate

**Total Estimated Effort:** 7-10 hours (with parallelization)

**Phase Breakdown:**
- **Phase 1 (Setup):** T1, T2 → 1 hour
- **Phase 2 (Core):** T3, T4 → 2-3 hours
- **Phase 3 (Interaction):** T5, T6 → 2 hours
- **Phase 4 (Polish):** T7 → 1 hour
- **Phase 5 (Quality):** T8 → 1.5 hours
- **Phase 6 (Deploy):** T9 → 0.5 hours

**With Sub-Agents:** Can complete in 4-6 hours of wall-clock time

---

## 9. Next Steps

1. ✅ Review and approve this plan (T0 complete)
2. → Execute T1: Project setup
3. → Spawn sub-agents for parallel execution
4. → Monitor progress and integration
5. → Perform final QA
6. → Deploy MVP

---

**End of Execution Plan**
