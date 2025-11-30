# Adaptive Sequencer Documentation

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [System Architecture](#system-architecture)
4. [The getNextItem Flow](#the-getnextitem-flow)
5. [Candidate Scoring](#candidate-scoring)
6. [Spaced Repetition (SR-Lite)](#spaced-repetition-sr-lite)
7. [Progression Model](#progression-model)
8. [Motor Learning](#motor-learning)
9. [Engagement Model](#engagement-model)
10. [Content Classification](#content-classification)
11. [Testing & Validation](#testing--validation)

---

## Overview

### What is the Adaptive Sequencer?

The Adaptive Sequencer is the core intelligence engine of Reading Hero that selects the next content item (word, phrase, or sentence) for a learner based on their current performance, interests, and learning history.

### Why it was Built

Traditional reading apps follow a fixed linear progression that doesn't adapt to individual learners. The Adaptive Sequencer was built to:

- **Personalize learning paths** based on real-time performance
- **Maintain engagement** by responding to learner motivation and interests
- **Balance challenge and support** to keep learners in their optimal learning zone
- **Reinforce learning** through intelligent spaced repetition
- **Leverage motor-learning patterns** from typing behavior to select appropriate content

### Key Benefits

1. **Pure Function Design**: The sequencer is a pure function with no side effects, making it predictable, testable, and easy to reason about
2. **Multi-Factor Decision Making**: Considers 4 weighted factors (difficulty, category affinity, novelty, randomness) for balanced selection
3. **Engagement-Aware**: Automatically adjusts difficulty when engagement drops below 30
4. **Spaced Repetition**: 3-bin system (A/B/C) ensures mastery through strategic review
5. **Progressive Complexity**: Five-stage model from simple CVC words to complete sentences

---

## Core Concepts

### Five-Stage Progression Model

The sequencer uses a five-stage progression model that gradually increases reading complexity.

#### Stage 1: Simple Words

**Characteristics:**
- CVC patterns (consonant-vowel-consonant)
- 3-4 letters
- Highly concrete and visual
- Examples: `cat`, `dog`, `sun`, `mom`

**Purpose:**
Build foundational phonics skills and letter-sound correspondence. These words are easy to decode and have clear visual associations.

**Content Properties:**
```typescript
{
  stage: 1,
  syllables: 1,
  letterCount: 3-4,
  orthographicComplexity: 1,
  concretenessScore: 0.8-1.0
}
```

#### Stage 2: Growing Words

**Characteristics:**
- 4-6 letters
- Simple consonant blends (bl, gr, st)
- High-interest vocabulary
- Examples: `pizza`, `robot`, `tiger`, `music`

**Purpose:**
Expand vocabulary with slightly longer words that maintain high interest. Introduces consonant blends while keeping words decodable.

**Content Properties:**
```typescript
{
  stage: 2,
  syllables: 2-3,
  letterCount: 4-6,
  orthographicComplexity: 2,
  concretenessScore: 0.7-1.0
}
```

#### Stage 3: Sight Words

**Characteristics:**
- Dolch/Fry high-frequency words
- Abstract terms
- Common in everyday reading
- Examples: `the`, `was`, `when`, `could`

**Purpose:**
Build fluency with words that appear frequently in texts but may not follow regular phonics patterns. Essential for reading comprehension.

**Content Properties:**
```typescript
{
  stage: 3,
  syllables: 1-2,
  letterCount: 2-5,
  orthographicComplexity: 1-3,
  concretenessScore: 0.2-0.5
}
```

**Note:** Sight words are identified from a curated list of 200+ high-frequency words from Dolch and Fry lists.

#### Stage 4: Phrases

**Characteristics:**
- 2-word combinations
- Patterns: [article + noun], [adjective + noun]
- Visual and concrete
- Examples: `big dog`, `the monkey`, `silly cat`

**Purpose:**
Transition from single-word reading to multi-word reading. Maintains concreteness while introducing simple grammatical structures.

**Content Properties:**
```typescript
{
  stage: 4,
  type: "phrase",
  syllables: 2-5,
  letterCount: 6-12,
  orthographicComplexity: 1-3,
  concretenessScore: 0.7-1.0
}
```

**Generation:**
Phrases are dynamically generated from seed words using templates:
- `[article] + [noun]` → "the dog"
- `[adjective] + [noun]` → "big dog"

#### Stage 5: Micro-Sentences

**Characteristics:**
- 4-7 words
- Simple Subject-Verb-Object structure
- Complete thoughts
- Examples: `The dog barks.`, `The monkey is silly.`, `Pizza rocks.`

**Purpose:**
Develop sentence-level comprehension with short, complete thoughts. Introduces basic sentence structure and punctuation.

**Content Properties:**
```typescript
{
  stage: 5,
  type: "sentence",
  syllables: 4-10,
  letterCount: 15-35,
  orthographicComplexity: 2-4,
  concretenessScore: 0.6-1.0
}
```

**Generation:**
Sentences are dynamically generated from seed words using templates:
- `The [noun] [verb].` → "The dog barks."
- `The [noun] is [adjective].` → "The cat is happy."
- `[Noun] [verb]s.` → "Pizza rocks."

### Difficulty Adaptation

The sequencer automatically adjusts difficulty based on three key factors: **speed**, **accuracy**, and **engagement**.

**Progression Logic:**

```
Current State → Performance Analysis → Target State
     ↓                   ↓                    ↓
  Stage 3          Fast + Few Errors      Stage 4 (advance)
  Stage 3          Slow + Many Errors     Stage 2 (support)
  Stage 3          Mixed Performance      Stage 3 (stay)
  Stage 3          Low Engagement        Stage 2 (recovery)
```

**Decision Criteria:**

1. **Advance One Stage (↑)**
   - Speed < 0.8x baseline (fast)
   - Errors < 0.7x baseline (few errors)
   - Engagement > 60 (ready to progress)

2. **Support/Downshift (↓)**
   - Speed > 1.5x baseline (slow)
   - Errors > 1.5x baseline (many errors)

3. **Hold Steady (=)**
   - Mixed performance
   - OR Engagement < 30 (engagement recovery mode)

### Engagement Gates

Engagement score acts as a gate that overrides progression:

| Engagement Score | Effect |
|-----------------|--------|
| < 30 | **Recovery Mode**: Hold steady or downshift |
| 30-60 | **Neutral**: Allow progression based on performance |
| > 60 | **Ready**: Enable advancement to next stage |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│ Learner Profile │
│  - Stage        │
│  - Engagement   │
│  - Baselines    │
│  - Affinity     │
│  - Motor Data   │
│  - SR Bins      │
└────────┬────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
         ▼                                  ▼
┌─────────────────┐                ┌──────────────────┐
│ Recent History  │                │ Content Library  │
│  - Last 10      │                │  - Words         │
│  - Performance  │                │  - Phrases       │
│  - Timing       │                │  - Sentences     │
└────────┬────────┘                └────────┬─────────┘
         │                                  │
         │         ┌──────────────┐         │
         └────────▶│  Sequencer   │◀────────┘
                   │ (Pure Func)  │
                   └──────┬───────┘
                          │
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
  ┌──────────┐    ┌──────────┐    ┌──────────────┐
  │ Target   │    │ Filter   │    │ Score        │
  │ State    │    │ Candidate│    │ Candidates   │
  │ (1-5)    │    │ Pool     │    │ (Weighted)   │
  └──────────┘    └──────────┘    └──────┬───────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ Select Top 3 │
                                   │ + Random     │
                                   └──────┬───────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ Next Item +  │
                                   │ Reasoning    │
                                   └──────────────┘
```

### Module Dependencies

```
AdaptiveSequencer.ts
  ├─ imports ContentClassifier.ts
  │    └─ getProgressionStage()
  ├─ imports SpacedRepetitionLite.ts
  │    ├─ shouldInjectReview()
  │    └─ selectReviewItem()
  ├─ imports EngagementTracker.ts
  │    ├─ shouldHoldSteady()
  │    └─ shouldAdvance()
  └─ exports getNextItem()

PhraseSentenceGenerator.ts
  ├─ imports ContentItem types
  └─ exports
       ├─ generatePhrase()
       ├─ generateMicroSentence()
       ├─ generatePhrases()
       └─ generateMicroSentences()

ProfileManager.ts
  └─ manages LearnerProfile state
```

### Pure Function Design

All sequencer logic is implemented as pure functions with no side effects:

```typescript
// ✅ Pure function - no mutations, no side effects
function computeTargetState(
  profile: LearnerProfile,
  history: HistoryEntry[]
): ProgressionStage {
  const currentState = profile.progressionState;
  // ... computation
  return targetState; // Returns new value
}
```

**Benefits:**
- Predictable and deterministic
- Easy to test without mocks
- Safe for concurrent execution
- Easy to debug and trace

---

## The getNextItem Flow

The `getNextItem` function is the main entry point for the sequencer. Here's how it works:

### Function Signature

```typescript
export function getNextItem(
  profile: LearnerProfile,
  history: HistoryEntry[],
  contentLibrary: ContentItem[]
): SequencerOutput
```

### Algorithm Steps

```
1. INPUT
   ├─ LearnerProfile (current state)
   ├─ HistoryEntry[] (recent performance)
   └─ ContentItem[] (available content)

2. COMPUTE TARGET STATE
   ├─ Analyze recent 10 entries
   ├─ Check engagement gates
   │    ├─ shouldHoldSteady() → engagement check
   │    └─ shouldAdvance() → engagement check
   ├─ Calculate avg speed vs baseline
   ├─ Calculate avg errors vs baseline
   └─ Determine progression direction → target state (1-5)

3. CHECK INJECTIONS
   ├─ SR review injection?
   │    ├─ shouldInjectReview() (every 5-12 items)
   │    └─ selectReviewItem() → review item or null
   │
   └─ Fun item injection?
        ├─ shouldInjectFunItem() (every ~7 items, 10% chance)
        └─ selectFunItem() → fun item or null

4. BUILD CANDIDATE POOL
   ├─ Filter by stage range (target ± 1)
   ├─ Exclude lastTenItems
   ├─ Narrow to 5-12 candidates
   └─ Prefer category affinity if > 12 candidates

5. SCORE CANDIDATES
   ├─ For each candidate:
   │    ├─ 40% difficulty match
   │    ├─ 30% category affinity
   │    ├─ 20% novelty score
   │    └─ 10% random variation
   └─ Sort by score (descending)

6. SELECT FROM TOP 3
   ├─ Take top 3 candidates
   ├─ Random selection from top 3
   └─ Add slight randomness for variety

7. OUTPUT
   ├─ ContentItem (next item to present)
   └─ SequencerReason (decision trace)
        ├─ progressionState
        ├─ targetDifficultyRange
        ├─ matchedCandidates
        ├─ selectedRank
        ├─ weightedScores
        ├─ usedSurprise
        └─ injectedReview
```

### Code Example

```typescript
import { getNextItem } from './engine/AdaptiveSequencer';

// 1. Load profile, history, and content library
const profile: LearnerProfile = loadProfile('user123');
const history: HistoryEntry[] = loadRecentHistory('user123', 10);
const contentLibrary: ContentItem[] = loadContentLibrary();

// 2. Get next item
const output = getNextItem(profile, history, contentLibrary);

// 3. Use the selected item
setCurrentWord(output.item);

// 4. Log reasoning (optional, for debugging)
console.log('[SEQ] Selected:', output.item.text);
console.log('[SEQ] Reason:', output.reason);
```

### Edge Cases

**Empty Library:**
```typescript
if (contentLibrary.length === 0) {
  throw new Error("Content library is empty");
}
```

**No Candidates Found:**
- Fallback to items not in lastTenItems
- Last resort: return first item from library

**No Review Items Available:**
- Fall through to normal selection

---

## Candidate Scoring

The sequencer uses a weighted scoring system to rank candidates. Each candidate receives a score from 0 to 1 based on four factors.

### Scoring Formula

```typescript
score =
  difficultyMatch * 0.4 +
  categoryAffinity * 0.3 +
  noveltyScore * 0.2 +
  randomScore * 0.1
```

### Scoring Components

#### 1. Difficulty Match (40% weight)

Measures how close the item's stage is to the target state:

```typescript
const stageDiff = Math.abs(item.stage - targetState);
const difficultyMatch = 1 - stageDiff / 5; // 0-1 scale

// Examples:
// Target: 3, Item: 3 → diff=0 → match=1.0 (perfect match)
// Target: 3, Item: 2 → diff=1 → match=0.8 (close)
// Target: 3, Item: 1 → diff=2 → match=0.6 (far)
```

**Why 40%?** Difficulty is the most important factor to ensure appropriate challenge level.

#### 2. Category Affinity (30% weight)

Measures learner's interest in the item's category:

```typescript
const categoryAffinity = (profile.categoryAffinity[item.category] || 50) / 100;

// Examples:
// Category "animals" with affinity 90 → 0.9
// Category "food" with affinity 45 → 0.45
// Unknown category → 0.5 (neutral)
```

**Why 30%?** Interests significantly impact engagement and motivation.

**Category Affinity Values:**
- 0-30: Low interest (avoid if possible)
- 31-70: Neutral (normal selection)
- 71-100: High interest (prioritize)

#### 3. Novelty Score (20% weight)

Measures how interesting/unusual the item is:

```typescript
const noveltyScore = item.noveltyScore; // 0-1 from item metadata

// Examples:
// Common word "the" → 0.1 (low novelty)
// Interesting word "pizza" → 0.8 (high novelty)
// Silly word "unicorn" → 0.95 (very high novelty)
```

**Why 20%?** Novelty prevents boredom and maintains engagement, but shouldn't override difficulty.

**Novelty Assignment:**
- Stage 1-2 words: 0.3-0.7 (varies by word)
- Stage 3 sight words: 0.1-0.4 (usually low)
- Phrases: 0.5-0.7
- Sentences: 0.6-0.9

#### 4. Random Variation (10% weight)

Adds unpredictability to prevent deterministic patterns:

```typescript
const randomScore = Math.random(); // 0-1

// Why random?
// - Prevents learners from predicting next item
// - Adds variety even with similar scores
// - Breaks ties between equally-scored items
```

**Why 10%?** Just enough to add variety without disrupting the adaptive logic.

### Scoring Example

```typescript
// Candidate: "monkey" (Stage 2, animals)
// Profile: Stage 2, animals affinity 85

// 1. Difficulty Match
const stageDiff = Math.abs(2 - 2); // 0
const difficultyMatch = 1 - 0/5; // 1.0
const difficultyScore = 1.0 * 0.4; // 0.4

// 2. Category Affinity
const categoryAffinity = 85 / 100; // 0.85
const categoryScore = 0.85 * 0.3; // 0.255

// 3. Novelty
const noveltyScore = 0.7; // monkey is interesting
const noveltyContribution = 0.7 * 0.2; // 0.14

// 4. Random
const randomScore = 0.65; // from Math.random()
const randomContribution = 0.65 * 0.1; // 0.065

// TOTAL SCORE
const totalScore = 0.4 + 0.255 + 0.14 + 0.065; // 0.86
```

### Selection Process

After scoring all candidates:

1. **Sort by Score** (descending)
   ```typescript
   scoredCandidates.sort((a, b) => b.score - a.score);
   ```

2. **Take Top 3**
   ```typescript
   const topCandidates = scoredCandidates.slice(0, 3);
   ```

3. **Random Selection from Top 3**
   ```typescript
   const selectedCandidate =
     topCandidates[Math.floor(Math.random() * topCandidates.length)];
   ```

**Why Top 3?**
- Ensures high-quality selection
- Adds variety (not always #1)
- Prevents predictability

### Tuning Weights

The weights (40%, 30%, 20%, 10%) are hand-tuned based on educational best practices. Future versions may make these configurable or learned per-learner.

**To adjust weights:**
```typescript
// In scoreCandidate() function
const score =
  difficultyMatch * 0.5 +      // Increase difficulty importance
  categoryAffinity * 0.2 +     // Decrease category importance
  noveltyScore * 0.2 +
  randomScore * 0.1;
```

---

## Spaced Repetition (SR-Lite)

The sequencer uses a simplified 3-bin spaced repetition system to reinforce learning without overwhelming learners.

### Three-Bin System

#### Bin A: New Items
- **Definition**: Unseen or seen once
- **Purpose**: Introduction to new content
- **Graduation**: Move to Bin B after successful completion

#### Bin B: Learning Items
- **Definition**: Practiced 2-4 times
- **Purpose**: Active learning phase
- **Graduation**: Move to Bin C after 5+ successful completions
- **Regression**: Move back to Bin A on failure

#### Bin C: Mastered Items
- **Definition**: 5+ successful repetitions
- **Purpose**: Long-term retention checks
- **Maintenance**: Stay in Bin C, but can regress to Bin B on failure

### Review Injection Timing

Reviews are injected periodically to reinforce learning:

```typescript
// Review interval: 5-12 items (varies by profile)
const profileHash = profile.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
const reviewInterval = 5 + (profileHash % 8); // 5-12 range

// Check if it's time for review
if (profile.totalCompleted % reviewInterval === 0) {
  injectReview();
}
```

**Key Points:**
- Each learner has a unique review interval (5-12 items) based on their profile ID
- Reviews only inject if items are available in Bins B or C
- Reviews are skipped for recent items (not in lastTenItems)

### Selection Priority

When injecting a review:

- **70% from Bin B** (learning items need more practice)
- **30% from Bin C** (mastered items need maintenance)

```typescript
const shouldSelectFromB = Math.random() < 0.7;

if (shouldSelectFromB && availableB.length > 0) {
  // Select from Bin B (learning)
} else if (availableC.length > 0) {
  // Select from Bin C (mastered)
}
```

### Bin Progression

**Success path:**
```
A (new) → B (learning) → C (mastered)
```

**Failure path:**
```
C (mastered) → B (learning)
B (learning) → A (new)
A (new) → A (stays)
```

### Implementation

```typescript
export function updateBinAfterCompletion(
  itemId: string,
  success: boolean,
  profile: LearnerProfile
): void {
  const { spacedRepetition } = profile;
  const currentBin = getBinForItem(itemId, profile);

  // Remove from current bin
  spacedRepetition[currentBin] = spacedRepetition[currentBin].filter(
    (id) => id !== itemId
  );

  if (success) {
    // Move forward: A → B → C
    if (currentBin === "A") {
      spacedRepetition.B.push(itemId);
    } else if (currentBin === "B") {
      spacedRepetition.C.push(itemId);
    } else {
      spacedRepetition.C.push(itemId); // Stay in C
    }
  } else {
    // Move backward: B → A, C → B
    if (currentBin === "A") {
      spacedRepetition.A.push(itemId); // Stay in A
    } else if (currentBin === "B") {
      spacedRepetition.A.push(itemId);
    } else {
      spacedRepetition.B.push(itemId); // C → B
    }
  }
}
```

### Example Flow

```
Item: "dog"
Attempt 1: Success → A → B
Attempt 2: Success → B → B
Attempt 3: Success → B → B
Attempt 4: Failure → B → A (regressed!)
Attempt 5: Success → A → B
Attempt 6: Success → B → B
Attempt 7: Success → B → C (mastered!)
Attempt 8+: Success → C → C (maintenance reviews)
```

---

## Progression Model

The progression model determines how learners advance through stages based on performance and engagement.

### Target State Computation

```typescript
function computeTargetState(
  profile: LearnerProfile,
  history: HistoryEntry[]
): ProgressionStage {
  const currentState = profile.progressionState;

  // 1. Check engagement
  if (shouldHoldSteady(profile.engagementScore)) {  // < 30
    return Math.max(1, currentState - 1) as ProgressionStage;
  }

  // 2. Analyze recent 10 entries
  const recentEntries = history.slice(-10);
  if (recentEntries.length < 3) {
    return currentState; // Not enough data
  }

  // 3. Calculate performance metrics
  const avgSpeed = recentEntries.reduce((sum, entry) => sum + entry.timeMs, 0) / recentEntries.length;
  const avgErrors = recentEntries.reduce((sum, entry) => sum + entry.errors, 0) / recentEntries.length;

  // 4. Estimate expected time
  const expectedTime = profile.typingSpeedBaseline * 5; // Assume 5-letter avg

  // 5. Determine shift direction
  const isFast = avgSpeed < expectedTime * 0.8;
  const isSlow = avgSpeed > expectedTime * 1.5;
  const fewErrors = avgErrors < profile.errorBaseline * 0.7;
  const manyErrors = avgErrors > profile.errorBaseline * 1.5;

  // 6. Decision logic
  if (isFast && fewErrors && shouldAdvance(profile.engagementScore)) {
    return Math.min(5, currentState + 1) as ProgressionStage; // Advance
  } else if (isSlow && manyErrors) {
    return Math.max(1, currentState - 1) as ProgressionStage; // Downshift
  }

  return currentState; // Hold steady
}
```

### Progression Rules

| Performance | Engagement | Action |
|------------|-----------|--------|
| Fast + Few errors | > 60 | **Advance** (+1 stage) |
| Slow + Many errors | Any | **Downshift** (-1 stage) |
| Mixed | 30-60 | **Hold** (same stage) |
| Any | < 30 | **Hold or Downshift** (recovery) |

### Performance Thresholds

**Speed Thresholds:**
- **Fast**: < 80% of baseline
- **Normal**: 80-150% of baseline
- **Slow**: > 150% of baseline

**Error Thresholds:**
- **Few errors**: < 70% of baseline
- **Normal**: 70-150% of baseline
- **Many errors**: > 150% of baseline

### Target Difficulty Range

The sequencer uses **target state ± 1** for candidate selection:

```
Current State: 3
Target State: 4 (wants to advance)
Candidate Range: [3, 4, 5]
→ Selects from Stages 3, 4, and 5
```

This creates smooth transitions with overlap between stages.

### Clamping

Target state is always clamped to valid range [1, 5]:

```typescript
return Math.max(1, Math.min(5, targetState)) as ProgressionStage;
```

---

## Motor Learning

The sequencer tracks keyboard typing patterns to understand motor learning progress.

### Tracked Metrics

#### 1. Left/Right Hand Errors

Tracks which hand makes more typing errors:

```typescript
motor: {
  leftHandErrors: 45,   // Total errors from left hand keys
  rightHandErrors: 32   // Total errors from right hand keys
}
```

**Key Mappings:**
- **Left hand**: `q, w, e, r, t, a, s, d, f, g, z, x, c, v, b`
- **Right hand**: `y, u, i, o, p, h, j, k, l, n, m`

**Usage:**
Future enhancement could prioritize words with more letters on the stronger hand.

#### 2. Common Letter Errors

Tracks specific letters that are frequently mistyped:

```typescript
motor: {
  commonLetterErrors: {
    'p': 8,   // Mistyped 'p' 8 times
    'q': 5,   // Mistyped 'q' 5 times
    'b': 3    // Mistyped 'b' 3 times
  }
}
```

**Usage:**
Future enhancement could avoid words with problematic letters during recovery mode.

#### 3. Row Transition Speed

Measures speed of moving between keyboard rows:

```typescript
motor: {
  rowTransitionSpeed: 450  // Average 450ms to move between rows
}
```

**Keyboard Rows:**
- **Top row**: `q, w, e, r, t, y, u, i, o, p`
- **Home row**: `a, s, d, f, g, h, j, k, l`
- **Bottom row**: `z, x, c, v, b, n, m`

**Calculation:**
```typescript
// Track correct keystrokes with row transitions
if (isRowTransition(prevKey, currKey)) {
  transitionTime = currKey.timestamp - prevKey.timestamp;
  transitionTimes.push(transitionTime);
}

// Rolling average (90% old, 10% new)
rowTransitionSpeed = (oldSpeed * 0.9) + (avgNewSpeed * 0.1);
```

#### 4. Typing Speed Baseline

Average milliseconds per letter:

```typescript
typingSpeedBaseline: 280  // 280ms per letter
```

**Calculation:**
```typescript
currentSpeed = wordTime / letterCount;
baseline = (oldBaseline * 0.9) + (currentSpeed * 0.1);
```

**Usage:**
Used to determine if learner is performing "fast" or "slow" relative to their norm.

### Update Process

Motor metrics update after each word completion:

```typescript
// 1. Collect keystroke data
const keystrokes: KeystrokeData[] = [
  { key: 'd', timestamp: 100, isCorrect: true, expectedKey: 'd' },
  { key: 'p', timestamp: 450, isCorrect: false, expectedKey: 'o' },
  { key: 'o', timestamp: 780, isCorrect: true, expectedKey: 'o' },
  { key: 'g', timestamp: 1100, isCorrect: true, expectedKey: 'g' }
];

// 2. Update metrics
const updatedMotor = updateMotorMetrics(
  profile,
  keystrokes,
  wordTime,
  letterCount
);

// 3. Update baselines
profile.typingSpeedBaseline = updateTypingSpeedBaseline(profile, wordTime, letterCount);
profile.errorBaseline = updateErrorBaseline(profile, errorCount);
```

### Future Enhancements

Motor-learning data enables potential sequencer improvements:

1. **Hand Balance**: Prioritize words that exercise the weaker hand
2. **Letter Avoidance**: During recovery mode, avoid words with frequently-mistyped letters
3. **Row Focus**: Practice specific row transitions that are slow
4. **Adaptive Timing**: Adjust expected completion times based on word's row transition count

---

## Engagement Model

The Engagement Model tracks learner motivation and emotional state on a 0-100 scale, using it to gate progression and prevent frustration.

### Engagement Score (0-100)

**Scale:**
- **0-29**: Low engagement (recovery mode)
- **30-70**: Medium engagement (normal operation)
- **71-100**: High engagement (ready to advance)

**Starting Value:**
New profiles start at 50 (neutral).

### Update Rules

Engagement updates after each word based on speed and accuracy:

#### Speed Component

| Performance | Delta |
|-------------|-------|
| < 0.8x baseline (much faster) | **+3** |
| 0.8-1.5x baseline (normal) | **0** |
| > 1.5x baseline (much slower) | **-3** |

#### Accuracy Component

| Performance | Delta |
|-------------|-------|
| 0 errors (perfect) | **+4** |
| 1-2 errors (minor) | **0** |
| 3+ errors (many) | **-4** |

#### Calculation Example

```typescript
// Starting engagement: 55
// Word: "cat" (3 letters)
// Time: 800ms, Baseline: 1200ms (fast!)
// Errors: 0 (perfect!)

delta = 0;  // Start at 0

// Speed check
if (800 < 1200 * 0.8) {  // 800 < 960
  delta += 3;  // +3 for fast
}

// Error check
if (errors === 0) {
  delta += 4;  // +4 for perfect
}

newEngagement = Math.min(100, 55 + 7);  // 62
```

### Effect on Sequencer

#### Low Engagement (< 30): Recovery Mode

```typescript
function computeTargetState(profile, history) {
  if (shouldHoldSteady(profile.engagementScore)) {  // < 30
    // Drop down one stage or hold steady
    return Math.max(1, currentState - 1);
  }
  // ... normal logic
}
```

**Behavior:**
- Prevents advancement even with good performance
- Prioritizes easier content
- Focuses on rebuilding confidence

#### Medium Engagement (30-70): Normal Operation

```typescript
// Normal progression logic applies
if (isFast && fewErrors) {
  // Can advance if performance is strong
}
```

#### High Engagement (> 60): Ready to Advance

```typescript
function computeTargetState(profile, history) {
  // ...
  if (isFast && fewErrors && shouldAdvance(profile.engagementScore)) {  // > 60
    return Math.min(5, currentState + 1);  // Advance!
  }
}
```

**Behavior:**
- Enables upward progression
- Learner is motivated and ready for challenges

### Implementation

```typescript
export function updateEngagementScore(
  profile: LearnerProfile,
  wordResult: WordResult
): number {
  const currentScore = profile.engagementScore;
  const timeMs = wordResult.timeToComplete;
  const baseline = profile.typingSpeedBaseline * wordResult.wordLength;
  const errors = wordResult.wrongKeyPresses;

  let delta = 0;

  // Speed comparison
  if (timeMs < baseline * 0.8) {
    delta += 3; // Much faster
  } else if (timeMs > baseline * 1.5) {
    delta -= 3; // Much slower
  }

  // Error comparison
  if (errors === 0) {
    delta += 4; // Perfect
  } else if (errors >= 3) {
    delta -= 4; // Many errors
  }

  // Clamp 0-100
  return Math.max(0, Math.min(100, currentScore + delta));
}
```

### Engagement Level Categorization

```typescript
function getEngagementLevel(score: number): "low" | "medium" | "high" {
  if (score < 30) return "low";
  if (score <= 70) return "medium";
  return "high";
}
```

### Example Engagement Flow

```
Word 1: "cat" - Fast, perfect → +7 → Engagement: 57
Word 2: "dog" - Fast, perfect → +7 → Engagement: 64
Word 3: "elephant" - Slow, 4 errors → -7 → Engagement: 57
Word 4: "sun" - Normal, 1 error → 0 → Engagement: 57
Word 5: "mom" - Fast, perfect → +7 → Engagement: 64
```

---

## Content Classification

The Content Classifier module (`ContentClassifier.ts`) provides deterministic classification of content items into stages, complexity levels, and semantic categories.

### Classification Functions

#### 1. getProgressionStage()

Classifies content into one of five progression stages:

```typescript
export function getProgressionStage(item: ContentItem): ProgressionStage {
  const text = item.text.toLowerCase().trim();
  const words = text.split(/\s+/);
  const wordCount = words.length;

  // Multi-word content
  if (wordCount >= 4) return 5; // micro_sentences
  if (wordCount >= 2) return 4; // phrases

  // Single word classification
  const word = words[0];

  // Sight words (high-frequency)
  if (COMMON_SIGHT_WORDS.has(word)) return 3;

  // Simple words (CVC or simple patterns)
  if (word.length <= 4 && (isCVC(word) || isSimpleRepeated(word))) {
    return 1;
  }

  // Growing words (4-6 letters with moderate complexity)
  if (word.length >= 4 && word.length <= 6) {
    if (hasBlend(word) && !hasDigraph(word) && !hasIrregularPattern(word)) {
      return 2;
    }
    if (!hasDigraph(word) && !hasIrregularPattern(word)) {
      return 2;
    }
  }

  // Default to sight words for longer or more complex terms
  return 3;
}
```

**Classification Logic:**
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

#### 2. getOrthographicComplexity()

Calculates complexity score (1-5) based on spelling patterns:

```typescript
export function getOrthographicComplexity(item: ContentItem): number {
  // For phrases/sentences, average complexity of component words
  if (words.length > 1) {
    const complexities = words.map(calculateWordComplexity);
    return Math.round(avg(complexities));
  }

  return calculateWordComplexity(word);
}

function calculateWordComplexity(word: string): number {
  // Advanced complexity
  if (word.length > 8 || hasIrregularPattern(word)) return 5;

  // Irregular patterns (silent letters, unusual combinations)
  if (hasIrregularPattern(word)) return 4;

  // Digraphs (ch, sh, th)
  if (hasDigraph(word)) return 3;

  // Blends (bl, gr, st)
  if (hasBlend(word)) return 2;

  // Simple (CVC or short words)
  return 1;
}
```

**Complexity Levels:**
- **1**: Simple CVC patterns (cat, dog)
- **2**: Consonant blends (blue, grass, stop)
- **3**: Digraphs (chick, ship, that)
- **4**: Irregular patterns (knight, cough)
- **5**: Advanced/complex (through, beautiful)

#### 3. getSemanticConcreteness()

Calculates concreteness score (0-1) based on how visual/tangible the concept is:

```typescript
export function getSemanticConcreteness(item: ContentItem): number {
  const firstWord = words[0];

  // Sight words (typically function words)
  if (firstWord && COMMON_SIGHT_WORDS.has(firstWord)) {
    return 0.2;
  }

  // Has emoji - likely concrete
  if (item.emoji) return 0.9;

  // Has image support
  if (item.hasImage) return 0.85;

  // Category-based scoring
  if (CONCRETE_CATEGORIES.has(item.category)) {
    return 1.0; // animals, food, nature, places, activities
  }

  if (item.category === "actions") {
    return 0.7; // verbs
  }

  if (ABSTRACT_CATEGORIES.has(item.category)) {
    return 0.4; // feelings, tech, fantasy
  }

  return 0.5; // Default neutral
}
```

**Concreteness Scale:**
- **1.0**: Highly visual/concrete (animals, objects, places)
- **0.7-0.8**: Actions (verbs)
- **0.3-0.5**: Abstract concepts (feelings, tech, fantasy)
- **0.0-0.2**: Function words (articles, prepositions)

#### 4. classifyForSR()

Classifies items into spaced repetition bins:

```typescript
export function classifyForSR(
  item: ContentItem,
  profile: LearnerProfile
): "A" | "B" | "C" {
  // Check if item already classified in profile
  if (profile.spacedRepetition.A.includes(item.id)) return "A";
  if (profile.spacedRepetition.B.includes(item.id)) return "B";
  if (profile.spacedRepetition.C.includes(item.id)) return "C";

  // New item - starts in "A" (new/unseen)
  return "A";
}
```

### Pattern Detection

The classifier uses several pattern detection helpers:

#### CVC Pattern

```typescript
function isCVC(word: string): boolean {
  if (word.length !== 3) return false;
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  return !vowels.has(word[0]) && vowels.has(word[1]) && !vowels.has(word[2]);
}

// Examples: cat, dog, sun, bed
```

#### Consonant Blends

```typescript
function hasBlend(word: string): boolean {
  const blends = [
    'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr',
    'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw'
  ];
  return blends.some(blend => word.includes(blend));
}

// Examples: blue, grass, stop, swim
```

#### Digraphs

```typescript
function hasDigraph(word: string): boolean {
  const digraphs = [
    'ch', 'sh', 'th', 'wh', 'ph', 'gh',
    'ck', 'ng', 'qu'
  ];
  return digraphs.some(digraph => word.includes(digraph));
}

// Examples: chick, ship, that, quick
```

#### Irregular Patterns

```typescript
function hasIrregularPattern(word: string): boolean {
  // Silent letters
  if (/kn|wr|gn|mb|bt|mn/.test(word)) return true;

  // Unusual vowel combinations
  if (/ough|augh|eigh|tion|sion|ous|ious/.test(word)) return true;

  // Long words (> 7 letters)
  if (word.length > 7) return true;

  return false;
}

// Examples: knight, cough, station, through
```

### Sight Words List

The classifier includes 200+ high-frequency sight words from Dolch and Fry lists:

**Common Sight Words:**
- Articles & pronouns: a, an, the, I, me, my, you, he, she, it, we, they
- Common verbs: is, am, are, was, were, be, have, has, had, do, can, will
- Prepositions: of, to, in, for, on, with, at, by, from, up, down
- Adjectives: all, some, any, no, good, new, big, small
- Numbers: one, two, three, four, five

### Usage Example

```typescript
import {
  getProgressionStage,
  getOrthographicComplexity,
  getSemanticConcreteness
} from './engine/ContentClassifier';

const item: ContentItem = {
  id: 'word-cat',
  text: 'cat',
  type: 'word',
  category: 'animals',
  emoji: '🐱',
  hasImage: true,
  // ... other fields
};

// Classify
const stage = getProgressionStage(item); // 1 (simple word)
const complexity = getOrthographicComplexity(item); // 1 (CVC)
const concreteness = getSemanticConcreteness(item); // 0.9 (has emoji)

console.log({ stage, complexity, concreteness });
```

---

## Testing & Validation

### Testing Strategy

The sequencer uses multiple testing approaches to ensure correctness and reliability.

#### 1. Unit Tests

Test individual functions in isolation:

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

  it('should downshift when performance is poor', () => {
    const profile: LearnerProfile = {
      progressionState: 3,
      engagementScore: 45,
      typingSpeedBaseline: 300,
      errorBaseline: 1.0,
    };

    const history: HistoryEntry[] = [
      { timeMs: 2500, errors: 4 },  // Slow + many errors
      { timeMs: 2800, errors: 5 },
      { timeMs: 2600, errors: 3 },
    ];

    const target = computeTargetState(profile, history);
    expect(target).toBe(2);  // Downshifted from 3 to 2
  });

  it('should hold steady with low engagement', () => {
    const profile: LearnerProfile = {
      progressionState: 2,
      engagementScore: 25,  // LOW!
      typingSpeedBaseline: 300,
      errorBaseline: 1.0,
    };

    const history: HistoryEntry[] = [];

    const target = computeTargetState(profile, history);
    expect(target).toBeLessThanOrEqual(2);  // Hold or downshift
  });
});
```

#### 2. Integration Tests

Test multiple modules together:

```typescript
describe('AdaptiveSequencer integration', () => {
  it('should inject review at correct interval', () => {
    const profile = createTestProfile({ totalCompleted: 14 });
    const history = createTestHistory(10);
    const library = createTestLibrary();

    // Seed SR bins
    profile.spacedRepetition.B = ['word-dog', 'word-cat'];

    const output = getNextItem(profile, history, library);

    expect(output.reason.injectedReview).toBe(true);
    expect(['dog', 'cat']).toContain(output.item.text);
  });

  it('should respect engagement gates', () => {
    const profile = createTestProfile({
      progressionState: 2,
      engagementScore: 25  // LOW
    });

    const history = createTestHistory(10, { fast: true, accurate: true });
    const library = createTestLibrary();

    const output = getNextItem(profile, history, library);

    // Should not advance despite good performance
    expect(output.reason.progressionState).toBeLessThanOrEqual(2);
  });
});
```

#### 3. Property-Based Tests

Test invariants across random inputs:

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

### Validation Techniques

#### 1. Type Checking

TypeScript ensures type safety at compile time:

```typescript
// This will fail at compile time
const invalidStage: ProgressionStage = 6; // Error: Type '6' is not assignable

// This will pass
const validStage: ProgressionStage = 3; // OK
```

#### 2. Runtime Assertions

Add runtime checks for critical invariants:

```typescript
function scoreCandidate(
  item: ContentItem,
  profile: LearnerProfile,
  targetState: ProgressionStage
): number {
  const score = /* ... calculation ... */;

  // Validate score range
  console.assert(score >= 0 && score <= 1, `Invalid score: ${score}`);

  return score;
}
```

#### 3. Example Files

Use example files to demonstrate correct usage:

```typescript
// AdaptiveSequencer.example.ts
function demoNormalProgression() {
  const profile = createSampleProfile();
  const history = createSampleHistory();
  const library = createSampleLibrary();

  const result = getNextItem(profile, history, library);

  console.log('Selected:', result.item.text);
  console.log('Reasoning:', result.reason);
}
```

### Troubleshooting Common Issues

#### Issue 1: Items Repeating Too Often

**Diagnosis:**
```typescript
console.log('Recent items:', profile.lastTenItems);
console.log('Candidates found:', output.reason.matchedCandidates);
```

**Solutions:**
1. Increase content library size
2. Check lastTenItems is updating
3. Widen candidate range

#### Issue 2: Progression Too Fast/Slow

**Diagnosis:**
```typescript
console.log('Engagement:', profile.engagementScore);
console.log('Speed:', avgSpeed, 'vs baseline:', baseline * 0.8);
console.log('Should advance?', shouldAdvance(profile.engagementScore));
```

**Solutions:**
1. Adjust advancement thresholds
2. Modify engagement gates
3. Require more consistent performance

#### Issue 3: Spaced Repetition Not Working

**Diagnosis:**
```typescript
console.log('Bin A:', profile.spacedRepetition.A);
console.log('Bin B:', profile.spacedRepetition.B);
console.log('Bin C:', profile.spacedRepetition.C);
console.log('Should inject review?', shouldInjectReview(profile));
```

**Solutions:**
1. Ensure bins are updating after completion
2. Add items to bins initially
3. Check lastTenItems exclusion

### Debugging Tools

#### 1. Verbose Logging

```typescript
const output = getNextItem(profile, history, contentLibrary);

console.log('[SEQ] Selected:', output.item.text);
console.log('[SEQ] Reason:', JSON.stringify(output.reason, null, 2));
console.log('[SEQ] Scores:', output.reason.weightedScores);
```

#### 2. Classification Breakdown

```typescript
import { getClassificationBreakdown } from './engine/ContentClassifier';

const breakdown = getClassificationBreakdown(item);
console.log({
  stage: breakdown.stage,
  complexity: breakdown.complexity,
  concreteness: breakdown.concreteness,
  features: breakdown.features
});
```

#### 3. Performance Monitoring

```typescript
const startTime = performance.now();
const output = getNextItem(profile, history, library);
const endTime = performance.now();

console.log(`Selection took ${endTime - startTime}ms`);
```

### Test Coverage

Current test coverage:
- **AdaptiveSequencer**: 95% (unit + integration)
- **ContentClassifier**: 100% (comprehensive unit tests)
- **SpacedRepetitionLite**: 90% (unit tests)
- **EngagementTracker**: 100% (unit tests)
- **PhraseSentenceGenerator**: 85% (unit tests)

---

## Code Examples

### Basic Usage

```typescript
import { getNextItem } from './engine/AdaptiveSequencer';
import { LearnerProfile } from './types/LearnerProfile';
import { HistoryEntry } from './types/HistoryEntry';
import { ContentItem } from './types/ContentItem';

// 1. Load profile, history, and content library
const profile: LearnerProfile = loadProfile('user123');
const history: HistoryEntry[] = loadRecentHistory('user123', 10);
const contentLibrary: ContentItem[] = loadContentLibrary();

// 2. Get next item
const output = getNextItem(profile, history, contentLibrary);

// 3. Use the selected item
setCurrentWord(output.item);

// 4. Log reasoning (optional, for debugging)
console.log('[SEQ]', output.reason);
```

### Updating Profile After Word Completion

```typescript
import { updateEngagementScore } from './engine/EngagementTracker';
import { updateBinAfterCompletion } from './engine/SpacedRepetitionLite';
import { updateMotorMetrics } from './utils/motorMetrics';

// After learner completes a word
function onWordComplete(profile: LearnerProfile, result: WordResult) {
  // 1. Update engagement score
  profile.engagementScore = updateEngagementScore(profile, result);

  // 2. Update SR bin
  const success = result.wrongKeyPresses < 3;
  updateBinAfterCompletion(result.itemId, success, profile);

  // 3. Update motor metrics
  profile.motor = updateMotorMetrics(
    profile,
    result.keystrokes,
    result.timeToComplete,
    result.wordLength
  );

  // 4. Update baselines (rolling averages)
  const speedPerLetter = result.timeToComplete / result.wordLength;
  profile.typingSpeedBaseline =
    (profile.typingSpeedBaseline * 0.9) + (speedPerLetter * 0.1);

  profile.errorBaseline =
    (profile.errorBaseline * 0.9) + (result.wrongKeyPresses * 0.1);

  // 5. Update recent items
  profile.lastTenItems.push(result.itemId);
  if (profile.lastTenItems.length > 10) {
    profile.lastTenItems.shift();
  }

  // 6. Update total completed
  profile.totalCompleted++;

  // 7. Save profile
  saveProfile(profile);
}
```

### Generating Dynamic Content

```typescript
import { generatePhrase, generateMicroSentence } from './engine/PhraseSentenceGenerator';

// Select a seed word
const seedWord: ContentItem = {
  id: 'word-dog',
  text: 'dog',
  type: 'word',
  stage: 1,
  category: 'animals',
  syllables: 1,
  letterCount: 3,
  orthographicComplexity: 1,
  emoji: '🐶',
  hasImage: true,
  hasASL: true,
  hasSpanish: true,
  srBin: 'A',
  noveltyScore: 0.6,
  concretenessScore: 0.9
};

// Generate phrase
const phrase = generatePhrase(seedWord);
console.log(phrase.text); // "big dog" or "the dog"

// Generate sentence
const sentence = generateMicroSentence(seedWord);
console.log(sentence.text); // "The dog runs." or "The dog is silly."
```

---

## Additional Resources

- **ARCHITECTURE.md**: Technical details about module structure and design patterns
- **CHANGELOG.md**: Version history and breaking changes
- **Test files**: See `*.test.ts` files for usage examples
- **Example files**: See `*.example.ts` files for runnable demonstrations

---

**Last Updated**: 2025-11-30
**Version**: 1.0.0
**Maintainer**: Reading Hero Team
