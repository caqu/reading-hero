# Adaptive Sequencing System - Design Document

**Status:** Planning Phase
**Task:** 040-sequence.md
**Date:** 2025-11-30
**Goal:** Design an intelligent word/phrase/sentence selection system that adapts to each learner without manual settings

---

## Executive Summary

This document proposes an **adaptive sequencing engine** that automatically selects the optimal next learning item (word, phrase, or sentence) for each student based on their performance, engagement, and developmental stage. The system eliminates all mode toggles and difficulty settings, providing a seamless, personalized learning experience from kindergarten through 5th grade.

**Key Design Principles:**
- Zero configuration - works out of the box
- Invisible adaptation - learners don't see difficulty changes
- Engagement-first - prioritizes sustained motivation
- Data-driven - learns from each interaction
- Graceful degradation - works without ASL/Spanish when unavailable

---

## 1. System Architecture Overview

### 1.1 Core Components

```
┌─────────────────────────────────────────────────────────┐
│                   Adaptive Sequencer                     │
│  (Decides: What word/phrase/sentence comes next?)       │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────┐         ┌────────▼─────────┐
│  Difficulty  │         │   Engagement      │
│  Estimator   │         │   Predictor       │
└───────┬──────┘         └────────┬──────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────▼─────────────┐
        │   Content Selector       │
        │  (Applies constraints)   │
        └────────────┬─────────────┘
                     │
        ┌────────────▼─────────────┐
        │  Profile Manager         │
        │  (Tracks learner state)  │
        └──────────────────────────┘
```

### 1.2 Data Flow

```
User completes word → Record metrics → Update profile →
Calculate difficulty match → Predict engagement →
Apply spaced repetition → Filter candidates →
Select optimal next item → Present to user
```

---

## 2. Content Organization

### 2.1 Difficulty Tiers (8 Levels)

Building on the existing word metadata and adding sentence complexity:

**Tier 1: Foundation CVC** (Kindergarten entry)
- Pattern: Consonant-Vowel-Consonant
- Examples: cat, dog, sun, bed, pig, fox
- Criteria: 3 letters, single syllable, common phonemes
- Count estimate: ~50 words

**Tier 2: Simple Nouns** (Late K / Early 1st)
- Pattern: 4-5 letter common nouns
- Examples: ball, tree, fish, milk, book
- Criteria: Concrete objects, emoji-representable
- Count estimate: ~100 words

**Tier 3: High-Frequency Sight Words** (1st grade)
- Source: Dolch Pre-K through 1st grade lists
- Examples: the, and, see, can, we, you, to
- Criteria: Essential for reading fluency
- Count estimate: ~100 words (Dolch 1-100)

**Tier 4: Extended Vocabulary** (2nd-3rd grade)
- Source: Fry 101-300, thematic high-interest words
- Examples: pizza, wizard, rainbow, computer, dragon
- Criteria: Multi-syllabic, high engagement value
- Count estimate: ~200 words

**Tier 5: Advanced Words** (3rd-4th grade)
- Source: Fry 301-500, content-area words
- Examples: volcano, elephant, skateboard, adventure
- Criteria: Complex orthography, academic vocabulary
- Count estimate: ~200 words

**Tier 6: Two-Word Phrases** (Transitional)
- Pattern: [Article/Adjective] + [Noun]
- Examples: "big dog", "silly cat", "the wizard"
- Criteria: Grammatically complete, visual
- Generation: Combine Tier 1-4 words

**Tier 7: Simple Patterned Sentences** (2nd-3rd grade)
- Pattern: Subject + Verb + Object/Adjective
- Examples: "The dog barks", "I see a cat", "The wizard sparkles"
- Criteria: Present tense, 3-5 words
- Generation: Use high-interest word templates

**Tier 8: Complex Sentences** (4th-5th grade)
- Pattern: Compound subjects/verbs, descriptive clauses
- Examples: "The rainbow is bright and beautiful", "The monkey dances on the tree"
- Criteria: 6+ words, coordinating conjunctions
- Generation: Advanced templates with modifiers

### 2.2 Content Metadata Extension

Enhance existing Word interface with sequencing metadata:

```typescript
interface ContentItem {
  // Existing fields
  id: string;
  text: string;
  type: "word" | "phrase" | "sentence";

  // New sequencing fields
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  orthographicPattern?: "CVC" | "CVCe" | "CVCC" | "digraph" | "blend" | "complex";
  syllableCount: number;
  letterCount: number;
  frequencyRank?: number;  // Fry/Dolch rank

  // Engagement metadata
  category: "animals" | "food" | "fantasy" | "tech" | "nature" | "actions" | "feelings" | "places" | "activities" | "nowWords";
  engagementTags: string[];  // ["silly", "cute", "cool", "magical"]
  surpriseFactor: number;    // 0-1 (0=predictable, 1=novel)

  // Multimodal support
  hasEmoji: boolean;
  hasASL: boolean;
  hasSpanish: boolean;

  // Spaced repetition
  lastSeen?: number;        // Timestamp
  reviewInterval?: number;  // Days until review
  easeFactor?: number;      // SR algorithm parameter
}
```

