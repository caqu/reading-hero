# Task 050-12: Remove Old Sequencing Code

**Priority**: CLEANUP (After 050-09 verified working)
**Estimated Time**: 30 minutes
**Dependencies**: 050-09 (Integration) + 050-11 (Tests passing)

## Goal
Remove all old sequencing logic and unused code.

## Files to Review and Clean

### 1. Remove Old Tier System
Search for and remove:
- Old tier definitions (Tier 1-8 from planning doc)
- Tier-based filtering
- Tier promotion/demotion logic

### 2. Remove Old SM-2 Implementation
If exists, remove:
- SuperMemo algorithm code
- Complex interval calculations
- Old review scheduling

### 3. Remove Sentence Mode Toggle
Delete:
- `USE_SENTENCES` flag
- Sentence mode UI toggle
- Conditional rendering based on mode

### 4. Remove Random Shuffle Logic
Delete:
- ShuffleBag if no longer used
- Fisher-Yates shuffle for word order
- Random word selection functions

### 5. Clean Up Word List Generation
Remove:
- Hardcoded word ordering (cat, dad first)
- Old word list initialization
- Unused word templates

### 6. Remove Unused Imports
Clean up:
```typescript
// Remove unused imports from:
- src/App.tsx
- src/hooks/useGameState.ts
- src/data/words.ts
```

### 7. Delete Dead Files
Remove files if completely unused:
- Old sentence generator (if replaced)
- Old difficulty estimator
- Unused template files

## Verification Steps

### 1. Check TypeScript Compilation
```bash
npm run type-check
```

### 2. Run Tests
```bash
npm test
```

### 3. Test Game Manually
- Start game
- Play 20 words
- Verify no errors
- Check console logs

### 4. Check for Dead Code
Search for:
- Unused functions
- Unreferenced constants
- Dead imports

## Acceptance Criteria
- [ ] All old tier system code removed
- [ ] Old SM-2 removed (if existed)
- [ ] Sentence mode toggle removed
- [ ] Random shuffle removed
- [ ] Unused imports cleaned
- [ ] Dead files deleted
- [ ] TypeScript compiles without errors
- [ ] Tests still pass
- [ ] Game still playable
- [ ] No console errors
