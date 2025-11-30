# Task 050-05: Extend Learner Profile

**Priority**: CORE MODULE (Can run in parallel with 050-02, 050-03, 050-04)
**Estimated Time**: 30 minutes
**Dependencies**: 050-01 (Type schemas)

## Goal
Extend ProfileManager to support new adaptive sequencing fields.

## File to Modify
`src/engine/ProfileManager.ts`

## New Fields to Add to Profile

```typescript
// Current adaptive position
progressionState: ProgressionStage;  // 1-5
engagementScore: number;             // 0-100

// Baselines (updated every word)
typingSpeedBaseline: number;         // ms per letter
errorBaseline: number;               // avg errors per word

// Category affinity (interests)
categoryAffinity: Record<Category, number>; // 0-100

// Motor-learning metrics
motor: {
  leftHandErrors: number;
  rightHandErrors: number;
  rowTransitionSpeed: number; // ms
  commonLetterErrors: Record<string, number>;
};

// Spaced Repetition (SR-lite)
spacedRepetition: {
  A: string[]; // new
  B: string[]; // learning
  C: string[]; // mastered
  repetitionCounts: Record<string, number>;
};

// Recent history references
lastTenItems: string[];   // last 10 item IDs
totalCompleted: number;   // word/phrase/sentence count
```

## Functions to Update

### 1. `createProfile(name: string): LearnerProfile`
Initialize with defaults:
- progressionState: 1
- engagementScore: 50
- typingSpeedBaseline: 1000 (1 second per letter)
- errorBaseline: 2
- categoryAffinity: all categories at 50
- motor: all zeros
- spacedRepetition: empty arrays
- lastTenItems: []
- totalCompleted: 0

### 2. `updateProfile(profileId: string, updates: Partial<LearnerProfile>): void`
Merge updates and save to localStorage.

### 3. `getProfile(profileId: string): LearnerProfile | null`
Load from localStorage with backwards compatibility.

## Migration Strategy
Add migration function to handle old profiles:
- If old profile loaded, add new fields with defaults
- Save migrated profile back to localStorage

## Acceptance Criteria
- [ ] All new fields added to profile interface
- [ ] createProfile initializes all fields
- [ ] Migration handles old profiles gracefully
- [ ] No data loss for existing profiles
- [ ] TypeScript compiles without errors
- [ ] localStorage read/write works correctly
