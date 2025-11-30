# Task 050-06: Motor-Learning Metrics Tracking

**Priority**: INTEGRATION (After 050-05)
**Estimated Time**: 45 minutes
**Dependencies**: 050-05 (Profile extension)

## Goal
Track motor-learning metrics during keyboard input to inform sequencing decisions.

## Files to Modify
- `src/App.tsx` (keyboard handling)
- `src/hooks/useGameState.ts` (if keyboard handling is there)

## Metrics to Track

### 1. Left/Right Hand Errors
Track which hand made errors:
- Left hand keys: Q W E R T A S D F G Z X C V B
- Right hand keys: Y U I O P H J K L N M

On wrong key:
```typescript
if (isLeftHandKey(wrongKey)) {
  profile.motor.leftHandErrors++;
} else {
  profile.motor.rightHandErrors++;
}
```

### 2. Common Letter Errors
Track specific letter mistakes:
```typescript
profile.motor.commonLetterErrors[expectedLetter]++;
```

### 3. Row Transition Speed
Measure time between keys on different rows:
- Top row: Q W E R T Y U I O P
- Home row: A S D F G H J K L
- Bottom row: Z X C V B N M

```typescript
if (previousKey.row !== currentKey.row) {
  const transitionTime = currentTime - previousKeyTime;
  // Update rolling average
  profile.motor.rowTransitionSpeed =
    (profile.motor.rowTransitionSpeed * 0.9) + (transitionTime * 0.1);
}
```

### 4. Typing Speed Baseline
```typescript
profile.typingSpeedBaseline = totalTimeMs / letterCount;
```

## Update After Each Word
Create function:
```typescript
function updateMotorMetrics(
  profile: LearnerProfile,
  keystrokes: KeystrokeData[],
  wordTime: number,
  letterCount: number
): void {
  // Update all motor metrics
  // Update typing speed baseline
  // Update error baseline
}
```

## Acceptance Criteria
- [ ] Left/right hand errors tracked correctly
- [ ] Common letter errors recorded
- [ ] Row transition speed measured
- [ ] Typing speed baseline updated
- [ ] Profile saved after each word
- [ ] No performance impact on typing
- [ ] TypeScript compiles without errors
