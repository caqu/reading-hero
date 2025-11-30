# Motor Metrics Tracking Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER TYPES A WORD: "cat"                     │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  KEYSTROKE TRACKING (Real-time during typing)                    │
├─────────────────────────────────────────────────────────────────┤
│  Key Press 1: 'c' at 100ms  [✓ CORRECT] → expected 'c'         │
│  Key Press 2: 'x' at 200ms  [✗ WRONG]   → expected 'a'         │
│  Key Press 3: 'a' at 300ms  [✓ CORRECT] → expected 'a'         │
│  Key Press 4: 't' at 400ms  [✓ CORRECT] → expected 't'         │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  WORD COMPLETED - METRICS CALCULATION                            │
└─────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
       ┌────────────────┐ ┌──────────────┐ ┌────────────────┐
       │  HAND ERRORS   │ │ LETTER ERRORS│ │ ROW TRANSITIONS│
       ├────────────────┤ ├──────────────┤ ├────────────────┤
       │ 'x' = left hand│ │ 'a': 1 error │ │ c→a: 200ms     │
       │ Left errors: 1 │ │              │ │ a→t: 100ms     │
       │ Right errors: 0│ │              │ │ Avg: 150ms     │
       └────────────────┘ └──────────────┘ └────────────────┘
                    │              │              │
                    └──────────────┼──────────────┘
                                   ▼
              ┌──────────────────────────────────────┐
              │  BASELINE CALCULATIONS               │
              ├──────────────────────────────────────┤
              │ Typing Speed: 400ms / 3 = 133ms/let │
              │ Error Count: 1 error                 │
              │ Rolling Avg: (old*0.9) + (new*0.1) │
              └──────────────────────────────────────┘
                                   │
                                   ▼
              ┌──────────────────────────────────────┐
              │  UPDATE PROFILE                      │
              ├──────────────────────────────────────┤
              │ motor: {                             │
              │   leftHandErrors: 1                  │
              │   rightHandErrors: 0                 │
              │   rowTransitionSpeed: 150            │
              │   commonLetterErrors: { "a": 1 }     │
              │ }                                    │
              │ typingSpeedBaseline: 133             │
              │ errorBaseline: 1                     │
              └──────────────────────────────────────┘
                                   │
                                   ▼
              ┌──────────────────────────────────────┐
              │  SAVE TO LOCALSTORAGE                │
              └──────────────────────────────────────┘
```

## Keyboard Layout Reference

```
┌─────────────────────────────────────────────────────────┐
│  TOP ROW    │ Q  W  E  R  T    Y  U  I  O  P          │
├─────────────┼─────────────────────────────────────────┤
│  HOME ROW   │ A  S  D  F  G    H  J  K  L             │
├─────────────┼─────────────────────────────────────────┤
│  BOTTOM ROW │ Z  X  C  V  B    N  M                   │
└─────────────┴─────────────────────────────────────────┘
       LEFT HAND          RIGHT HAND
```

## Metric Calculation Details

### 1. Hand Error Detection
```typescript
// For each incorrect keystroke:
if (isLeftHandKey(wrongKey)) {
  leftHandErrors++;
} else if (isRightHandKey(wrongKey)) {
  rightHandErrors++;
}
```

**Example**: User presses 'x' when 'a' was expected
- 'x' is a left-hand key → `leftHandErrors++`

### 2. Common Letter Errors
```typescript
// For each incorrect keystroke:
commonLetterErrors[expectedLetter]++;
```

**Example**: Expected 'a', got 'x'
- `commonLetterErrors['a']` increments from 0 to 1

### 3. Row Transition Speed
```typescript
// For consecutive correct keystrokes on different rows:
if (prevRow !== currentRow) {
  transitionTime = currentTimestamp - prevTimestamp;
  // Add to rolling average
  rowTransitionSpeed = (oldSpeed * 0.9) + (transitionTime * 0.1);
}
```

**Example**: Typing "cat"
- 'c' (bottom) → 'a' (home): 300ms - 100ms = 200ms
- 'a' (home) → 't' (top): 400ms - 300ms = 100ms
- Average: (200 + 100) / 2 = 150ms

### 4. Typing Speed Baseline
```typescript
speedPerLetter = totalWordTime / letterCount;
typingSpeedBaseline = (oldBaseline * 0.9) + (speedPerLetter * 0.1);
```

**Example**: Typing "cat" in 400ms
- 400ms / 3 letters = 133.33ms per letter
- First word: baseline = 133.33ms
- Second word (200ms for 4 letters = 50ms/letter):
  - baseline = (133.33 * 0.9) + (50 * 0.1) = 125ms

### 5. Error Baseline
```typescript
errorBaseline = (oldBaseline * 0.9) + (errorCount * 0.1);
```

**Example**: 1 error this word
- First word: baseline = 1
- Second word (0 errors):
  - baseline = (1 * 0.9) + (0 * 0.1) = 0.9

## State Management in App.tsx

### Initialization (Line 217)
```typescript
const [wordKeystrokes, setWordKeystrokes] = useState<KeystrokeData[]>([]);
```

### Keystroke Capture (Lines 281-287)
```typescript
const keystroke: KeystrokeData = {
  key: key.toLowerCase(),
  timestamp: Date.now(),
  isCorrect,
  expectedKey: expectedLetter,
};
setWordKeystrokes(prev => [...prev, keystroke]);
```

### Word Reset (Lines 220-226)
```typescript
useEffect(() => {
  setWordKeystrokes([]); // Clear for new word
}, [game.currentWordIndex]);
```

### Metrics Calculation (Lines 326-344)
```typescript
// On word completion:
const updatedMotor = updateMotorMetrics(
  activeProfile,
  wordKeystrokes,
  timeToComplete,
  currentWord.text.length
);