### 2.3 Category Distribution

Balance across 10 thematic categories:

| Category | % of Content | Engagement Type | Example Words |
|----------|-------------|-----------------|---------------|
| Animals | 25% | Cute, funny | monkey, dolphin, penguin |
| Food | 15% | Cozy, exciting | pizza, cookie, taco |
| Fantasy | 15% | Magical, dramatic | wizard, dragon, unicorn |
| Tech | 10% | Cool, modern | robot, emoji, selfie |
| Nature | 10% | Beautiful, calm | rainbow, ocean, flower |
| Actions | 10% | Active, dynamic | dance, jump, sparkle |
| Feelings | 5% | Emotional | happy, excited, brave |
| Places | 5% | Adventurous | castle, beach, space |
| Activities | 3% | Fun, social | soccer, music, art |
| Now Words | 2% | Relevant, current | podcast, avatar, meme |

---

## 3. Difficulty Estimation Engine

### 3.1 Rule-Based Difficulty Scoring

Calculate a difficulty score (0-100) for each content item:

**Base Difficulty Factors:**
- **Letter Count**:
  - 3 letters: +10 points
  - 4-5 letters: +20 points
  - 6-7 letters: +30 points
  - 8+ letters: +40 points

- **Syllable Count**:
  - 1 syllable: +5 points
  - 2 syllables: +15 points
  - 3+ syllables: +25 points

- **Orthographic Complexity**:
  - CVC pattern: +0 points (baseline)
  - Consonant blend (bl, gr, st): +10 points
  - Digraph (ch, sh, th, wh): +15 points
  - Silent letters: +20 points
  - Irregular spelling: +25 points

- **Word Type**:
  - Concrete noun with emoji: +0 points
  - Abstract noun: +10 points
  - Verb: +5 points
  - Phrase (2 words): +20 points
  - Simple sentence (3-5 words): +35 points
  - Complex sentence (6+ words): +50 points

**Difficulty Tier Ranges:**
- Tier 1 (CVC): 15-25 points
- Tier 2 (Simple): 25-35 points
- Tier 3 (Sight): 20-40 points (variable)
- Tier 4 (Extended): 40-55 points
- Tier 5 (Advanced): 55-70 points
- Tier 6 (Phrases): 50-65 points
- Tier 7 (Simple sentences): 65-80 points
- Tier 8 (Complex sentences): 80-100 points

### 3.2 Learner Difficulty Level (LDL)

Calculate the learner's current difficulty level (0-100) from recent performance:

**Inputs:**
- `recentAccuracy`: Average accuracy over last 20 words (0-1)
- `recentSpeed`: Normalized speed score (0-1, 1=fast)
- `recentFirstTry`: Percentage of words completed with zero errors (0-1)
- `currentUILevel`: Existing adaptive level (1-5)

**Formula:**
```
LDL = (recentAccuracy × 40) +
      (recentSpeed × 20) +
      (recentFirstTry × 30) +
      (currentUILevel × 2)
```

Result: 0-100 score representing what difficulty the learner can handle

**Example Calculations:**
- **Struggling K**: Accuracy 60%, Slow (0.3), FirstTry 40%, Level 1 → LDL = 24+6+12+2 = 44
- **Typical 1st**: Accuracy 80%, Medium (0.6), FirstTry 60%, Level 2 → LDL = 32+12+18+4 = 66
- **Advanced 3rd**: Accuracy 95%, Fast (0.9), FirstTry 85%, Level 4 → LDL = 38+18+25.5+8 = 89.5

### 3.3 Difficulty Matching Algorithm

**Optimal Challenge Zone:** LDL ± 10 points

Select content with difficulty score in the range `[LDL - 10, LDL + 10]` to maintain flow state:
- Too easy (< LDL - 10): Risk boredom
- Too hard (> LDL + 10): Risk frustration

**Dynamic Adjustments:**
- After 3 consecutive successes: Shift zone up by 5 points
- After 2 consecutive struggles (>3 errors): Shift zone down by 10 points
- After 10 items at same tier: Inject +1 tier item (novelty)

---

## 4. Engagement Prediction System

### 4.1 Engagement Signals

Track behavioral indicators of engagement:

**Positive Signals** (increase engagement score):
- Completing word faster than personal average (+10)
- Zero errors on first try (+15)
- Consecutive words in same category (+5 per word, max +20)
- Choosing to replay audio (+5)
- Session duration > 10 minutes (+10)

**Negative Signals** (decrease engagement score):
- Slow completion (>2× personal average) (-10)
- Multiple errors (>4) (-15)
- Abandoning mid-word (-30)
- Taking break >30 seconds (-5)
- Session duration < 3 minutes (-20)

**Engagement Score Formula:**
```
EngagementScore = Σ(signals over last 10 words) + baselineScore
```

Baseline score starts at 50, ranges from 0-100.

### 4.2 Category Affinity Tracking

Build a learner profile of category preferences:

