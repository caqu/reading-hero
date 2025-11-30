/**
 * ContentClassifier Usage Examples
 *
 * Demonstrates how to use the ContentClassifier module
 * for classifying words, phrases, and sentences.
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
// EXAMPLE 1: Classify a simple word
// =============================================================================

const catWord: ContentItem = {
  id: 'word-cat',
  text: 'cat',
  type: 'word',
  stage: 1, // Will be overridden by classification
  category: 'animals',
  syllables: 1,
  letterCount: 3,
  orthographicComplexity: 1,
  hasImage: true,
  hasASL: false,
  hasSpanish: true,
  emoji: '🐱',
  srBin: 'A',
  noveltyScore: 0.8,
  concretenessScore: 1.0
};

console.log('=== Example 1: Simple Word Classification ===');
console.log('Word:', catWord.text);
console.log('Stage:', getProgressionStage(catWord)); // Should be 1 (CVC)
console.log('Complexity:', getOrthographicComplexity(catWord)); // Should be 1
console.log('Concreteness:', getSemanticConcreteness(catWord)); // Should be 0.9 (has emoji)
console.log();

// =============================================================================
// EXAMPLE 2: Classify a sight word
// =============================================================================

const theWord: ContentItem = {
  id: 'word-the',
  text: 'the',
  type: 'word',
  stage: 3,
  category: 'nowWords',
  syllables: 1,
  letterCount: 3,
  orthographicComplexity: 1,
  hasImage: false,
  hasASL: false,
  hasSpanish: true,
  srBin: 'A',
  noveltyScore: 0.1,
  concretenessScore: 0.2
};

console.log('=== Example 2: Sight Word Classification ===');
console.log('Word:', theWord.text);
console.log('Is sight word:', isSightWord(theWord.text)); // true
console.log('Stage:', getProgressionStage(theWord)); // Should be 3 (sight word)
console.log('Concreteness:', getSemanticConcreteness(theWord)); // Should be 0.2 (function word)
console.log();

// =============================================================================
// EXAMPLE 3: Classify a phrase
// =============================================================================

const phrase: ContentItem = {
  id: 'phrase-big-dog',
  text: 'big dog',
  type: 'phrase',
  stage: 4,
  category: 'animals',
  syllables: 2,
  letterCount: 7,
  orthographicComplexity: 1,
  hasImage: true,
  hasASL: false,
  hasSpanish: true,
  emoji: '🐕',
  srBin: 'A',
  noveltyScore: 0.6,
  concretenessScore: 0.9
};

console.log('=== Example 3: Phrase Classification ===');
console.log('Phrase:', phrase.text);
console.log('Stage:', getProgressionStage(phrase)); // Should be 4 (phrase)
console.log('Complexity:', getOrthographicComplexity(phrase)); // Should be 1
console.log('Concreteness:', getSemanticConcreteness(phrase)); // Should be 0.9
console.log();

// =============================================================================
// EXAMPLE 4: Classify a micro-sentence
// =============================================================================

const sentence: ContentItem = {
  id: 'sentence-1',
  text: 'the dog is big',
  type: 'sentence',
  stage: 5,
  category: 'animals',
  syllables: 4,
  letterCount: 14,
  orthographicComplexity: 1,
  hasImage: false,
  hasASL: false,
  hasSpanish: true,
  srBin: 'A',
  noveltyScore: 0.5,
  concretenessScore: 0.7
};

console.log('=== Example 4: Sentence Classification ===');
console.log('Sentence:', sentence.text);
console.log('Stage:', getProgressionStage(sentence)); // Should be 5 (micro-sentence)
console.log('Complexity:', getOrthographicComplexity(sentence)); // Mixed complexity
console.log();

// =============================================================================
// EXAMPLE 5: Get detailed breakdown
// =============================================================================

const complexWord: ContentItem = {
  id: 'word-ship',
  text: 'ship',
  type: 'word',
  stage: 2,
  category: 'activities',
  syllables: 1,
  letterCount: 4,
  orthographicComplexity: 3,
  hasImage: true,
  hasASL: false,
  hasSpanish: true,
  emoji: '🚢',
  srBin: 'A',
  noveltyScore: 0.7,
  concretenessScore: 1.0
};

console.log('=== Example 5: Detailed Classification Breakdown ===');
console.log('Word:', complexWord.text);
const breakdown = getClassificationBreakdown(complexWord);
console.log('Breakdown:', JSON.stringify(breakdown, null, 2));
console.log();

// =============================================================================
// EXAMPLE 6: SR bin classification
// =============================================================================

// Create a mock learner profile
const learnerProfile: LearnerProfile = {
  id: 'learner-1',
  name: 'Test Learner',
  createdAt: Date.now(),
  progressionState: 2,
  engagementScore: 75,
  typingSpeedBaseline: 180,
  errorBaseline: 0.05,
  categoryAffinity: {
    animals: 80,
    food: 60,
    fantasy: 40,
    tech: 30,
    nature: 70,
    actions: 50,
    feelings: 45,
    places: 55,
    activities: 65,
    nowWords: 20
  },
  motor: {
    leftHandErrors: 3,
    rightHandErrors: 2,
    rowTransitionSpeed: 120,
    commonLetterErrors: { 't': 2, 'h': 1 }
  },
  spacedRepetition: {
    A: ['word-ship', 'word-frog'],
    B: ['word-cat', 'word-the'],
    C: ['word-dog', 'word-is']
  },
  lastTenItems: ['word-cat', 'word-dog', 'word-the'],
  totalCompleted: 45
};

console.log('=== Example 6: SR Bin Classification ===');
console.log('Cat (in bin B):', classifyForSR(catWord, learnerProfile)); // Should be B
console.log('Ship (in bin A):', classifyForSR(complexWord, learnerProfile)); // Should be A

// New word not in any bin
const newWord: ContentItem = {
  id: 'word-new',
  text: 'frog',
  type: 'word',
  stage: 2,
  category: 'animals',
  syllables: 1,
  letterCount: 4,
  orthographicComplexity: 2,
  hasImage: true,
  hasASL: false,
  hasSpanish: true,
  emoji: '🐸',
  srBin: 'A',
  noveltyScore: 0.8,
  concretenessScore: 1.0
};

console.log('Frog (new word):', classifyForSR(newWord, learnerProfile)); // Should be A
console.log();

console.log('✓ All examples completed successfully!');
