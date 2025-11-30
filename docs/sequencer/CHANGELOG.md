# Adaptive Sequencer Changelog

All notable changes to the Adaptive Sequencer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-11-30

### Added - Initial Release

#### Core Sequencer
- Pure function sequencer implementation (`AdaptiveSequencer.ts`)
- Five-stage progression model (simple words → sentences)
- Multi-factor scoring system (difficulty, category, novelty, random)
- Weighted scoring: 40% difficulty, 30% category affinity, 20% novelty, 10% random
- Target state computation based on speed and accuracy
- Candidate pool filtering (5-12 items)
- Top-3 selection with randomness

#### Content Classification
- Deterministic content classification (`ContentClassifier.ts`)
- Pattern detection (CVC, blends, digraphs, irregular patterns)
- Sight word recognition (200+ Dolch/Fry words)
- Orthographic complexity scoring (1-5 scale)
- Semantic concreteness scoring (0-1 scale)
- Stage classification for words, phrases, and sentences

#### Spaced Repetition
- 3-bin spaced repetition system (`SpacedRepetitionLite.ts`)
- Bin A: New items (0-1 attempts)
- Bin B: Learning items (2-4 attempts)
- Bin C: Mastered items (5+ attempts)
- Review injection every 5-12 items (personalized interval)
- 70/30 selection priority (B/C bins)
- Bin progression on success/failure

#### Engagement Tracking
- Engagement scoring system 0-100 (`EngagementTracker.ts`)
- Speed-based updates (+3 fast, -3 slow)
- Accuracy-based updates (+4 perfect, -4 many errors)
- Engagement gates for progression
- Recovery mode (< 30): hold steady or downshift
- Advancement gate (> 60): enable progression

#### Phrase/Sentence Generation
- Dynamic phrase generation (`PhraseSentenceGenerator.ts`)
- Phrase templates: [article + noun], [adjective + noun]
- Sentence templates: 3 patterns for variety
- Property inheritance from seed words
- Uniqueness guarantee within generation batch
- Syllable and complexity calculation

#### Motor-Learning Tracking
- Left/right hand error tracking (`motorMetrics.ts`)
- Common letter error tracking
- Row transition speed (top/home/bottom rows)
- Typing speed baseline (rolling average)
- Error baseline (rolling average)

#### Type System
- Comprehensive TypeScript types
- `ContentItem`, `LearnerProfile`, `HistoryEntry`
- `SequencerInput`, `SequencerOutput`
- `ProgressionStage` (1-5), `Category` (10 types)
- Type safety for all sequencer inputs/outputs

#### Documentation
- Complete README.md with all sections
- ARCHITECTURE.md with technical details
- CHANGELOG.md (this file)
- Code examples and usage patterns
- Troubleshooting guide
- Decision-making examples (4 scenarios)

#### Testing
- Unit tests for all core functions
- Integration tests for sequencer flow
- Example files for demonstration
- Test fixtures and utilities

### Design Decisions

#### Why Pure Functions?
- Predictable and deterministic behavior
- Easy to test without mocks
- Safe for concurrent execution
- Easy to debug and trace

#### Why 5 Stages?
- Gradual progression from CVC words to sentences
- Clear milestones for learners
- Sufficient granularity without overwhelming complexity

#### Why 3 Bins for SR?
- Simpler than traditional Leitner system
- Sufficient for early reading practice
- Easy to understand and implement
- Balances new content with review

#### Why Weighted Scoring?
- Balances multiple factors (difficulty, interest, novelty)
- 40% difficulty ensures appropriate challenge
- 30% category affinity maintains engagement
- 20% novelty prevents boredom
- 10% random adds variety

#### Why Target ± 1 Range?
- Smooth transitions between stages
- Provides challenge without overwhelming
- Allows for gradual difficulty increase

### Known Limitations

1. **Motor metrics not yet used in selection**: Tracked but not influencing item selection
2. **Fixed scoring weights**: Not yet configurable per learner
3. **No machine learning**: Weights are hand-tuned, not learned
4. **English-only patterns**: Classification assumes English orthography
5. **No multi-player support**: Single-player only
6. **LocalStorage persistence**: No cloud sync

### Performance

