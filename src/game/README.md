# Game Modes System

This directory contains the implementation of the three core game modes for Reading Hero:

1. **Single Word Mode** - Type one word at a time
2. **Word Pair Mode** - Type two-word phrases (modifier + noun)
3. **Mini Sentence Mode** - Type short 3-5 word sentences

## Architecture

### Core Types (`types.ts`)

- `GameModeId` - Union type: `"single" | "pair" | "sentence"`
- `GameItem` - Represents a single unit of gameplay across all modes
- `GameItemStats` - Statistics tracked for each completed item
- `GameModeConfig` - Configuration options for game behavior

### Game Modes

Each game mode is implemented as a React hook that manages:
- State tracking (current character/letter index, completion status)
- Input validation
- Statistics collection
- Completion callbacks

#### Single Word Game (`modes/SingleWordGame.tsx`)

The core gameplay mode - type individual words letter by letter.

```typescript
import { useSingleWordGame } from './game';

const game = useSingleWordGame(
  word,
  config,
  onComplete,
  onKeyPress
);

// Use game.state and game.handleKeyPress
```

**Features:**
- Letter-by-letter typing
- Tracks correct/wrong key presses
- First-try-correct detection
- Duration tracking

#### Word Pair Game (`modes/WordPairGame.tsx`)

Type two-word phrases like "big dog", "funny cat", etc.

```typescript
import { useWordPairGame } from './game';

const game = useWordPairGame(
  noun,
  modifier,  // optional, auto-selected if not provided
  category,  // optional, for adjective selection
  config,
  onComplete,
  onKeyPress
);
```

**Features:**
- Auto-selects appropriate adjectives based on semantic category
- Categories: animal, food, toy, family
- Combines modifier + noun into single typing target
- Uses noun's emoji/image for visual representation

**Adjective Map:**
```typescript
{
  animal: ['big', 'little', 'funny', 'silly', 'happy', 'tiny'],
  food: ['hot', 'cold', 'yummy', 'fresh', 'sweet', 'tasty'],
  toy: ['new', 'old', 'fun', 'cool', 'soft', 'small'],
  family: ['nice', 'kind', 'dear', 'sweet', 'good'],
  default: ['big', 'little', 'new', 'old', 'nice', 'fun']
}
```

#### Mini Sentence Game (`modes/MiniSentenceGame.tsx`)

Type short 3-5 word sentences.

```typescript
import { useMiniSentenceGame, SEED_SENTENCES } from './game';

const game = useMiniSentenceGame(
  sentence,
  config,
  onComplete,
  onKeyPress
);
```

**Features:**
- 25 seed sentences included
- Categories: animal, family, general
- Full sentence typing (including spaces and punctuation)
- Tracks all referenced word IDs for mastery system

**Example Sentences:**
- "The dog barks." 🐶
- "I see a cat." 🐱
- "Mom is here." 👩
- "We can play." 🎮

### Game Runner (`GameRunner.tsx`)

Orchestrates the game modes and manages progression.

```typescript
import { useGameRunner } from './game';

const game = useGameRunner({
  mode: 'single',  // or 'pair' or 'sentence'
  words: WORD_LIST,
  category: 'animal',  // optional
  config: { showWordText: false },
  onItemComplete: (stats) => { /* track stats */ },
  onSessionComplete: () => { /* session done */ },
  onKeyPress: (key, correct) => { /* feedback */ }
});
```

**Responsibilities:**
- Mode selection and switching
- Content shuffling and selection
- Session management (tracking current item, completion)
- Unified interface across all modes

## Dev Testing

Use the `DevGameModePage` component to test all three modes:

```typescript
import { DevGameModePage } from '../pages/DevGameModePage';

// Render the dev page
<DevGameModePage onBack={() => { /* handle back */ }} />
```

**Features:**
- Mode selector buttons (Single / Pair / Sentence)
- Category filter (All / Animals / Family)
- Progress indicator
- Debug panel with full state inspection
- Works with sample words for quick testing

## Integration with Existing System

### Current Single-Word Gameplay

The existing `useGameState` hook and `GameScreen` component implement single-word typing. The new game mode system:

1. **Preserves existing behavior** - `SingleWordGame` wraps the same logic
2. **Adds new modes** - `WordPairGame` and `MiniSentenceGame` extend the experience
3. **Shared visual components** - Uses existing `WordCard`, `LetterTiles`, `OnScreenKeyboard`
4. **Compatible with stats** - `GameItemStats` can feed into mastery tracking

### Migration Path

To migrate existing gameplay to use the new system:

```typescript
// Old way (current)
const game = useGameState(words);

// New way (with game modes)
const gameRunner = useGameRunner({
  mode: 'single',
  words,
  onItemComplete: (stats) => {
    // Track stats for mastery system
  }
});
```

## Future Enhancements

### Planned Features

1. **WordBank Integration** - Use `WordEntry` objects from Task 021
2. **Learning Paths** - Follow progression paths from Task 022
3. **Mastery Tracking** - Feed into spaced repetition system (Task 024)
4. **Dynamic Sentence Generation** - Generate sentences from word clusters
5. **More Adjectives** - Expand adjective vocabulary per category
6. **Sentence Templates** - Template system for generating varied sentences

### Extensibility

Adding a new game mode:

1. Create hook in `modes/YourMode.tsx`
2. Implement `GameItem` generation
3. Track state with character/word index
4. Call `onComplete` with `GameItemStats`
5. Add to `GameRunner` mode switch
6. Export from `index.ts`

## Files Structure

```
src/game/
├── types.ts                      # Core type definitions
├── modes/
│   ├── SingleWordGame.tsx        # Single word mode
│   ├── WordPairGame.tsx          # Word pair mode
│   └── MiniSentenceGame.tsx      # Mini sentence mode
├── GameRunner.tsx                # Mode orchestrator
├── index.ts                      # Public exports
└── README.md                     # This file

src/pages/
└── DevGameModePage.tsx           # Dev testing UI
```

## API Reference

### GameItem

```typescript
interface GameItem {
  id: string;              // Unique ID
  displayText: string;     // What to show
  targetText: string;      // What to type (normalized)
  wordIds: string[];       // Referenced word IDs
  mode: GameModeId;        // Which mode
  emoji?: string;          // Optional emoji
  signVideoUrl?: string;   // Optional ASL video
  imageUrl?: string;       // Optional image
}
```

### GameItemStats

```typescript
interface GameItemStats {
  gameItem: GameItem;          // The completed item
  durationMs: number;          // Time taken
  correctKeys: number;         // Correct key presses
  wrongKeys: number;           // Wrong key presses
  firstTryCorrect: boolean;    // No mistakes
  completedAt: number;         // Timestamp
}
```

### Game State (Single)

```typescript
interface SingleWordGameState {
  gameItem: GameItem;
  currentLetterIndex: number;
  isComplete: boolean;
  startTime: number;
  correctKeys: number;
  wrongKeys: number;
  firstTryCorrect: boolean;
}
```

### Game State (Pair/Sentence)

```typescript
interface WordPairGameState {
  gameItem: GameItem;
  modifier: string;            // The adjective
  noun: Word;                  // The noun
  currentCharIndex: number;    // Current character (not letter)
  // ... same stats fields as SingleWordGameState
}
```

## Testing

Run TypeScript compilation check:

```bash
npx tsc --noEmit
```

All game mode files should compile without errors.

## Questions?

- For WordBank integration, see `src/data/wordRepository.ts`
- For word clusters, see Task 022
- For mastery tracking, see Task 024
- For visual components, see `src/components/`
