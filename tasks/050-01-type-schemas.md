# Task 050-01: Create Type Schemas

**Priority**: FOUNDATION (Must complete first)
**Estimated Time**: 30 minutes
**Dependencies**: None

## Goal
Create all TypeScript type schemas for the new adaptive sequencing system.

## Files to Create

### 1. `src/types/ContentItem.ts`
```typescript
export type ProgressionStage = 1 | 2 | 3 | 4 | 5;

export type Category =
  | "animals" | "food" | "fantasy" | "tech" | "nature"
  | "actions" | "feelings" | "places" | "activities" | "nowWords";

export interface ContentItem {
  id: string;
  text: string;
  type: "word" | "phrase" | "sentence";
  stage: ProgressionStage;
  category: Category;
  syllables: number;
  letterCount: number;
  orthographicComplexity: number;
  emoji?: string;
  hasImage: boolean;
  hasASL: boolean;
  hasSpanish: boolean;
  srBin: "A" | "B" | "C";
  noveltyScore: number;
  concretenessScore: number;
}
```

### 2. `src/types/LearnerProfile.ts`
Complete learner profile schema with progression state, motor metrics, SR bins, etc.

### 3. `src/types/HistoryEntry.ts`
History logging schema.

### 4. `src/types/Sequencer.ts`
Sequencer input/output interfaces.

### 5. `src/types/GenerationTemplates.ts`
Phrase and sentence template schemas.

### 6. `src/types/Enums.ts`
Constants and enum helpers.

### 7. `src/types/ContentLibrary.ts`
Content library structure.

## Acceptance Criteria
- [ ] All 7 type files created
- [ ] No TypeScript errors
- [ ] All exports properly defined
- [ ] File compiles successfully
