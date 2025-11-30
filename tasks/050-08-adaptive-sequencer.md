# Task 050-08: Adaptive Sequencer Core Implementation

**Priority**: SEQUENCER (After 050-02, 050-03, 050-04, 050-05, 050-07)
**Estimated Time**: 90 minutes
**Dependencies**: All core modules (050-02 through 050-07)

## Goal
Implement the main adaptive sequencer that selects the next content item.

## File to Create
`src/engine/AdaptiveSequencer.ts`

## Main Function Signature
```typescript
export function getNextItem(
  profile: LearnerProfile,
  history: HistoryEntry[],
  contentLibrary: ContentItem[]
): SequencerOutput {
  // Implementation
}
```

## Algorithm Steps

### 1. Compute Target Difficulty
```typescript
const targetState = computeTargetState(profile, history);
// Returns 1-5 based on recent performance
```

Rules:
- If fast + few errors → shift up 1
- If slow + many errors → shift down 1
- Else → stay
- Clamp within [1, 5]

### 2. Build Candidate Pool
Filter contentLibrary:
- Target difficulty state ± 1
- Match category preferences (weight by affinity)
- Consider SR bins (reviews vs new)
- Exclude lastTenItems

Aim for 5-12 candidates.

### 3. Weighted Ranking
Score each candidate:
```typescript
score =
  (difficultyMatch * 0.4) +
  (categoryAffinity * 0.3) +
  (noveltyScore * 0.2) +
  (random * 0.1)
```

### 4. Fun Injection
Every ~7 items, 10% chance:
- Select silly word/phrase/sentence
- Override normal selection

### 5. SR Review Injection
If `shouldInjectReview()`:
- Select from SR bins B or C
- Use normal scoring for review items

### 6. Final Selection
```typescript
// Sort by score, pick from top 3 with slight randomness
const topCandidates = sortedCandidates.slice(0, 3);
const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
```

## Helper Functions

### `computeTargetState(profile, history): ProgressionStage`
Analyze recent 10 words:
- Calculate avg speed vs baseline
- Calculate avg errors vs baseline
- Determine shift direction
- Apply to current progressionState

### `filterCandidates(library, profile, targetState): ContentItem[]`
Apply all filters.

### `scoreCandidate(item, profile, targetState): number`
Calculate weighted score.

### `shouldInjectFun(itemCount): boolean`
Return true every ~7 items with 10% chance.

## Return Value
```typescript
return {
  item: selectedItem,
  reason: {
    progressionState: targetState,
    targetDifficultyRange: [targetState - 1, targetState + 1],
    matchedCandidates: candidates.length,
    selectedRank: rankOfSelected,
    weightedScores: { [itemId]: score },
    usedSurprise: wasS urprise,
    injectedReview: wasReview
  }
};
```

## Acceptance Criteria
- [ ] getNextItem function implemented
- [ ] All helper functions working
- [ ] Returns valid ContentItem
- [ ] Reason object populated for debugging
- [ ] No side effects (pure function)
- [ ] Handles edge cases (empty library, no candidates)
- [ ] TypeScript compiles without errors
- [ ] Deterministic given same inputs
