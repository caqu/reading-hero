# Task 050-09: Integrate Sequencer into Game Loop

**Priority**: INTEGRATION (After 050-08)
**Estimated Time**: 60 minutes
**Dependencies**: 050-08 (Adaptive Sequencer)

## Goal
Replace all random/shuffle word selection with adaptive sequencer.

## Files to Modify
- `src/App.tsx`
- `src/hooks/useGameState.ts`

## Changes Required

### 1. Import Sequencer
```typescript
import { getNextItem } from './engine/AdaptiveSequencer';
import { SequencerOutput } from './types/Sequencer';
```

### 2. Remove Old Word Selection
Delete:
- Word shuffling logic
- Random word selection
- Old tier system usage
- Sentence mode toggle

### 3. Add Sequencer Call
```typescript
const selectNextWord = () => {
  const sequencerOutput = getNextItem(
    activeProfile,
    historyWindow,
    contentLibrary
  );

  console.log('[SEQ] Selected:', sequencerOutput.item);
  console.log('[SEQ] Reason:', sequencerOutput.reason);

  return sequencerOutput.item;
};
```

### 4. Update Game State
When word completes:
```typescript
// Update profile
profile.lastTenItems = [
  ...profile.lastTenItems.slice(-9),
  completedItem.id
];
profile.totalCompleted++;

// Update motor metrics
updateMotorMetrics(profile, keystrokes, timeMs, letterCount);

// Update engagement
updateEngagementScore(profile, wordResult);

// Update SR bin
updateBinAfterCompletion(completedItem.id, success, profile);

// Save profile
saveProfile(profile);

// Get next item
const nextItem = selectNextWord();
setCurrentWord(nextItem);
```

### 5. Initialize Content Library
On app start:
```typescript
const contentLibrary = [
  ...emojiWords,
  ...highInterestWords,
  ...generatedPhrases,
  ...generatedSentences
];
```

### 6. History Window
Keep last 10-20 history entries in memory:
```typescript
const [historyWindow, setHistoryWindow] = useState<HistoryEntry[]>([]);

// After each word, add to history
setHistoryWindow(prev => [
  ...prev.slice(-19),
  newHistoryEntry
]);
```

## Debug Logging
Add console logs for:
- Selected item and stage
- Reason object
- Profile progression state
- Engagement score
- SR bin movements

## Acceptance Criteria
- [ ] Old shuffle logic removed
- [ ] Sequencer integrated
- [ ] Profile updates after each word
- [ ] History window maintained
- [ ] Debug logs showing selections
- [ ] Game playable end-to-end
- [ ] No errors in console
- [ ] TypeScript compiles without errors