```typescript
CategoryAffinity {
  animals: number;    // 0-100, higher = more interest
  food: number;
  fantasy: number;
  tech: number;
  nature: number;
  actions: number;
  feelings: number;
  places: number;
  activities: number;
  nowWords: number;
}
```

**Update Rules:**
- Fast completion (+5 to category)
- Zero errors (+10 to category)
- Slow completion or errors (-5 to category)
- Default all categories to 50 at start

**Usage:**
- Weight content selection by category affinity
- Inject high-affinity words during difficulty transitions
- Use for engagement recovery after struggles

### 4.3 Engagement-Based Content Rules

**High Engagement (Score > 70):**
- Maintain current difficulty tier
- Stay in preferred categories 80% of time
- Introduce novelty 20% of time
- Safe to advance to next tier

**Medium Engagement (Score 40-70):**
- Mix familiar and new content 50/50
- Inject surprise words every 5-7 items
- Rotate categories to discover interests
- Hold at current tier

**Low Engagement (Score < 40):**
- **Engagement recovery mode activated**
- Drop difficulty tier by 1
- Use only highest-affinity categories
- Inject "fun" words (silly, cute, magical tags)
- Shorten session to 5-10 words before break prompt

**Disengagement Pattern Detection:**
- 3 consecutive slow completions → Recovery mode
- 2 abandoned words in 10 → Recovery mode
- Average errors > 5 per word → Difficulty too high

---

## 5. Spaced Repetition Integration

### 5.1 Modified SuperMemo SM-2 Algorithm

Track each word's review schedule to reinforce learning:

**Initial State:**
- `easeFactor = 2.5` (difficulty of recall)
- `interval = 1 day` (time until next review)
- `repetitions = 0`

**After each review:**
```
if quality >= 3:  // Successful recall (0-2 errors)
  if repetitions == 0:
    interval = 1 day
  else if repetitions == 1:
    interval = 6 days
  else:
    interval = interval × easeFactor

  repetitions += 1
  easeFactor = easeFactor + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))

else:  // Failed recall (3+ errors or abandoned)
  repetitions = 0
  interval = 1 day
  easeFactor = max(1.3, easeFactor - 0.2)
```

**Quality Rating:**
- 5: Perfect (0 errors, fast)
- 4: Correct after hesitation (1-2 errors)
- 3: Correct with effort (2-3 errors)
- 2: Difficult (3-4 errors)
- 1: Failed (5+ errors)
- 0: Complete failure (abandoned)

### 5.2 Review Scheduling

**Review Pool Management:**
- Maintain separate "new content" and "review" pools
- Reviews are due when: `currentDate >= lastSeen + interval`
- Balance: 70% new content, 30% reviews (early learning)
- Later: 50% new, 50% review (maintenance phase)

**Integration with Sequencer:**
1. Check if any reviews are due
2. If yes and engagement > 40: Inject review word
3. Reviews count toward difficulty assessment
4. Failed reviews trigger additional practice

### 5.3 Forgetting Curve Considerations

**Retention Probability Model:**
```
P(retention) = e^(-time/interval)
```

- Words not reviewed for 3× their interval: Priority review
- Words failed 2+ times: Reduce tier, add to frequent rotation
- Words mastered (easeFactor > 3.0): Extend to monthly reviews

---

## 6. Adaptive Sequencing Algorithm

### 6.1 Main Selection Flow

**Every time "next word" is requested:**

```
1. Load learner profile (LDL, engagement, category affinities, review schedule)

2. Check for mandatory reviews:
   - If overdue reviews exist AND engagement > 40: Select review word
   - Apply difficulty matching to review candidates

3. Assess current state:
   - Calculate LDL from recent performance
   - Calculate engagement score
   - Determine optimal difficulty zone [LDL - 10, LDL + 10]

4. Build candidate pool:
   - Filter content by difficulty zone
   - Apply category affinity weights
   - Exclude recently seen (last 20 words)
   - Separate by tier

5. Apply sequencing rules:
   - If first 5 words ever: Use Tier 1 CVC only
   - If 80% same tier for 15 words: Force tier transition
   - If engagement < 40: Drop tier, use high-affinity categories
   - If engagement > 80 AND accuracy > 90%: Inject tier+1 item
   - Every 10th word: Inject "surprise" (random high-engagement word)

6. Select final item:
   - Score each candidate: (difficultyMatch × 0.5) + (engagementPredict × 0.3) + (novelty × 0.2)
   - Choose highest-scoring item
   - Apply randomness (±10% variance) to avoid predictability

7. Update state:
   - Mark item as "seen" with timestamp
   - Initialize spaced repetition data if new
   - Log selection reasoning for debugging

8. Return selected content item
```

### 6.2 Tier Transition Logic

**Moving Up (Promotion):**

Criteria (all must be met):
- Current tier average accuracy > 85% over 15 words
- Average errors per word < 2
- Engagement score > 50
- At least 20 words completed at current tier

Action:
- Open next tier for 20% of selections
- Gradually increase to 80% over next 20 words
- If new tier struggles, revert to 50/50 mix

**Moving Down (Support):**

