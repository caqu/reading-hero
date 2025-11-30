# Adaptive Sequencer Architecture

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Module Structure](#module-structure)
4. [Data Flow](#data-flow)
5. [Pure Function Design](#pure-function-design)
6. [Type System](#type-system)
7. [Testing Strategy](#testing-strategy)
8. [Performance Considerations](#performance-considerations)
9. [Extension Points](#extension-points)

---

## Overview

The Adaptive Sequencer is designed as a **pure function** that takes learner state as input and returns the next content item to present. This architecture ensures predictability, testability, and maintainability.

### Core Philosophy

- **No side effects**: Functions don't modify inputs or global state
- **Deterministic**: Same inputs always produce same outputs (except for controlled randomness)
- **Composable**: Small, focused functions that combine cleanly
- **Testable**: Easy to unit test without mocks or setup

---

## Design Principles

### 1. Pure Functions

All sequencer logic is implemented as pure functions:

```typescript
// ✅ Good: Pure function
function computeTargetState(
  profile: LearnerProfile,
  history: HistoryEntry[]
): ProgressionStage {
  // No mutations, no side effects
  const currentState = profile.progressionState;
  // ... computation
  return targetState;
}

// ❌ Bad: Impure function
function computeTargetState(profile: LearnerProfile): void {
  // Mutates input
  profile.progressionState = newState; // Don't do this!
}
```

### 2. Separation of Concerns

Each module has a single, well-defined responsibility:

| Module | Responsibility |
|--------|---------------|
| `AdaptiveSequencer.ts` | Main selection logic, candidate scoring |
| `ContentClassifier.ts` | Stage classification, complexity calculation |
| `SpacedRepetitionLite.ts` | SR bin management, review timing |
| `EngagementTracker.ts` | Engagement scoring, progression gates |
| `PhraseSentenceGenerator.ts` | Dynamic phrase/sentence generation |
| `ProfileManager.ts` | Profile state updates, persistence |

### 3. Immutability

Inputs are never modified. Updates return new values:

```typescript
// ✅ Good: Returns new motor object
export function updateMotorMetrics(
  profile: Profile,
  keystrokes: KeystrokeData[],
  wordTime: number,
  letterCount: number
): Profile['motor'] {
  const updatedMotor = { ...profile.motor };
  updatedMotor.commonLetterErrors = { ...profile.motor.commonLetterErrors };
  // ... updates
  return updatedMotor;
}
```

### 4. Type Safety

TypeScript types enforce correct usage:

```typescript
// Stage is constrained to 1-5
export type ProgressionStage = 1 | 2 | 3 | 4 | 5;

// Category is a closed set
export type Category =
  | "animals"
  | "food"
  | "fantasy"
  | "tech"
  | "nature"
  | "actions"
  | "feelings"
  | "places"
  | "activities"
  | "nowWords";
```

---

## Module Structure

### AdaptiveSequencer.ts

**Purpose**: Main sequencer logic

**Key Functions**:
```typescript
export function getNextItem(
  profile: LearnerProfile,
  history: HistoryEntry[],
  contentLibrary: ContentItem[]
): SequencerOutput

function computeTargetState(
  profile: LearnerProfile,
  history: HistoryEntry[]
): ProgressionStage

function filterCandidates(
  library: ContentItem[],
  profile: LearnerProfile,
  targetState: ProgressionStage
): ContentItem[]

function scoreCandidate(
  item: ContentItem,
  profile: LearnerProfile,
  targetState: ProgressionStage
): number
```

**Dependencies**:
- `ContentClassifier.getProgressionStage()`
- `SpacedRepetitionLite.shouldInjectReview()`
- `SpacedRepetitionLite.selectReviewItem()`
- `EngagementTracker.shouldHoldSteady()`
- `EngagementTracker.shouldAdvance()`

**Algorithm**:
1. Compute target difficulty state (1-5)
2. Check for SR review injection
3. Check for fun item injection
4. Filter content library to candidate pool
5. Score candidates with weighted ranking
6. Select from top 3 with randomness
7. Return item + reasoning trace

---

### ContentClassifier.ts

**Purpose**: Deterministic classification of content items

**Key Functions**:
```typescript
export function getProgressionStage(
  item: ContentItem
): ProgressionStage

export function getOrthographicComplexity(
  item: ContentItem
): number

export function getSemanticConcreteness(
  item: ContentItem
): number

export function classifyForSR(
  item: ContentItem,
  profile: LearnerProfile
): "A" | "B" | "C"
```

**Pattern Detection**:
- CVC (consonant-vowel-consonant)
- CVCV/CVCVC (simple repeated patterns)
- Consonant blends (bl, gr, st)
- Digraphs (ch, sh, th)
- Irregular patterns (silent letters, complex vowels)
- Sight words (curated list)

**Classification Logic**:
```
Multi-word?
  ├─ 4+ words → Stage 5 (sentences)
  └─ 2-3 words → Stage 4 (phrases)

Single word?
  ├─ In sight word list → Stage 3
  ├─ CVC or simple (≤4 letters) → Stage 1
  ├─ Growing (4-6 letters, moderate complexity) → Stage 2
  └─ Default → Stage 3
```

---

### SpacedRepetitionLite.ts

**Purpose**: Simplified 3-bin spaced repetition

**Key Functions**:
```typescript
export function shouldInjectReview(
  profile: LearnerProfile
): boolean

export function selectReviewItem(
  profile: LearnerProfile,
  contentLibrary: ContentItem[]
): ContentItem | null

export function updateBinAfterCompletion(
  itemId: string,
  success: boolean,
  profile: LearnerProfile
): void

export function getBinForItem(
  itemId: string,
  profile: LearnerProfile
): "A" | "B" | "C"
```

**Bin Definitions**:
- **Bin A**: New/unseen items (0-1 attempts)
- **Bin B**: Learning items (2-4 attempts)
- **Bin C**: Mastered items (5+ attempts)

**Review Timing**:
```typescript
// Deterministic per-profile interval (5-12 items)
const profileHash = profile.id
  .split("")
  .reduce((acc, char) => acc + char.charCodeAt(0), 0);
const reviewInterval = 5 + (profileHash % 8);

return profile.totalCompleted % reviewInterval === 0;
```

**Selection Priority**:
- 70% from Bin B (learning items)
- 30% from Bin C (mastered items)
- Excludes items in `lastTenItems`

---

### EngagementTracker.ts

**Purpose**: Tracks learner engagement/motivation

**Key Functions**:
```typescript
export function updateEngagementScore(
  profile: LearnerProfile,
  wordResult: WordResult
): number

export function getEngagementLevel(
  score: number
): "low" | "medium" | "high"

export function shouldHoldSteady(score: number): boolean

export function shouldAdvance(score: number): boolean
```

**Update Rules**:
```typescript
let delta = 0;

// Speed
if (timeMs < baseline * 0.8) delta += 3;    // Fast
if (timeMs > baseline * 1.5) delta -= 3;    // Slow

// Accuracy
if (errors === 0) delta += 4;                // Perfect
if (errors >= 3) delta -= 4;                 // Many errors

return Math.max(0, Math.min(100, currentScore + delta));
```

**Progression Gates**:
- `shouldHoldSteady(score < 30)`: Recovery mode, prevent advancement
- `shouldAdvance(score > 60)`: Ready for progression

---

### PhraseSentenceGenerator.ts

**Purpose**: Dynamic phrase and sentence generation

**Key Functions**:
```typescript
export function generatePhrase(
  seedWord: ContentItem
): ContentItem

export function generateMicroSentence(
  seedWord: ContentItem
): ContentItem

export function generatePhrases(
  seedWord: ContentItem,
  count: number
): ContentItem[]

export function generateMicroSentences(
  seedWord: ContentItem,
  count: number
): ContentItem[]
```

**Templates**:

Phrases:
- `[article] + [noun]`: "the dog", "a cat"
- `[adjective] + [noun]`: "big dog", "silly cat"

Sentences:
- `The [noun] [verb].`: "The dog runs."
- `The [noun] is [adjective].`: "The cat is happy."
- `[Noun] [verb]s.`: "Pizza rocks."

**Property Inheritance**:
Generated content inherits from seed word:
- `emoji`, `hasImage`, `hasASL`, `hasSpanish`
- `category`, `concretenessScore`

---

### ProfileManager.ts

**Purpose**: Manages learner profile state and persistence

**Key Functions**:
```typescript
export function createDefaultProfile(
  id: string,
  name: string
): LearnerProfile

export function updateProfileAfterWord(
  profile: LearnerProfile,
  result: WordResult
): LearnerProfile

export function saveProfile(profile: LearnerProfile): void

export function loadProfile(id: string): LearnerProfile | null
```

**State Updates**:
- Engagement score
- SR bin progression
- Motor metrics
- Baselines (speed, errors)
- Recent items (`lastTenItems`)
- Category affinity

---

## Data Flow

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User Completes Word                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Collect Word Result  │
                │  - Time               │
                │  - Errors             │
                │  - Keystrokes         │
                └──────────┬────────────┘
                           │
                           ▼
                ┌───────────────────────┐
                │  Update Profile       │
                │  - Engagement         │
                │  - SR Bins            │
                │  - Motor Metrics      │
                │  - Baselines          │
                └──────────┬────────────┘
                           │
                           ▼
                ┌───────────────────────┐
                │  Save Profile         │
                │  (localStorage)       │
                └──────────┬────────────┘
                           │
                           ▼
                ┌───────────────────────┐
                │  Get Next Item        │
                │  (Sequencer)          │
                └──────────┬────────────┘
                           │
                           ▼
                ┌───────────────────────┐
                │  Present Next Word    │
                └───────────────────────┘
```

### Sequencer Internal Flow

```
getNextItem()
  │
  ├─→ computeTargetState()
  │     ├─ shouldHoldSteady() → engagement check
  │     ├─ shouldAdvance() → engagement check
  │     └─ analyze recent performance → target state (1-5)
  │
  ├─→ shouldInjectReview()
  │     └─ selectReviewItem() → review item or null
  │
  ├─→ shouldInjectFunItem()
  │     └─ selectFunItem() → fun item or null
  │
  ├─→ filterCandidates()
  │     ├─ filter by stage range (target ± 1)
  │     ├─ exclude lastTenItems
  │     └─ narrow by category affinity
  │
  ├─→ scoreCandidate() (for each candidate)
  │     ├─ 40% difficulty match
  │     ├─ 30% category affinity
  │     ├─ 20% novelty score
  │     └─ 10% random variation
  │
  └─→ select from top 3
        └─ return item + reasoning
```

---

## Pure Function Design

### Why Pure Functions?

1. **Predictability**: Same inputs → same outputs
2. **Testability**: No setup/teardown, no mocks
3. **Debugging**: Easy to trace and reproduce issues
4. **Composition**: Functions combine cleanly
5. **Parallelization**: Safe to run concurrently

### Example: Pure vs Impure

**❌ Impure (mutates profile)**:
```typescript
function updateEngagement(profile: LearnerProfile, delta: number): void {
  profile.engagementScore += delta;
  if (profile.engagementScore > 100) {
    profile.engagementScore = 100;
  }
}
```

**✅ Pure (returns new value)**:
```typescript
function updateEngagementScore(
  profile: LearnerProfile,
  wordResult: WordResult
): number {
  const currentScore = profile.engagementScore;
  const delta = calculateDelta(wordResult);
  return Math.max(0, Math.min(100, currentScore + delta));
}
```

### Handling Randomness

Randomness is controlled and explicit:

```typescript
// Selection uses randomness, but it's documented
function selectFromTopCandidates(candidates: ContentItem[]): ContentItem {
  const topThree = candidates.slice(0, 3);
  return topThree[Math.floor(Math.random() * topThree.length)];
}

// For testing, you can seed Math.random or use dependency injection
// (Not implemented yet, but could be added)
```

### Immutable Updates

Use spread operators and object copying:

```typescript
// ✅ Immutable update
const updatedMotor = {
  ...profile.motor,
  commonLetterErrors: {
    ...profile.motor.commonLetterErrors,
    [letter]: (profile.motor.commonLetterErrors[letter] || 0) + 1
  }
};

// ❌ Mutable update
profile.motor.commonLetterErrors[letter]++;
```

---

## Type System

### Core Types

#### ContentItem

```typescript
export interface ContentItem {
  id: string;
  text: string;
  type: "word" | "phrase" | "sentence";

  // Classification
  stage: ProgressionStage;  // 1-5
  category: Category;
  syllables: number;
  letterCount: number;
  orthographicComplexity: number;  // 1-5

  // Multimodal
  emoji?: string;
  hasImage: boolean;
  hasASL: boolean;
  hasSpanish: boolean;

  // Sequencing
  srBin: "A" | "B" | "C";
  noveltyScore: number;  // 0-1
  concretenessScore: number;  // 0-1
}
```

#### LearnerProfile

```typescript
export interface LearnerProfile {
  id: string;
  name: string;
  createdAt: number;

  // Adaptive position
  progressionState: ProgressionStage;
  engagementScore: number;  // 0-100

  // Baselines
  typingSpeedBaseline: number;  // ms per letter
  errorBaseline: number;  // avg errors per word

  // Interests
  categoryAffinity: Record<Category, number>;  // 0-100

  // Motor learning
  motor: {
    leftHandErrors: number;
    rightHandErrors: number;
    rowTransitionSpeed: number;
    commonLetterErrors: Record<string, number>;
  };

  // Spaced repetition
  spacedRepetition: {
    A: string[];  // new
    B: string[];  // learning
    C: string[];  // mastered
  };

  // Recent history
  lastTenItems: string[];
  totalCompleted: number;
}
```

#### SequencerOutput

```typescript
export interface SequencerOutput {
  item: ContentItem;
  reason: {
    progressionState: number;
    targetDifficultyRange: [number, number];
    matchedCandidates: number;
    selectedRank: number;
    weightedScores: Record<string, number>;
    usedSurprise: boolean;
    injectedReview: boolean;
  };
}
```

### Type Guards

```typescript
export function isWord(item: ContentItem): boolean {
  return item.type === "word";
}

export function isPhrase(item: ContentItem): boolean {
  return item.type === "phrase";
}

export function isSentence(item: ContentItem): boolean {
  return item.type === "sentence";
}
```

### Type Utilities

```typescript
// Extract stage from ContentItem
type Stage = ContentItem['stage'];  // 1 | 2 | 3 | 4 | 5

// Partial profile for testing
type TestProfile = Pick<LearnerProfile, 'id' | 'progressionState' | 'engagementScore'>;
```

---

## Testing Strategy

### Unit Tests

Test each function in isolation:

```typescript
describe('computeTargetState', () => {
  it('should advance when performance is strong', () => {
    const profile: LearnerProfile = {
      progressionState: 2,
      engagementScore: 70,
      typingSpeedBaseline: 300,
      errorBaseline: 1.0,
      // ... other fields
    };

    const history: HistoryEntry[] = [
      { timeMs: 800, errors: 0 },  // Fast + perfect
      { timeMs: 900, errors: 0 },
      { timeMs: 850, errors: 1 },
    ];

    const target = computeTargetState(profile, history);
    expect(target).toBe(3);  // Advanced from 2 to 3
  });
});
```

### Integration Tests

Test multiple modules together:

```typescript
describe('AdaptiveSequencer integration', () => {
  it('should inject review at correct interval', () => {
    const profile = createTestProfile({ totalCompleted: 14 });  // Interval 7
    const history = createTestHistory(10);
    const library = createTestLibrary();

    // Seed SR bins
    profile.spacedRepetition.B = ['word-dog', 'word-cat'];

    const output = getNextItem(profile, history, library);

    expect(output.reason.injectedReview).toBe(true);
    expect(['dog', 'cat']).toContain(output.item.text);
  });
});
```

### Property-Based Tests

Test invariants:

```typescript
describe('sequencer invariants', () => {
  it('should never mutate inputs', () => {
    const profile = createTestProfile();
    const history = createTestHistory();
    const library = createTestLibrary();

    const profileBefore = JSON.stringify(profile);
    const historyBefore = JSON.stringify(history);
    const libraryBefore = JSON.stringify(library);

    getNextItem(profile, history, library);

    expect(JSON.stringify(profile)).toBe(profileBefore);
    expect(JSON.stringify(history)).toBe(historyBefore);
    expect(JSON.stringify(library)).toBe(libraryBefore);
  });

  it('should always return valid stage', () => {
    // Generate 100 random profiles and histories
    for (let i = 0; i < 100; i++) {
      const profile = generateRandomProfile();
      const history = generateRandomHistory();
      const library = createTestLibrary();

      const output = getNextItem(profile, history, library);

      expect(output.item.stage).toBeGreaterThanOrEqual(1);
      expect(output.item.stage).toBeLessThanOrEqual(5);
    }
  });
});
```

### Snapshot Tests

Test complex outputs:

```typescript
it('should produce consistent output for fixed inputs', () => {
  // Seed random for deterministic tests
  Math.random = jest.fn(() => 0.5);

  const profile = createFixedProfile();
  const history = createFixedHistory();
  const library = createFixedLibrary();

  const output = getNextItem(profile, history, library);

  expect(output).toMatchSnapshot();
});
```

---

## Performance Considerations

### Candidate Pool Size

Aim for 5-12 candidates:
- Too few (< 5): Repetition, limited variety
- Too many (> 12): Slower scoring, diminishing returns

```typescript
// Optimization: narrow by category affinity if pool > 12
if (candidates.length > 12) {
  const sortedByCategoryAffinity = candidates.sort((a, b) => {
    const affinityA = profile.categoryAffinity[a.category] || 50;
    const affinityB = profile.categoryAffinity[b.category] || 50;
    return affinityB - affinityA;
  });
  return sortedByCategoryAffinity.slice(0, 12);
}
```

### Scoring Complexity

Scoring is O(n) where n = number of candidates:

```typescript
// For each candidate (~5-12)
function scoreCandidate(item, profile, targetState): number {
  // O(1) operations
  const difficultyMatch = 1 - Math.abs(item.stage - targetState) / 5;
  const categoryAffinity = profile.categoryAffinity[item.category] / 100;
  const noveltyScore = item.noveltyScore;
  const randomScore = Math.random();

  return difficultyMatch * 0.4 +
         categoryAffinity * 0.3 +
         noveltyScore * 0.2 +
         randomScore * 0.1;
}
```

Total: O(n) where n ≈ 10, very fast.

### Memory Usage

Profile is small (~1-5 KB):
```json
{
  "id": "user123",
  "progressionState": 2,
  "engagementScore": 55,
  "motor": { /* ~200 bytes */ },
  "spacedRepetition": {
    "A": ["word-cat", "word-dog"],  // ~50 IDs × 20 bytes
    "B": ["word-pizza"],
    "C": ["word-mom"]
  },
  "lastTenItems": ["word-1", "word-2"]  // 10 × 20 bytes
}
```

Content library is larger (~50-100 KB for 500 items).

### Optimization Opportunities

1. **Cache classification results**: Compute `stage`, `complexity` once per item
2. **Index by stage**: Group library by stage for faster filtering
3. **Lazy generation**: Generate phrases/sentences on-demand
4. **Batch updates**: Update profiles in batches rather than per-word

---

## Extension Points

### Adding New Stages

To add Stage 6 (longer sentences):

1. **Update ProgressionStage type**:
   ```typescript
   export type ProgressionStage = 1 | 2 | 3 | 4 | 5 | 6;
   ```

2. **Update ContentClassifier**:
   ```typescript
   if (wordCount >= 8) {
     return 6;  // Long sentences
   }
   ```

3. **Update computeTargetState**:
   ```typescript
   return Math.min(6, currentState + 1) as ProgressionStage;
   ```

### Adding New Categories

To add "sports" category:

1. **Update Category type**:
   ```typescript
   export type Category =
     | "animals"
     | "sports"  // New!
     | "food"
     // ...
   ```

2. **Add to content library**:
   ```typescript
   const sportsWords: ContentItem[] = [
     { text: "ball", category: "sports", /* ... */ },
     { text: "soccer", category: "sports", /* ... */ }
   ];
   ```

3. **Initialize in default profile**:
   ```typescript
   categoryAffinity: {
     sports: 50,  // Default neutral
     // ...
   }
   ```

### Custom Scoring Weights

Make weights configurable:

```typescript
interface ScoringWeights {
  difficulty: number;
  categoryAffinity: number;
  novelty: number;
  random: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  difficulty: 0.4,
  categoryAffinity: 0.3,
  novelty: 0.2,
  random: 0.1
};

function scoreCandidate(
  item: ContentItem,
  profile: LearnerProfile,
  targetState: ProgressionStage,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  return difficultyMatch * weights.difficulty +
         categoryAffinity * weights.categoryAffinity +
         noveltyScore * weights.novelty +
         randomScore * weights.random;
}
```

### Motor-Learning Features

Enable motor-learning-aware selection:

```typescript
function filterByMotorMetrics(
  candidates: ContentItem[],
  profile: LearnerProfile
): ContentItem[] {
  // If left hand has more errors, prefer right-hand words
  const preferRightHand = profile.motor.leftHandErrors > profile.motor.rightHandErrors;

  return candidates.filter(item => {
    const rightHandLetters = countRightHandLetters(item.text);
    const leftHandLetters = countLeftHandLetters(item.text);

    if (preferRightHand) {
      return rightHandLetters >= leftHandLetters;
    } else {
      return leftHandLetters >= rightHandLetters;
    }
  });
}
```

### A/B Testing Support

Add experiment variants:

```typescript
interface ExperimentConfig {
  engagementThreshold: number;
  reviewInterval: [number, number];
  scoringWeights: ScoringWeights;
}

const CONTROL_CONFIG: ExperimentConfig = {
  engagementThreshold: 60,
  reviewInterval: [5, 12],
  scoringWeights: DEFAULT_WEIGHTS
};

const VARIANT_A_CONFIG: ExperimentConfig = {
  engagementThreshold: 50,  // Lower threshold
  reviewInterval: [3, 8],   // More frequent reviews
  scoringWeights: {
    difficulty: 0.5,         // More weight on difficulty
    categoryAffinity: 0.2,
    novelty: 0.2,
    random: 0.1
  }
};
```

---

## Future Improvements

### Short-Term

1. **Seed random for deterministic testing**
2. **Add performance monitoring**
3. **Implement motor-learning features**
4. **Add A/B testing infrastructure**

### Medium-Term

1. **Machine learning for scoring weights**
2. **Personalized review intervals**
3. **Multi-language support**
4. **Offline-first architecture**

### Long-Term

1. **Adaptive difficulty curves**
2. **Social/multiplayer features**
3. **Teacher dashboard**
4. **Analytics and insights**

---

**Last Updated**: 2025-11-30
**Version**: 1.0.0
**Maintainer**: Reading Hero Team
