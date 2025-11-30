# Task 050-11: End-to-End Testing

**Priority**: VALIDATION (After 050-09)
**Estimated Time**: 60 minutes
**Dependencies**: 050-09 (Integration complete)

## Goal
Create test harness to validate sequencer behavior.

## File to Create
`src/__tests__/sequencer.test.ts`

## Tests to Implement

### 1. Progression Direction
```typescript
test('should advance stage when performance is good', () => {
  // Setup: profile at stage 2, recent fast times, no errors
  // Execute: get next 10 items
  // Assert: eventually selects stage 3 items
});
```

### 2. Downshift on Errors
```typescript
test('should decrease stage when many errors', () => {
  // Setup: profile at stage 3, recent slow times, many errors
  // Execute: get next 10 items
  // Assert: eventually selects stage 2 items
});
```

### 3. Stable Level
```typescript
test('should stay at stage when mixed signals', () => {
  // Setup: profile at stage 2, mixed performance
  // Execute: get next 20 items
  // Assert: mostly stage 2 items
});
```

### 4. Phrase/Sentence Insertion
```typescript
test('should insert phrases at stage 4', () => {
  // Setup: profile at stage 4
  // Execute: get next 20 items
  // Assert: contains phrase items
});
```

### 5. Motor Learning Effects
```typescript
test('should select words with problem letters', () => {
  // Setup: profile with high errors on 'k'
  // Execute: get next 20 items
  // Assert: many items contain 'k'
});
```

### 6. SR-Lite Review Scheduling
```typescript
test('should inject reviews periodically', () => {
  // Setup: profile with items in bins B and C
  // Execute: get next 20 items
  // Assert: contains review items
});
```

### 7. Category Affinity
```typescript
test('should prefer high-affinity categories', () => {
  // Setup: profile with animals=90, food=20
  // Execute: get next 20 items
  // Assert: mostly animal items
});
```

### 8. No Recent Duplicates
```typescript
test('should avoid last 10 items', () => {
  // Setup: profile with lastTenItems filled
  // Execute: get next 10 items
  // Assert: no items from lastTenItems
});
```

## Test Utilities

### Mock Data
```typescript
const createMockProfile = (overrides?: Partial<LearnerProfile>): LearnerProfile => {
  // Return complete profile with defaults
};

const createMockHistory = (count: number): HistoryEntry[] => {
  // Return mock history entries
};

const createMockLibrary = (): ContentItem[] => {
  // Return test content library
};
```

## Acceptance Criteria
- [ ] All 8 tests implemented
- [ ] Tests pass consistently
- [ ] Mock utilities created
- [ ] Tests run with `npm test`
- [ ] Coverage for main sequencer logic
- [ ] No flaky tests
