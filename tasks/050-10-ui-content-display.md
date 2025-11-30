# Task 050-10: UI Support for Variable-Length Content

**Priority**: INTEGRATION (Parallel with 050-09)
**Estimated Time**: 30 minutes
**Dependencies**: None (can run in parallel)

## Goal
Ensure UI handles words, phrases, and sentences without truncation.

## Files to Modify
- `src/components/WordDisplay.tsx` or equivalent
- CSS files for word display

## Requirements

### 1. Dynamic Font Sizing
Adjust font size based on content length:
```typescript
const getFontSize = (text: string): string => {
  const length = text.length;
  if (length <= 8) return '3rem';      // Large for short words
  if (length <= 15) return '2.5rem';   // Medium for words/phrases
  if (length <= 30) return '2rem';     // Smaller for sentences
  return '1.5rem';                     // Very small for long content
};
```

### 2. Preserve Whitespace
For phrases and sentences:
```css
.word-display {
  white-space: pre-wrap;     /* Preserve spaces */
  word-break: break-word;    /* Break long words if needed */
  text-align: center;
}
```

### 3. Container Sizing
Ensure container grows to fit content:
```css
.word-container {
  min-height: 4rem;
  max-width: 90%;
  margin: 0 auto;
  padding: 1rem;
}
```

### 4. Tile Display
For multi-word content, show all words in tiles:
- Split on spaces
- Create tile for each letter
- Add space tiles between words
- Style space tiles differently

```typescript
const renderTiles = (text: string) => {
  return text.split('').map((char, index) => (
    <Tile
      key={index}
      char={char}
      isSpace={char === ' '}
      isActive={index === currentLetterIndex}
    />
  ));
};
```

### 5. Sentence Case
Display sentences with proper capitalization:
- First letter uppercase
- Rest lowercase (unless proper noun)

## Acceptance Criteria
- [ ] Long words display without truncation
- [ ] Phrases show with spaces preserved
- [ ] Sentences display properly
- [ ] Font size adjusts dynamically
- [ ] Tiles work for multi-word content
- [ ] Space tiles styled appropriately
- [ ] No horizontal scrolling
- [ ] Responsive on all screen sizes
- [ ] TypeScript compiles without errors