Criteria (any trigger):
- Current tier accuracy < 60% over 10 words
- 3+ consecutive high-error words (>4 errors each)
- Engagement drop below 30

Action:
- Immediately shift to lower tier for next 5 words
- Use highest-affinity categories
- If recovery (accuracy > 75%), gradually reintroduce current tier

**Staying (Consolidation):**
- Accuracy 70-85%, engagement 40-70
- Mix tiers ±1 to maintain variety
- Focus on spaced repetition

### 6.3 Content Type Transitions

**Word → Phrase:**
- Minimum 50 words completed across Tiers 1-3
- Accuracy > 80% on words
- Engagement stable (> 50)
- Inject phrases 1 every 5 words initially

**Phrase → Sentence:**
- Minimum 30 phrases completed
- Comfortable with Tier 6
- LDL > 65
- Start with Tier 7 (simple sentences)

**Sentence → Complex Sentence:**
- 40+ simple sentences completed
- LDL > 80
- Accuracy > 85% on Tier 7
- Grade level 4+

**Backwards Transitions:**
- If sentences cause struggle (accuracy < 70%): Revert to phrases
- If phrases difficult: Return to words
- Always maintain engagement over progression

### 6.4 Novelty and Surprise Injection

**Surprise Word Rules:**
- Every 10th word: Select from "surprise pool"
- Surprise pool: High-engagement, visual (emoji/ASL), silly tags
- Difficulty: Same tier or easier (never harder)
- Categories: Rotate through all to discover interests

**Joke Sentences:**
- After 50 total sentences: 10% chance of joke sentence
- Examples: "the pizza dances", "the robot sings", "the wizard skateboards"
- Generated by mixing incompatible subject-verb pairs
- Maintains grammatical correctness for reading practice

---

## 7. Multi-Age Considerations

### 7.1 Age-Based Initial Calibration

**Kindergarten (Age 5-6):**
- Start: Tier 1 CVC words
- Progression: Slow, emphasis on foundation
- UI Level: Start at 1 (full scaffolding)
- Initial LDL: 25-35
- Category focus: Animals, food (concrete)

**1st Grade (Age 6-7):**
- Start: Tier 2-3 words
- Calibration window: 10 words to assess
- UI Level: Start at 1, quick progression to 2-3
- Initial LDL: 40-50
- Mix: Sight words + high-interest nouns

**2nd-3rd Grade (Age 7-9):**
- Start: Tier 4 words, introduce phrases quickly
- Calibration: 5 words, move to phrases if strong
- UI Level: Start at 2-3
- Initial LDL: 55-70
- Focus: Building fluency, sentence introduction

**4th-5th Grade (Age 9-11):**
- Start: Tier 7 sentences immediately
- Assess reading level with complex words
- UI Level: Start at 3-4
- Initial LDL: 75-90
- Goal: Multi-clause sentences, content vocabulary

### 7.2 Grade Level Override

Allow optional parent/teacher input for starting point:
- If provided: Use grade-appropriate tier and LDL
- If not provided: Use calibration window (first 10-20 items)
- Adaptive system overrides if mismatch detected

### 7.3 Deaf/Hard-of-Hearing Adaptations

**Visual-First Content Prioritization:**
- Filter: Require hasEmoji OR hasASL
- Prefer: Words with both emoji AND ASL
- Early tiers: Heavily weighted toward iconic signs
- Category emphasis: Visual categories (animals, objects, actions)

**ASL-Aware Sequencing:**
- Track ASL sign complexity (iconic vs arbitrary)
- Early: Iconic signs (ASL "animal" signs look like animals)
- Later: Introduce arbitrary signs
- If ASL video missing: Don't block progression, show emoji placeholder

**No Audio Dependency:**
- Never require audio for progression
- Audio is enhancement, not requirement
- All feedback is visual

---

## 8. Logging and Data Collection

### 8.1 Session Log Structure

Append to localStorage after each word/phrase/sentence completion:

```json
{
  "profileId": "prof-abc123",
  "sessionId": "sess-xyz789",
  "timestamp": 1234567890,
  "item": {
    "id": "word-cat",
    "text": "cat",
    "type": "word",
    "tier": 1,
    "category": "animals",
    "difficulty": 15
  },
  "performance": {
    "timeToCompleteMs": 4500,
    "totalKeystrokes": 5,
    "correctKeystrokes": 3,
    "incorrectKeystrokes": 2,
    "errorsByLetter": [
      {"letter": "a", "errors": 2}
    ],
    "firstTryCorrect": false,
    "abandoned": false
  },
  "context": {
    "uiLevel": 2,
    "sequenceNumber": 47,
    "wasReview": false,
    "learnerDifficultyLevel": 52,
    "engagementScore": 68,
    "categoryAffinity": {
      "animals": 75,
      "food": 60
    }
  },
  "audio": {
    "englishPlayed": true,
    "spanishPlayed": false,
    "replayCount": 0
  },
  "asl": {
    "videoAvailable": true,
    "videoPlayed": false
  }
}
```

### 8.2 Storage Strategy

