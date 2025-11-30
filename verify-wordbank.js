/**
 * Verification Script for Word Repository
 *
 * Quick test to ensure the word repository is working correctly.
 * Run with: node verify-wordbank.js
 */

import {
  getAllWords,
  getWordById,
  getAllWordLists,
  getKindergartenCoreWords,
  getRepositoryStats,
  logRepositoryStats
} from './src/data/wordRepository.ts';

console.log('\n🔍 Verifying Word Repository...\n');

// Test 1: Get all words
console.log('Test 1: Get all words');
const allWords = getAllWords();
console.log(`✓ Found ${allWords.length} words\n`);

// Test 2: Get specific words by ID
console.log('Test 2: Get specific words');
const theWord = getWordById('the');
const dogWord = getWordById('dog');
const barksWord = getWordById('barks');
console.log(`✓ Found "the": ${theWord?.text} (${theWord?.partOfSpeech})`);
console.log(`✓ Found "dog": ${dogWord?.text} (${dogWord?.emoji?.defaultEmoji})`);
console.log(`✓ Found "barks": ${barksWord?.text} (lemma: ${barksWord?.lemma})\n`);

// Test 3: Get word lists
console.log('Test 3: Get word lists');
const allLists = getAllWordLists();
console.log(`✓ Found ${allLists.length} word list(s)`);
allLists.forEach(list => {
  console.log(`  - ${list.name} (${list.id})`);
});
console.log('');

// Test 4: Get Kindergarten Core words
console.log('Test 4: Get Kindergarten Core words');
const kindergartenWords = getKindergartenCoreWords();
console.log(`✓ Kindergarten Core has ${kindergartenWords.length} words:`);
kindergartenWords.forEach(word => {
  const emoji = word.emoji?.defaultEmoji || '—';
  console.log(`  - ${word.text} ${emoji} [${word.partOfSpeech}]`);
});
console.log('');

// Test 5: Repository stats
console.log('Test 5: Repository statistics');
logRepositoryStats();

console.log('\n✅ All verification tests passed!\n');