- Sequencer selection: < 10ms for 500-item library
- Profile updates: < 5ms
- Memory footprint: ~50-100 KB for content library, ~1-5 KB per profile

---

## [Unreleased]

### Planned Features

#### Version 1.1.0
- [ ] Motor-learning-aware selection
- [ ] Configurable scoring weights per profile
- [ ] Performance monitoring and metrics
- [ ] Enhanced logging for debugging

#### Version 1.2.0
- [ ] A/B testing infrastructure
- [ ] Personalized review intervals
- [ ] Category affinity learning
- [ ] Adaptive engagement thresholds

#### Version 2.0.0
- [ ] Machine learning for scoring weights
- [ ] Multi-language support
- [ ] Cloud sync for profiles
- [ ] Teacher dashboard
- [ ] Analytics and insights

---

## Migration Guide

### From Manual Selection to Adaptive Sequencer

**Before:**
```typescript
// Manual word selection
const nextWord = words[currentIndex];
currentIndex++;
```

**After:**
```typescript
// Adaptive selection
const output = getNextItem(profile, history, contentLibrary);
const nextWord = output.item;

// Log reasoning
console.log('[SEQ]', output.reason);
```

### Profile Schema Changes

**Before (v0.x):**
```typescript
interface OldProfile {
  id: string;
  currentLevel: number;  // Simple level counter
  wordsCompleted: number;
}
```

**After (v1.0):**
```typescript
interface LearnerProfile {
  id: string;
  progressionState: ProgressionStage;  // 1-5 stages
  engagementScore: number;             // 0-100
  typingSpeedBaseline: number;
  errorBaseline: number;
  categoryAffinity: Record<Category, number>;
  motor: { /* motor metrics */ };
  spacedRepetition: { A, B, C };
  lastTenItems: string[];
  totalCompleted: number;
}
```

**Migration Function:**
```typescript
function migrateProfile(oldProfile: OldProfile): LearnerProfile {
  return {
    id: oldProfile.id,
    name: oldProfile.name || "User",
    createdAt: Date.now(),
    progressionState: Math.min(5, Math.floor(oldProfile.currentLevel / 10) + 1),
    engagementScore: 50,  // Start neutral
    typingSpeedBaseline: 300,  // Default baseline
    errorBaseline: 1.5,
    categoryAffinity: createDefaultAffinity(),
    motor: createDefaultMotor(),
    spacedRepetition: { A: [], B: [], C: [] },
    lastTenItems: [],
    totalCompleted: oldProfile.wordsCompleted
  };
}
```

---

## Breaking Changes

### Version 1.0.0

#### Changed Function Signatures

**getNextItem()**: Now requires `history` parameter
```typescript
// Before (hypothetical v0.x)
getNextItem(profile: Profile, library: ContentItem[]): ContentItem

// After (v1.0)
getNextItem(
  profile: LearnerProfile,
  history: HistoryEntry[],
  library: ContentItem[]
): SequencerOutput
```

**ContentItem**: Added required fields
```typescript
// Before (hypothetical v0.x)
interface ContentItem {
  id: string;
  text: string;
}

// After (v1.0)
interface ContentItem {
  id: string;
  text: string;
  type: "word" | "phrase" | "sentence";  // NEW
  stage: ProgressionStage;                 // NEW
  category: Category;                      // NEW
  // ... many more fields
}
```

#### Removed Features

None (initial release).

---

## Deprecation Notices

### Version 1.0.0

None.

### Future Deprecations

- **v1.1.0**: `motor.commonLetterErrors` may be restructured for better performance
- **v2.0.0**: localStorage persistence may be replaced with cloud storage API

---

## Security

### Version 1.0.0

- No known security issues
- Profile data stored in localStorage (browser security applies)
- No external API calls
- No user data collection

---

## Contributors

### Version 1.0.0

- Initial implementation: Reading Hero Team
- Documentation: Reading Hero Team
- Testing: Reading Hero Team

---

## Support

For questions, issues, or feature requests:
- GitHub Issues: [TBD]
- Email: [TBD]
- Slack: [TBD]

---

**Note**: This changelog follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

---

**Last Updated**: 2025-11-30
**Current Version**: 1.0.0
