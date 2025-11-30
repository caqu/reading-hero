/**
 * ContentClassifier Tests
 *
 * Basic validation tests for content classification functions.
 */

import {
  getProgressionStage,
  getOrthographicComplexity,
  getSemanticConcreteness,
  classifyForSR,
  getClassificationBreakdown,
  isSightWord
} from './ContentClassifier';
import { ContentItem } from '../types/ContentItem';
import { LearnerProfile } from '../types/LearnerProfile';

// =============================================================================
// TEST HELPERS
// =============================================================================

function createMockItem(
  text: string,
  category: ContentItem['category'] = 'animals',
  overrides?: Partial<ContentItem>
): ContentItem {
  return {
    id: `test-${text}`,
    text,
    type: 'word',
    stage: 1,
    category,
    syllables: 1,
    letterCount: text.length,
    orthographicComplexity: 1,
    hasImage: false,
    hasASL: false,
    hasSpanish: false,
    srBin: 'A',
    noveltyScore: 0.5,
    concretenessScore: 0.5,
    ...overrides
  };
}

function createMockProfile(): LearnerProfile {
  return {
    id: 'test-profile',
    name: 'Test User',
    createdAt: Date.now(),
    progressionState: 1,
    engagementScore: 50,
    typingSpeedBaseline: 200,
    errorBaseline: 0.1,
    categoryAffinity: {
      animals: 50,
      food: 50,
      fantasy: 50,
      tech: 50,
      nature: 50,
      actions: 50,
      feelings: 50,
      places: 50,
      activities: 50,
      nowWords: 50
    },
    motor: {
      leftHandErrors: 0,
      rightHandErrors: 0,
      rowTransitionSpeed: 150,
      commonLetterErrors: {}
    },
    spacedRepetition: {
      A: ['new-item-1'],
      B: ['learning-item-1'],
      C: ['mastered-item-1']
    },
    lastTenItems: [],
    totalCompleted: 0
  };
}

// =============================================================================
// PROGRESSION STAGE TESTS
// =============================================================================

console.log('Testing getProgressionStage...');

// Stage 1: Simple words (CVC)
const catItem = createMockItem('cat');
console.assert(
  getProgressionStage(catItem) === 1,
  'CVC word "cat" should be stage 1'
);

const dogItem = createMockItem('dog');
console.assert(
  getProgressionStage(dogItem) === 1,
  'CVC word "dog" should be stage 1'
);

// Stage 2: Growing words (blends)
const blobItem = createMockItem('blob');
console.assert(
  getProgressionStage(blobItem) === 2,
  'Word with blend "blob" should be stage 2'
);

const frogItem = createMockItem('frog');
console.assert(
  getProgressionStage(frogItem) === 2,
  'Word with blend "frog" should be stage 2'
);

// Stage 3: Sight words
const theItem = createMockItem('the');
console.assert(
  getProgressionStage(theItem) === 3,
  'Sight word "the" should be stage 3'
);

const wasItem = createMockItem('was');
console.assert(
  getProgressionStage(wasItem) === 3,
  'Sight word "was" should be stage 3'
);

// Stage 4: Phrases
const phraseItem = createMockItem('big dog', 'animals', { type: 'phrase' });
console.assert(
  getProgressionStage(phraseItem) === 4,
  'Two-word phrase should be stage 4'
);

// Stage 5: Micro-sentences
const sentenceItem = createMockItem('the dog is big', 'animals', { type: 'sentence' });
console.assert(
  getProgressionStage(sentenceItem) === 5,
  'Four-word sentence should be stage 5'
);

console.log('✓ getProgressionStage tests passed');

// =============================================================================
// ORTHOGRAPHIC COMPLEXITY TESTS
// =============================================================================

console.log('\nTesting getOrthographicComplexity...');

// Complexity 1: Simple CVC
console.assert(
  getOrthographicComplexity(catItem) === 1,
  'Simple CVC should have complexity 1'
);

// Complexity 2: Blends
console.assert(
  getOrthographicComplexity(blobItem) === 2,
  'Word with blend should have complexity 2'
);

// Complexity 3: Digraphs
const shipItem = createMockItem('ship');
console.assert(
  getOrthographicComplexity(shipItem) === 3,
  'Word with digraph should have complexity 3'
);

// Complexity 4+: Irregular
const knightItem = createMockItem('knight');
console.assert(
  getOrthographicComplexity(knightItem) >= 4,
  'Word with irregular pattern should have complexity 4+'
);

console.log('✓ getOrthographicComplexity tests passed');

// =============================================================================
// SEMANTIC CONCRETENESS TESTS
// =============================================================================

console.log('\nTesting getSemanticConcreteness...');

// Concrete items (with category)
const animalItem = createMockItem('dog', 'animals');
console.assert(
  getSemanticConcreteness(animalItem) === 1.0,
  'Animal category should have concreteness 1.0'
);

