# Task 050-04: Spaced Repetition Lite (3 Bins)

**Priority**: CORE MODULE (Can run in parallel with 050-02, 050-03, 050-05)
**Estimated Time**: 45 minutes
**Dependencies**: 050-01 (Type schemas)

## Goal
Implement a simplified 3-bin spaced repetition system.

## File to Create
`src/engine/SpacedRepetitionLite.ts`

## Bin Definitions
- **A (New)**: Words unseen or seen once
- **B (Learning)**: Words practiced 2-4 times
- **C (Mastered)**: 5+ successful repetitions

## Functions to Implement

### 1. `shouldInjectReview(profile: LearnerProfile): boolean`
Rules:
- Every 5-12 items, return true
- Consider recent review ratio
- Check if bins B or C have items

### 2. `selectReviewItem(profile: LearnerProfile, contentLibrary: ContentItem[]): ContentItem | null`
Select from bins B or C:
- Prioritize B over C (70/30 split)
- Choose items not in lastTenItems
- Return null if no suitable items

### 3. `updateBinAfterCompletion(itemId: string, success: boolean, profile: LearnerProfile): void`
Update SR bins:
- Success: Move A→B→C
- Failure: Move back one bin
- Track repetition count
- Mutates profile.spacedRepetition

### 4. `getBinForItem(itemId: string, profile: LearnerProfile): "A" | "B" | "C"`
Return current bin for an item.

## Data Structure
Profile should track:
```typescript
spacedRepetition: {
  A: string[];  // item IDs
  B: string[];
  C: string[];
  repetitionCounts: Record<string, number>;
}
```

## Acceptance Criteria
- [ ] All functions implemented
- [ ] Bins correctly updated on success/failure
- [ ] Review injection follows 5-12 item rule
- [ ] No duplicate items in lastTenItems
- [ ] TypeScript compiles without errors