**LocalStorage Schema:**
- Key: `reading-hero-session-logs`
- Value: Array of log entries
- Rotation: Keep last 500 entries per profile
- When full: Archive oldest 200 to `reading-hero-archived-logs`

**Data Retention:**
- Active logs: 500 most recent
- Archive: Last 2000 beyond active
- Total: ~2500 word completions stored
- Estimate: ~1MB storage (very reasonable)

### 8.3 Privacy and Safety

**Local-First Design:**
- All data stays in browser localStorage
- No server transmission
- No external analytics
- Parent/teacher can export/clear data

**Data Minimization:**
- Only log what's needed for sequencing
- No personally identifiable information
- Session IDs are random, not linkable

### 8.4 Debugging and Analysis

**Console Logging (Development):**
```javascript
console.log('[Sequencer] Selected word:', selectedItem);
console.log('[Sequencer] Reasoning:', {
  LDL: learnerDifficultyLevel,
  engagement: engagementScore,
  tierDistribution: candidateTiers,
  finalScore: selectedItem.score
});
```

**Analytics Export (Future):**
- Export JSON logs for offline analysis
- Parent dashboard showing:
  - Words per session
  - Accuracy trends
  - Category preferences
  - Difficulty progression
  - Session lengths

---

## 9. Spanish and ASL Integration

### 9.1 Bilingual Audio Strategy

**Automatic Spanish Support:**
- If Spanish translation available: Play after English
- Sequence unchanged by language
- Spanish is enrichment, not gate to progression
- Log which audio tracks played

**Audio Timing:**
- English word: On word reveal
- Spanish word: After word completion (optional)
- Sentence audio: After typing, before next sentence
- Never block next word on audio completion

### 9.2 ASL Video Integration Hooks

**Content Filtering:**
- If ASL mode enabled (deaf user): Prioritize hasASL words
- Graceful degradation: Allow words without ASL (show emoji)
- Sign complexity consideration: Iconic → Arbitrary progression

**Video Playback:**
- Autoplay: On word reveal (if preference enabled)
- Loop: Sign video loops until word completed
- Manual replay: Button available
- No video: Show emoji with "Sign video coming soon" note

### 9.3 Multimodal Content Priority

**Sequencing Weights When ASL Enabled:**
- Has ASL + Emoji: +30 selection points
- Has Emoji only: +10 points
- Neither: -20 points (avoid unless necessary)

**Content Generation:**
- Sentences: Only use words with visual support
- Phrases: Prefer compound signs (ASL compounds like "home+sick" = "homesick")

---

## 10. Implementation Roadmap (Not Implementation!)

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Replace random shuffle with basic adaptive selection

**Components:**
- Difficulty estimation for existing words
- LDL calculation from profile stats
- Basic candidate filtering (difficulty zone)
- Logging structure

**Output:** System selects words in appropriate difficulty range

### Phase 2: Engagement (Weeks 3-4)
**Goal:** Add engagement tracking and category affinity

**Components:**
- Engagement score calculation
- Category affinity tracking
- Engagement-based content rules
- Surprise injection

**Output:** System adapts to user interests

### Phase 3: Spaced Repetition (Weeks 5-6)
**Goal:** Intelligent review scheduling

**Components:**
- SM-2 algorithm implementation
- Review pool management
- Due date tracking
- Failed word intervention

**Output:** Words return at optimal intervals

### Phase 4: Tier Transitions (Weeks 7-8)
**Goal:** Seamless word → phrase → sentence progression

**Components:**
- Phrase generation from word pairs
- Sentence templates with high-interest words
- Tier promotion/demotion logic
- Type transition rules

**Output:** System advances content complexity automatically

### Phase 5: Multi-Age Optimization (Weeks 9-10)
**Goal:** Calibration and age-appropriate starting points

**Components:**
- Grade-based initial LDL
- Calibration window (first 10-20 words)
- Deaf/HoH adaptations
- Age-specific category weights

**Output:** Personalized starting experience

### Phase 6: Polish & Testing (Weeks 11-12)
**Goal:** Test with real users (your four kids!)

**Components:**
- Debug logging
- Performance tuning
- Edge case handling
- Analytics dashboard

**Output:** Production-ready adaptive system

---

## 11. Example Learner Journeys

### 11.1 Kindergartner (Emma, Age 5)

**Session 1 - Day 1:**
1. **cat** (Tier 1, CVC) - 3 errors, slow → LDL = 22, Engagement = 45
2. **dog** (Tier 1, CVC) - 2 errors → LDL = 25, Engagement = 50
3. **sun** (Tier 1, CVC) - 1 error → LDL = 30, Engagement = 58
4. **pig** (Tier 1, CVC) - 0 errors, faster! → LDL = 35, Engagement = 68
5. **fox** (Tier 1, CVC) - 0 errors → LDL = 38, Engagement = 72

**System Decision:** Strong progress, engagement rising, ready for slightly harder words

**Session 2 - Day 2:**
6. **bed** (Tier 1, but with digraph 'ed') - 2 errors → LDL = 36, Engagement = 68
7. **fish** (Tier 2, 4 letters) - 3 errors, slower → LDL = 33, Engagement = 60

