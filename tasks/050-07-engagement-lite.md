# Task 050-07: Simplified Engagement Model

**Priority**: INTEGRATION (After 050-05)
**Estimated Time**: 30 minutes
**Dependencies**: 050-05 (Profile extension)

## Goal
Implement a simple engagement scoring system that updates after each word.

## File to Create
`src/engine/EngagementTracker.ts`

## Engagement Score Rules

Start at 50, range 0-100.

### Update After Each Word:
```typescript
function updateEngagement(
  currentScore: number,
  timeMs: number,
  baseline: number,
  errors: number
): number {
  let delta = 0;

  // Speed comparison
  if (timeMs < baseline * 0.8) {
    delta += 3;  // Much faster
  } else if (timeMs > baseline * 1.5) {
    delta -= 3;  // Much slower
  }

  // Error comparison
  if (errors === 0) {
    delta += 4;  // Perfect
  } else if (errors >= 3) {
    delta -= 4;  // Many errors
  }

  // Clamp 0-100
  return Math.max(0, Math.min(100, currentScore + delta));
}
```

## Functions to Implement

### 1. `updateEngagementScore(profile: LearnerProfile, wordResult: WordResult): number`
Update and return new engagement score.

### 2. `getEngagementLevel(score: number): "low" | "medium" | "high"`
Categorize:
- low: < 30
- medium: 30-70
- high: > 70

### 3. `shouldHoldSteady(score: number): boolean`
Return true if score < 30 (engagement recovery mode).

### 4. `shouldAdvance(score: number): boolean`
Return true if score > 60 (ready for progression).

## Integration Points

Update engagement after each word completion:
```typescript
const newEngagement = updateEngagementScore(profile, wordResult);
profile.engagementScore = newEngagement;
saveProfile(profile);
```

## Sequencer Usage

Sequencer checks engagement to:
- Hold steady when < 30 (easier content)
- Allow upward progression when > 60
- Inject novelty when dropping

## Acceptance Criteria
- [ ] updateEngagementScore implemented
- [ ] Score properly clamped 0-100
- [ ] Helper functions implemented
- [ ] Integrated into word completion flow
- [ ] Profile saved with new score
- [ ] TypeScript compiles without errors
