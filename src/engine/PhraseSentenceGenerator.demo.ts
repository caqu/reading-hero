/**
 * PhraseSentenceGenerator.demo.ts
 *
 * Demonstration of phrase and sentence generation capabilities
 * Run with: npx tsx src/engine/PhraseSentenceGenerator.demo.ts
 */

import { generatePhrase, generateMicroSentence, generatePhrases, generateMicroSentences } from './PhraseSentenceGenerator';
import type { ContentItem } from '../types/ContentItem';

// Sample seed words
const sampleWords: ContentItem[] = [
  {
    id: 'word-dog',
    text: 'dog',
    type: 'word',
    stage: 1,
    category: 'animals',
    syllables: 1,
    letterCount: 3,
    orthographicComplexity: 1,
    emoji: '🐶',
    hasImage: true,
    hasASL: true,
    hasSpanish: true,
    srBin: 'A',
    noveltyScore: 0.5,
    concretenessScore: 0.9,
  },
  {
    id: 'word-pizza',
    text: 'pizza',
    type: 'word',
    stage: 2,
    category: 'food',
    syllables: 2,
    letterCount: 5,
    orthographicComplexity: 2,
    emoji: '🍕',
    hasImage: true,
    hasASL: true,
    hasSpanish: true,
    srBin: 'A',
    noveltyScore: 0.7,
    concretenessScore: 0.95,
  },
  {
    id: 'word-dragon',
    text: 'dragon',
    type: 'word',
    stage: 2,
    category: 'fantasy',
    syllables: 2,
    letterCount: 6,
    orthographicComplexity: 3,
    emoji: '🐉',
    hasImage: true,
    hasASL: false,
    hasSpanish: true,
    srBin: 'B',
    noveltyScore: 0.8,
    concretenessScore: 0.7,
  },
  {
    id: 'word-robot',
    text: 'robot',
    type: 'word',
    stage: 2,
    category: 'tech',
    syllables: 2,
    letterCount: 5,
    orthographicComplexity: 2,
    emoji: '🤖',
    hasImage: true,
    hasASL: true,
    hasSpanish: true,
    srBin: 'B',
    noveltyScore: 0.75,
    concretenessScore: 0.85,
  },
];

console.log('='.repeat(70));
console.log('PHRASE AND SENTENCE GENERATOR DEMONSTRATION');
console.log('='.repeat(70));

// Demonstrate phrase generation
console.log('\n📝 PHRASE GENERATION (Stage 4)');
console.log('-'.repeat(70));

sampleWords.forEach(word => {
  console.log(`\nSeed Word: "${word.text}" ${word.emoji}`);
  console.log('Generated Phrases:');

  const phrases = generatePhrases(word, 3);
  phrases.forEach((phrase, index) => {
    console.log(`  ${index + 1}. "${phrase.text}"`);
    console.log(`     - Syllables: ${phrase.syllables}, Complexity: ${phrase.orthographicComplexity}, SR Bin: ${phrase.srBin}`);
    console.log(`     - Novelty: ${phrase.noveltyScore.toFixed(2)}, Concreteness: ${phrase.concretenessScore.toFixed(2)}`);
  });
});

// Demonstrate sentence generation
console.log('\n\n📝 MICRO-SENTENCE GENERATION (Stage 5)');
console.log('-'.repeat(70));

sampleWords.forEach(word => {
  console.log(`\nSeed Word: "${word.text}" ${word.emoji}`);
  console.log('Generated Sentences:');

  const sentences = generateMicroSentences(word, 3);
  sentences.forEach((sentence, index) => {
    console.log(`  ${index + 1}. "${sentence.text}"`);
    console.log(`     - Syllables: ${sentence.syllables}, Complexity: ${sentence.orthographicComplexity}, SR Bin: ${sentence.srBin}`);
    console.log(`     - Novelty: ${sentence.noveltyScore.toFixed(2)}, Concreteness: ${sentence.concretenessScore.toFixed(2)}`);
  });
});

// Demonstrate single generation
console.log('\n\n📝 SINGLE GENERATION EXAMPLES');
console.log('-'.repeat(70));

const exampleWord = sampleWords[0]!;
console.log(`\nUsing seed word: "${exampleWord.text}" ${exampleWord.emoji}\n`);

console.log('Single Phrase:');
const singlePhrase = generatePhrase(exampleWord);
console.log(`  "${singlePhrase.text}"`);
console.log(`  ID: ${singlePhrase.id}`);
console.log(`  Type: ${singlePhrase.type}, Stage: ${singlePhrase.stage}`);
console.log(`  Category: ${singlePhrase.category}`);
console.log(`  Has Image: ${singlePhrase.hasImage}, Has ASL: ${singlePhrase.hasASL}, Has Spanish: ${singlePhrase.hasSpanish}`);

console.log('\nSingle Sentence:');
const singleSentence = generateMicroSentence(exampleWord);
console.log(`  "${singleSentence.text}"`);
console.log(`  ID: ${singleSentence.id}`);
console.log(`  Type: ${singleSentence.type}, Stage: ${singleSentence.stage}`);
console.log(`  Category: ${singleSentence.category}`);
console.log(`  Has Image: ${singleSentence.hasImage}, Has ASL: ${singleSentence.hasASL}, Has Spanish: ${singleSentence.hasSpanish}`);

// Statistics
console.log('\n\n📊 GENERATION STATISTICS');
console.log('-'.repeat(70));

const allPhrases = sampleWords.flatMap(word => generatePhrases(word, 10));
const allSentences = sampleWords.flatMap(word => generateMicroSentences(word, 10));

console.log(`\nTotal Phrases Generated: ${allPhrases.length}`);
console.log(`  - Average Syllables: ${(allPhrases.reduce((sum, p) => sum + p.syllables, 0) / allPhrases.length).toFixed(2)}`);
console.log(`  - Average Complexity: ${(allPhrases.reduce((sum, p) => sum + p.orthographicComplexity, 0) / allPhrases.length).toFixed(2)}`);
console.log(`  - SR Bin Distribution: A=${allPhrases.filter(p => p.srBin === 'A').length}, B=${allPhrases.filter(p => p.srBin === 'B').length}, C=${allPhrases.filter(p => p.srBin === 'C').length}`);

console.log(`\nTotal Sentences Generated: ${allSentences.length}`);
console.log(`  - Average Syllables: ${(allSentences.reduce((sum, s) => sum + s.syllables, 0) / allSentences.length).toFixed(2)}`);
console.log(`  - Average Complexity: ${(allSentences.reduce((sum, s) => sum + s.orthographicComplexity, 0) / allSentences.length).toFixed(2)}`);
console.log(`  - SR Bin Distribution: A=${allSentences.filter(s => s.srBin === 'A').length}, B=${allSentences.filter(s => s.srBin === 'B').length}, C=${allSentences.filter(s => s.srBin === 'C').length}`);

console.log('\n' + '='.repeat(70));
console.log('DEMONSTRATION COMPLETE');
console.log('='.repeat(70));
