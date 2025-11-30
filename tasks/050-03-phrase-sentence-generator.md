# Task 050-03: Phrase and Sentence Generator

**Priority**: CORE MODULE (Can run in parallel with 050-02, 050-04, 050-05)
**Estimated Time**: 60 minutes
**Dependencies**: 050-01 (Type schemas)

## Goal
Create module to generate phrases and micro-sentences from seed words.

## File to Create
`src/engine/PhraseSentenceGenerator.ts`

## Functions to Implement

### 1. `generatePhrase(seedWord: ContentItem): ContentItem`
Pattern: `[article | adjective] + [noun]`

Examples:
- "big dog"
- "the monkey"
- "silly cat"

Rules:
- Max 2 words
- Must be visual
- Use seedWord as noun
- Assign stage: 4

### 2. `generateMicroSentence(seedWord: ContentItem): ContentItem`
Patterns:
- "The [noun] [verb]."
- "The [noun] is [adjective]."
- "[noun] [verb]s."

Examples:
- "The dog barks."
- "The monkey is silly."
- "Pizza rocks."

Rules:
- Max 7 words
- Must be visual
- Keep silly variants
- Assign stage: 5

### 3. Template Data
Create arrays of:
- Articles: ["the", "a"]
- Adjectives: ["big", "small", "silly", "happy", "fast", "slow"]
- Verbs: ["runs", "jumps", "dances", "sparkles", "flies", "swims"]

## Acceptance Criteria
- [ ] Both functions implemented
- [ ] Generated items have proper ContentItem structure
- [ ] Stage correctly assigned (4 for phrases, 5 for sentences)
- [ ] Category inherited from seed word
- [ ] Emoji included when appropriate
- [ ] TypeScript compiles without errors