**System Decision:** Tier 2 too soon, drop back to Tier 1

8. **ant** (Tier 1, CVC) - 0 errors → LDL = 37, Engagement = 70
9. **rat** (Tier 1, CVC) - 0 errors, fast → LDL = 41, Engagement = 78
10. **bat** (Tier 1, CVC) - 0 errors → LDL = 43, Engagement = 82

**System Decision:** Ready for Tier 2 again

**Session 10 - Week 2:**
- Confidently working in Tier 2 (ball, tree, milk)
- First two-word phrase introduced: "big dog"
- LDL = 58, mostly animals category (affinity: 85)

**Month 2:**
- Comfortable with Tier 3 sight words (the, and, see)
- Simple sentences: "I see a cat"
- LDL = 68, balanced categories

### 11.2 Third Grader (Liam, Age 8)

**Calibration - First 5 Words:**
1. **pizza** (Tier 4, high-interest) - 0 errors, fast → LDL = 72
2. **dragon** (Tier 4, complex) - 1 error → LDL = 75
3. **robot** (Tier 4) - 0 errors → LDL = 78
4. **the wizard** (Tier 6, phrase) - 1 error → LDL = 76
5. **The wizard sparkles** (Tier 7, sentence) - 2 errors, but completed → LDL = 74

**System Decision:** Strong foundation, jump to sentences immediately

**Session 1 Continued:**
6. **The dragon flies** (Tier 7, high-engagement) - 0 errors → Engagement = 88
7. **I see the robot** (Tier 7, sight words) - 0 errors → Engagement = 90
8. **The pizza is yummy** (Tier 7, silly!) - 0 errors, laughed → Engagement = 95

**System Decision:** High engagement with silly sentences, inject surprises

9. **The monkey dances** (Tier 7, action + animal) - 0 errors
10. **SURPRISE: The chicken skateboards** (Joke sentence!) - 1 error, loved it → Engagement = 98

**Week 2:**
- Consistently Tier 7-8 sentences
- Prefers fantasy and tech categories
- LDL = 82, trying complex sentences with conjunctions

### 11.3 Deaf Fourth Grader (Sophia, Age 9)

**Profile Setup:**
- ASL mode enabled
- Visual-first content filtering

**Session 1:**
1. **dog** (Tier 2, iconic ASL sign) - ASL video autoplays, 0 errors → Engagement = 75
2. **cat** (Tier 2, iconic) - 0 errors → Engagement = 80
3. **monkey** (Tier 2, iconic) - 0 errors, fast → Engagement = 85

**System Decision:** Visual learning very effective, advance quickly

4. **the dog** (Tier 6, phrase with iconic sign) - 1 error → LDL = 68
5. **the monkey jumps** (Tier 7, action sign available) - 2 errors → LDL = 66

**System Decision:** Sentences appropriate, focus on ASL-rich content

6. **the rainbow is bright** (Tier 7, visual emphasis) - 0 errors → Engagement = 90
7. **the dolphin swims** (Tier 7, animal + action) - 0 errors → Engagement = 92

**Week 2:**
- 80% of content has ASL videos
- Learns arbitrary signs (e.g., "orange", "computer")
- Sentences include sight words (ASL fingerspelled)
- LDL = 75, strong visual comprehension

**Month 2:**
- Complex sentences with ASL glosses
- Occasional emoji-only words (no ASL yet) integrated smoothly
- No audio used, purely visual + kinesthetic learning

### 11.4 Fifth Grader (Mia, Age 10)

**Calibration - First 3 Words:**
1. **The volcano erupts dramatically** (Tier 8, complex) - 1 error → LDL = 88
2. **The elephant and the zebra** (Tier 8, compound subject) - 0 errors → LDL = 92
3. **I love my skateboard** (Tier 8, possessive) - 0 errors → LDL = 94

**System Decision:** Advanced reader, jump to Tier 8 immediately

**Session 1:**
- All Tier 8 sentences
- Categories: Tech, fantasy, nature (diverse interests)
- Engagement: 85-90 throughout
- Joke sentence: "The wizard codes a website" → Loved it!

**Week 1:**
- Introducing academic vocabulary in sentences
- "The scientist observes the reaction"
- "The astronaut explores the galaxy"
- LDL = 95, near ceiling

**System Decision:** Maintain challenge with rare words, multi-clause sentences

**Month 1:**
- Reading full paragraphs (3-4 sentence sequences)
- Content-area words: volcano, ecosystem, civilization
- Still engaged through category variety and humor
- Some words marked for review (spaced repetition active)

---

## 12. Success Metrics and Acceptance Criteria

### 12.1 Quantitative Metrics

**System must achieve:**

- **Engagement Duration:**
  - Average session length > 10 minutes (vs current ~5 min)
  - 90% of sessions complete 10+ words

- **Accuracy Improvement:**
  - Overall accuracy increases 10% within 2 weeks
  - First-try correct rate > 70% by week 4

- **Difficulty Matching:**
  - 85% of words within LDL ± 15 points
  - <10% frustration events (accuracy < 50%)

