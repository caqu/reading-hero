# Task 050-02: Content Classification Module

**Priority**: CORE MODULE (Can run in parallel with 050-03, 050-04, 050-05)
**Estimated Time**: 45 minutes
**Dependencies**: 050-01 (Type schemas)

## Goal
Create the ContentClassifier module that classifies content items into progression stages.

## File to Create
`src/engine/ContentClassifier.ts`

## Functions to Implement

### 1. `getProgressionStage(item: ContentItem): ProgressionStage`
Classify based on:
- simple_words (1): CVC, CVCV patterns, 3-4 letters
- growing_words (2): 4-6 letters, simple blends
- sight_words (3): Dolch/Fry + abstract terms
- phrases (4): 2-word templates
- micro_sentences (5): 4-7 word sentences

### 2. `getOrthographicComplexity(item: ContentItem): number`
Return 1-5:
- 1 = simple (CVC)
- 2 = blend (bl, gr, st)
- 3 = digraph (ch, sh, th)
- 4 = irregular
- 5 = advanced

### 3. `getSemanticConcreteness(item: ContentItem): number`
Return 0-1 based on how visual/concrete the item is.
- Animals, objects: 1.0
- Abstract concepts: 0.3-0.5
- Actions: 0.6-0.8

### 4. `classifyForSR(item: ContentItem, profile: LearnerProfile): "A" | "B" | "C"`
Determine SR bin based on history and success rate.

## Acceptance Criteria
- [ ] All functions implemented
- [ ] Deterministic classification (same input = same output)
- [ ] No side effects
- [ ] TypeScript compiles without errors
- [ ] Handles edge cases (empty strings, long words)