const updatedTypingSpeedBaseline = updateTypingSpeedBaseline(
  activeProfile,
  timeToComplete,
  currentWord.text.length
);

const updatedErrorBaseline = updateErrorBaseline(
  activeProfile,
  wordWrongKeyPresses
);
```

### Profile Update (Lines 391-401)
```typescript
updateActiveProfile({
  motor: updatedMotor,
  typingSpeedBaseline: updatedTypingSpeedBaseline,
  errorBaseline: updatedErrorBaseline,
  // ... other fields
});
```

## Rolling Average Visualization

```
Word 1: 200ms/letter
Baseline = 200

Word 2: 100ms/letter
Baseline = (200 * 0.9) + (100 * 0.1) = 190

Word 3: 150ms/letter
Baseline = (190 * 0.9) + (150 * 0.1) = 186

Word 4: 180ms/letter
Baseline = (186 * 0.9) + (180 * 0.1) = 185.4

Word 5: 170ms/letter
Baseline = (185.4 * 0.9) + (170 * 0.1) = 183.86

┌─────────────────────────────────────────┐
│ The baseline gradually adapts to the   │
│ learner's actual performance, giving   │
│ more weight to historical data (90%)   │
│ while still incorporating new data     │
│ (10%). This prevents single outlier    │
│ words from dramatically shifting the   │
│ baseline.                              │
└─────────────────────────────────────────┘
```

## Integration with Adaptive Sequencing

The motor metrics enable intelligent content selection:

```
┌────────────────────────────────────────────────────────┐
│  ADAPTIVE SEQUENCER DECISIONS                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  IF leftHandErrors >> rightHandErrors:                │
│    → Select words with more left-hand letters         │
│                                                        │
│  IF commonLetterErrors['a'] > 5:                      │
│    → Include words with 'a' for practice              │
│                                                        │
│  IF rowTransitionSpeed > 500ms:                       │
│    → Select words with fewer row transitions          │
│                                                        │
│  IF typingSpeedBaseline > 1000ms:                     │
│    → Use shorter, simpler words                        │
│                                                        │
│  IF errorBaseline > 3:                                │
│    → Reduce difficulty, add hints                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Data Persistence

```
Profile Object in localStorage:
{
  "id": "profile_1234567890_abc123",
  "name": "Alice",
  "avatar": "😀",

  "motor": {
    "leftHandErrors": 15,
    "rightHandErrors": 8,
    "rowTransitionSpeed": 185.4,
    "commonLetterErrors": {
      "a": 5,
      "e": 3,
      "t": 2,
      "s": 4
    }
  },

  "typingSpeedBaseline": 183.86,
  "errorBaseline": 1.8,

  "stats": {
    "wordsCompleted": 50,
    "accuracy": 92,
    ...
  }
}
```

## Performance Characteristics

- **Memory**: O(n) where n = number of keystrokes per word (typically 3-15)
- **CPU**: Metrics calculated once per word, not per keystroke
- **Storage**: Motor metrics ~100 bytes per profile in localStorage
- **Impact**: Zero observable impact on typing responsiveness

## Testing Coverage

✅ 24 comprehensive unit tests covering:
- Hand detection for all keys
- Row detection for all keys
- Row transition logic
- Metric calculation accuracy
- Rolling average behavior
- Edge cases (first word, zero letters, etc.)
- Integration scenarios

---

**Status**: ✅ Complete and Production Ready
**Last Updated**: 2025-11-30
**Task**: 050-06