- **Content Diversity:**
  - All 10 categories used within 50 words
  - No category exceeds 40% of selections
  - Tier transitions occur automatically

- **Spaced Repetition:**
  - 90% of reviews occur on-schedule (±2 days)
  - Review success rate > 80%

### 12.2 Qualitative Success Indicators

**From learner perspective:**
- No awareness of difficulty changes
- "It feels like it's reading my mind"
- Sustained motivation across sessions
- Requests to play more

**From parent/teacher perspective:**
- No need to configure settings
- Clear progress visible in stats
- Works for all age levels
- Smooth transitions between content types

### 12.3 Edge Cases Handled

- **Exceptional Performance:** If child completes 100 words with 95%+ accuracy, system doesn't "run out" of content
- **Prolonged Struggle:** If LDL drops below 20, system provides emergency scaffolding (Level 1 UI, Tier 1 only)
- **Long Absence:** If 7+ days between sessions, system injects review words and calibrates difficulty
- **ASL/Spanish Missing:** System gracefully degrades, continues with emoji/English only
- **Small Content Pool:** If <20 words in difficulty zone, expands range to avoid repetition

---

## 13. Future Enhancements (Beyond Initial Implementation)

### 13.1 Machine Learning Track (Phase 7, Optional)

**After 3-6 months of usage data collected:**

**Lightweight On-Device Model:**
- Input features:
  - Last 10 word difficulties
  - Last 10 engagement scores
  - Category affinities (10 dimensions)
  - Time of day, session number
  - Demographic (age, grade)
- Output: Predicted engagement score for each candidate word
- Model: Logistic regression or tiny neural net (TensorFlow.js)
- Training: On aggregated user data (your 4 kids initially)
- Update: Monthly retraining on new data

**Advantages:**
- More accurate engagement prediction
- Discovers non-obvious patterns (e.g., morning vs evening preferences)
- Personalized per-learner models

**Safeguards:**
- Rule-based system remains fallback
- ML suggestions must pass rule-based filters
- Explainability: Log why ML chose each word

### 13.2 Adaptive UI Scaffolding

**Currently:** UI level (1-5) adjusted by LevelingEngine
**Enhancement:** Sequencer coordinates with LevelingEngine

- If struggle detected: Both difficulty AND UI support increase
- If mastery: Both advance together
- Tighter integration for smoother experience

### 13.3 Multi-Session Stories

**Generate coherent 5-10 sentence narratives:**
- Select protagonist (e.g., "the wizard")
- Build story with consistent character
- Adaptive difficulty within story
- Maintains narrative engagement

Example:
1. "The wizard lives in a castle"
2. "The wizard has a dragon"
3. "The dragon is big and green"
4. "One day the dragon flies away"
5. "The wizard looks for the dragon"

### 13.4 Peer Comparison (Optional, Opt-In)

**Anonymous aggregate data:**
- Show: "Other 2nd graders averaged 65 words/week"
- Motivational, not competitive
- Only with parental consent

### 13.5 Parent Dashboard

**Web interface for:**
- Viewing child's progress
- Exporting session logs
- Manual content review
- Setting learning goals
- Adjusting category weights

---

## 14. Technical Architecture Notes

### 14.1 Code Organization

**New Files to Create:**
```
src/
  engine/
    AdaptiveSequencer.ts        // Main sequencing logic
    DifficultyEstimator.ts      // Content difficulty calculation
    EngagementPredictor.ts      // Engagement scoring
    SpacedRepetition.ts         // SM-2 implementation
    ContentSelector.ts          // Candidate filtering
  types/
    ContentItem.ts              // Extended word/phrase/sentence interface
    SequencerState.ts           // Learner state for sequencing
  utils/
    tierMapping.ts              // Difficulty tier definitions
    categoryWeights.ts          // Category distribution logic
```

**Modified Files:**
```
src/
  App.tsx                       // Replace shuffle with sequencer
  hooks/
    useGameState.ts             // Add sequencer integration
  engine/
    ProfileManager.ts           // Add sequencer state to profile
  pages/
    StatsPage.tsx               // Show sequencer insights
```

### 14.2 Performance Considerations

**Selection Speed:**
- Target: <50ms to select next word
- Candidate pool: Pre-filter to ~50 words max
- Scoring: Simple arithmetic, no complex algorithms
- Caching: Cache difficulty scores, recalculate only on new content

**Memory Usage:**
- Sequencer state: ~5KB per profile
- Session logs: ~1KB per word × 500 = ~500KB
- Total: <1MB additional storage per profile

**Startup Time:**
- Load profile: ~10ms
- Initialize sequencer: ~20ms
- First word selection: ~30ms
- Total: <100ms added to game start

### 14.3 Testing Strategy

**Unit Tests:**
- Difficulty calculation accuracy
- LDL calculation from stats
- Engagement score calculation
- Spaced repetition scheduling
- Tier transition logic

**Integration Tests:**
- Full selection flow
- Profile state updates
- Edge cases (empty pools, extreme performance)

**User Testing:**
- A/B test: Random shuffle vs adaptive
- Metrics: Session length, accuracy, engagement self-report
- 4 kids × 2 weeks × 2 conditions = 16 weeks total