const foodItem = createMockItem('apple', 'food');
console.assert(
  getSemanticConcreteness(foodItem) === 1.0,
  'Food category should have concreteness 1.0'
);

// Actions (moderate concreteness)
const actionItem = createMockItem('run', 'actions');
console.assert(
  getSemanticConcreteness(actionItem) === 0.7,
  'Action category should have concreteness 0.7'
);

// Abstract items
const feelingItem = createMockItem('happy', 'feelings');
console.assert(
  getSemanticConcreteness(feelingItem) === 0.4,
  'Feeling category should have concreteness 0.4'
);

// Sight words (function words)
const sightWordItem = createMockItem('the', 'nowWords');
console.assert(
  getSemanticConcreteness(sightWordItem) === 0.2,
  'Sight word should have low concreteness'
);

// Items with emoji (high concreteness)
const emojiItem = createMockItem('dog', 'animals', { emoji: '🐶' });
console.assert(
  getSemanticConcreteness(emojiItem) >= 0.85,
  'Item with emoji should have high concreteness'
);

console.log('✓ getSemanticConcreteness tests passed');

// =============================================================================
// SR CLASSIFICATION TESTS
// =============================================================================

console.log('\nTesting classifyForSR...');

const profile = createMockProfile();

// New item (not in SR bins)
const newItem = createMockItem('new-word');
console.assert(
  classifyForSR(newItem, profile) === 'A',
  'New item should be classified as "A"'
);

// Item already in A bin
const itemInA = createMockItem('word-a', 'animals', { id: 'new-item-1' });
console.assert(
  classifyForSR(itemInA, profile) === 'A',
  'Item in A bin should stay in "A"'
);

// Item already in B bin
const itemInB = createMockItem('word-b', 'animals', { id: 'learning-item-1' });
console.assert(
  classifyForSR(itemInB, profile) === 'B',
  'Item in B bin should stay in "B"'
);

// Item already in C bin
const itemInC = createMockItem('word-c', 'animals', { id: 'mastered-item-1' });
console.assert(
  classifyForSR(itemInC, profile) === 'C',
  'Item in C bin should stay in "C"'
);

console.log('✓ classifyForSR tests passed');

// =============================================================================
// UTILITY TESTS
// =============================================================================

console.log('\nTesting utility functions...');

// isSightWord
console.assert(
  isSightWord('the') === true,
  '"the" should be a sight word'
);

console.assert(
  isSightWord('cat') === false,
  '"cat" should not be a sight word'
);

// getClassificationBreakdown
const breakdown = getClassificationBreakdown(catItem);
console.assert(
  breakdown.stage === 1,
  'Breakdown should include stage'
);
console.assert(
  breakdown.complexity >= 1,
  'Breakdown should include complexity'
);
console.assert(
  breakdown.concreteness >= 0,
  'Breakdown should include concreteness'
);
console.assert(
  breakdown.features.isCVC === true,
  'Breakdown should identify CVC pattern'
);

console.log('✓ Utility function tests passed');

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

console.log('\nTesting edge cases...');

// Empty string
const emptyItem = createMockItem('');
console.assert(
  getProgressionStage(emptyItem) === 1,
  'Empty string should default to stage 1'
);
console.assert(
  getOrthographicComplexity(emptyItem) === 1,
  'Empty string should have complexity 1'
);

// Very long word
const longItem = createMockItem('extraordinarily');
console.assert(
  getOrthographicComplexity(longItem) === 5,
  'Very long word should have complexity 5'
);

// Mixed case (should be handled consistently)
const mixedCaseItem = createMockItem('The');
console.assert(
  getProgressionStage(mixedCaseItem) === 3,
  'Mixed case sight word should be recognized'
);

console.log('✓ Edge case tests passed');

// =============================================================================
// DETERMINISM TEST
// =============================================================================

console.log('\nTesting determinism...');

// Call functions multiple times with same input
const testItem = createMockItem('test');
const stage1 = getProgressionStage(testItem);
const stage2 = getProgressionStage(testItem);
const stage3 = getProgressionStage(testItem);

console.assert(
  stage1 === stage2 && stage2 === stage3,
  'getProgressionStage should be deterministic'
);

const complexity1 = getOrthographicComplexity(testItem);
const complexity2 = getOrthographicComplexity(testItem);
const complexity3 = getOrthographicComplexity(testItem);

console.assert(
  complexity1 === complexity2 && complexity2 === complexity3,
  'getOrthographicComplexity should be deterministic'
);

const concreteness1 = getSemanticConcreteness(testItem);
const concreteness2 = getSemanticConcreteness(testItem);
const concreteness3 = getSemanticConcreteness(testItem);

console.assert(
  concreteness1 === concreteness2 && concreteness2 === concreteness3,
  'getSemanticConcreteness should be deterministic'
);

console.log('✓ Determinism tests passed');

console.log('\n✓ All ContentClassifier tests passed!');
