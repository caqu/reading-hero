# Task 050-06: Motor-Learning Metrics Tracking - COMPLETED

**Status**: ✅ COMPLETED
**Completion Date**: 2025-11-30
**Dependencies**: Task 050-05 (Profile extension with motor metrics fields)

## Overview
This task implemented comprehensive motor-learning metrics tracking during keyboard input to inform adaptive sequencing decisions. The system now tracks left/right hand errors, common letter mistakes, row transition speed, and typing speed baselines.

## Implementation Summary

### 1. Motor Metrics Utility (`src/utils/motorMetrics.ts`)
Created a comprehensive utility module with the following functions:

#### Helper Functions
- `isLeftHandKey(key: string): boolean` - Identifies keys pressed by the left hand
- `isRightHandKey(key: string): boolean` - Identifies keys pressed by the right hand
- `getKeyboardRow(key: string): KeyboardRow` - Determines which row a key is on (top/home/bottom)
- `isRowTransition(key1: string, key2: string): boolean` - Detects row transitions

#### Core Tracking Functions
- `updateMotorMetrics(profile, keystrokes, wordTime, letterCount)` - Updates all motor metrics:
  - Left/right hand error counts
  - Common letter error tracking by expected letter
  - Row transition speed with rolling average (90% old, 10% new)

- `updateTypingSpeedBaseline(profile, wordTime, letterCount)` - Calculates typing speed in ms per letter
  - Uses rolling average for ongoing updates
  - Initializes directly on first word

- `updateErrorBaseline(profile, errorCount)` - Tracks average errors per word
  - Rolling average approach
  - Helps identify struggling learners

### 2. Keystroke Data Type
```typescript
export interface KeystrokeData {
  key: string;           // The key that was pressed
  timestamp: number;     // When it was pressed (milliseconds)
  isCorrect: boolean;    // Whether it was the correct key
  expectedKey: string;   // What key was expected
}
```

### 3. Integration in App.tsx

#### Keystroke Tracking (Lines 216-287)
- Added `wordKeystrokes` state to track all keystrokes for current word
- Keystrokes are captured in `handleKeyPress` with timestamp, correctness, and expected key
- State is reset when moving to a new word

#### Profile Update on Word Completion (Lines 325-401)
After each word is completed:
1. Motor metrics are updated based on all keystrokes
2. Typing speed baseline is recalculated
3. Error baseline is updated
4. All metrics are saved to the active profile

### 4. Testing

#### Unit Tests (`src/utils/motorMetrics.test.ts`)
Comprehensive test suite with 24 tests covering:
- Hand detection (left/right)
- Row detection (top/home/bottom)
- Row transition detection
- Motor metrics updates
- Typing speed baseline calculation
- Error baseline calculation
- Integration scenarios

**Test Results**: ✅ All 24 tests passing

#### Integration Test (`test-motor-integration.js`)
Manual integration test simulating complete typing flow:
- Tracks left/right hand errors
- Detects common letter mistakes
- Calculates typing speed and error baselines
- Validates all metrics are tracked correctly

**Integration Test Results**: ✅ All validations passing

### 5. TypeScript Compilation
✅ No TypeScript errors - all types are properly defined and used

## Technical Details

### Keyboard Layout
The system uses standard QWERTY layout mapping:

**Left Hand Keys:**
- Top row: Q W E R T
- Home row: A S D F G
- Bottom row: Z X C V B

**Right Hand Keys:**
- Top row: Y U I O P
- Home row: H J K L
- Bottom row: N M

### Rolling Average Algorithm
Both row transition speed and typing speed use a rolling average:
```
newValue = (oldValue * 0.9) + (currentValue * 0.1)
```
This provides smooth, stable metrics that adapt gradually to changes in performance.

### Row Transition Tracking
- Only tracks correct keystrokes (errors are ignored for speed calculation)
- Calculates time difference between consecutive keys on different rows
- Updates rolling average of transition times
- First data point initializes the baseline directly

## Profile Schema Integration
Motor metrics are stored in the profile under the `motor` field:
```typescript
motor: {
  leftHandErrors: number;              // Count of left hand mistakes
  rightHandErrors: number;             // Count of right hand mistakes
  rowTransitionSpeed: number;          // Average time (ms) for row transitions
  commonLetterErrors: Record<string, number>; // Error count per letter
}
```

Additional baselines:
```typescript
typingSpeedBaseline: number;  // Average ms per letter
errorBaseline: number;        // Average errors per word
```

## Use Cases for Adaptive Sequencing

These metrics enable the adaptive sequencer to:

1. **Hand Balance Detection**: If `leftHandErrors >> rightHandErrors` (or vice versa), prioritize words that exercise the weaker hand

2. **Letter-Specific Practice**: Use `commonLetterErrors` to identify problematic letters and include them in upcoming words

3. **Pacing Adjustment**: Use `rowTransitionSpeed` and `typingSpeedBaseline` to adjust word difficulty based on typing proficiency

4. **Struggle Detection**: Use `errorBaseline` to identify learners who need additional support

5. **Progress Tracking**: Monitor improvement over time by watching baselines decrease

## Performance Considerations

- Keystroke tracking is lightweight (simple array append)
- Metrics calculation only happens on word completion (not on every keystroke)
- Rolling averages prevent unbounded metric growth
- No DOM manipulation or expensive operations during typing

## Files Modified
1. ✅ `src/utils/motorMetrics.ts` - Created with full implementation
2. ✅ `src/App.tsx` - Already integrated keystroke tracking and profile updates
3. ✅ `src/types/index.ts` - Motor metrics types already defined
4. ✅ `src/engine/ProfileManager.ts` - Motor fields already included in profile schema

## Files Created
1. ✅ `src/utils/motorMetrics.test.ts` - Comprehensive test suite
2. ✅ `test-motor-integration.js` - Integration validation test
3. ✅ `tasks/050-06-motor-tracking-COMPLETED.md` - This documentation

## Acceptance Criteria Status
- [x] Left/right hand errors tracked correctly
- [x] Common letter errors recorded per expected letter
- [x] Row transition speed measured with rolling average
- [x] Typing speed baseline updated after each word
- [x] Profile saved after each word with all motor metrics
- [x] No performance impact on typing (metrics calculated on completion only)
- [x] TypeScript compiles without errors
- [x] Comprehensive test coverage

## Next Steps
This task is complete. The motor metrics are now being tracked and can be consumed by:
- Task 050-07: Adaptive Sequencer implementation
- Task 050-08: Category affinity tracking
- Future analytics and reporting features

## Notes
- The integration was already partially complete from task 050-09, which added the keystroke tracking state and profile update logic
- This task focused on creating the utility functions and comprehensive testing
- All motor metrics use rolling averages to provide stable, adaptive baselines
- The system gracefully handles edge cases (zero letters, first word, etc.)