---

## 15. Conclusion and Recommendations

### 15.1 Core Benefits

This adaptive sequencing system provides:

1. **Zero Configuration:** Works perfectly for K-5 without any settings
2. **Invisible Intelligence:** Learners don't perceive algorithm, just optimal challenge
3. **Sustained Engagement:** Content adapts to interests and performance
4. **Pedagogically Sound:** Follows research-based progression (CVC → complex sentences)
5. **Multimodal Support:** Gracefully handles ASL, Spanish, emoji availability
6. **Privacy-Preserving:** All data local, no external tracking
7. **Scalable:** Handles 50-5000+ content items efficiently

### 15.2 Recommended Implementation Order

**Priority 1 (MVP):**
- Difficulty estimation and LDL calculation
- Basic candidate filtering
- Tier-based progression
- Logging structure

**Priority 2 (Enhanced):**
- Engagement tracking
- Category affinity
- Surprise injection
- Tier transition rules

**Priority 3 (Advanced):**
- Spaced repetition
- Review scheduling
- Multi-age calibration
- Phrase/sentence generation

**Priority 4 (Polish):**
- Analytics dashboard
- Export functionality
- ML enhancement foundation

### 15.3 Key Success Factors

**For Implementation:**
- Start simple, iterate based on real usage
- Test with your 4 kids early and often
- Monitor engagement duration as primary metric
- Keep rule-based system transparent and debuggable

**For Adoption:**
- No changes required to existing UI
- Profiles continue to work unchanged
- Can toggle back to shuffle mode if needed
- Gradual rollout possible (enable for some profiles only)

### 15.4 Risk Mitigation

**Technical Risks:**
- **Complexity:** Start with rule-based only, no ML initially
- **Performance:** Pre-compute difficulty scores, cache aggressively
- **Bugs:** Comprehensive unit tests, fallback to shuffle if error

**User Experience Risks:**
- **Too Easy/Hard:** Generous difficulty zones (±15 points), quick adaptation
- **Boring:** Mandatory category rotation, surprise injection
- **Frustration:** Immediate drop to lower tier on struggle, engagement recovery mode

### 15.5 Final Thoughts

This adaptive sequencing system transforms Reading Hero from a "word flashcard app" into an intelligent, personalized reading tutor. By eliminating modes and settings, it becomes accessible to all ages while providing optimal challenge for each individual learner.

The beauty of the system is its **invisibility**: children simply experience a game that "gets them," presenting the perfect word at the perfect time. Parents and teachers see steady progress without any configuration burden.

Most importantly, this system respects both **engagement** (keeping kids motivated) and **learning** (ensuring meaningful progress). It's not just adaptive difficulty—it's adaptive **content**, choosing what to present based on a rich understanding of the learner's performance, interests, and developmental stage.

**This is the future of personalized education: intelligent, invisible, and infinitely patient.**

---

## Appendix A: Glossary

- **LDL**: Learner Difficulty Level (0-100 score)
- **Tier**: Content difficulty category (1-8)
- **Engagement Score**: Behavioral motivation indicator (0-100)
- **Category Affinity**: Interest level in content category (0-100)
- **Spaced Repetition**: Learning technique using increasing review intervals
- **SuperMemo SM-2**: Specific spaced repetition algorithm
- **Ease Factor**: Parameter controlling review interval growth
- **CVC**: Consonant-Vowel-Consonant word pattern (e.g., "cat")
- **Orthographic Pattern**: Spelling pattern category
- **Sight Word**: High-frequency word learned by recognition
- **Dolch List**: Set of 220 common sight words
- **Fry List**: Set of 1000 most common English words
- **Iconic Sign**: ASL sign that visually resembles its meaning
- **Arbitrary Sign**: ASL sign with no visual connection to meaning

## Appendix B: References

### Research Foundation
- **Zone of Proximal Development** (Vygotsky): Optimal challenge zone concept
- **Flow State** (Csikszentmihalyi): Engagement through balanced challenge
- **Spaced Repetition** (Ebbinghaus, Pimsleur): Forgetting curve and review intervals
- **SuperMemo SM-2 Algorithm** (Wozniak): Practical spaced repetition implementation
- **Adaptive Learning Systems**: ITS (Intelligent Tutoring Systems) research

### Literacy Frameworks
- **Dolch Sight Word List**: Pre-K through 3rd grade high-frequency words
- **Fry Instant Word List**: 1000 most common English words by frequency
- **Phonics Progression**: CVC → blends → digraphs → complex patterns
- **Emergent Literacy**: Developmental stages of reading acquisition

### Content Sources
- **Unicode CLDR**: Emoji descriptions and categorization
- **ASL Iconicity**: Levels of visual transparency in signs
- **High-Interest Word Lists**: Engagement-driven vocabulary selection

---

**Document Status:** Complete Planning Document
**Ready For:** Review → Approval → Implementation
**Estimated Implementation:** 8-12 weeks
**Next Steps:** Technical review, user testing plan, implementation sprint planning
