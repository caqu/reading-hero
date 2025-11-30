import { HighInterestWord, animals, foods, places, activities, feelings, tech, fantasy, nature, actions, nowWords } from '../data/highInterest';
import { Word } from '../types';

// Combine all high-interest words into one pool
const highInterestWords: HighInterestWord[] = [
  ...animals,
  ...foods,
  ...places,
  ...activities,
  ...feelings,
  ...tech,
  ...fantasy,
  ...nature,
  ...actions,
  ...nowWords,
];

/**
 * Generates a sentence by filling in the blank in a sentence pattern
 * @param word The word to insert
 * @param pattern The sentence pattern with ___ placeholder
 * @returns The completed sentence in sentence case
 */
function fillSentencePattern(word: string, pattern: string): string {
  // Replace ___ with the word
  const filled = pattern.replace(/___/g, word);

  // Apply sentence case: first letter uppercase, rest lowercase
  if (filled.length === 0) return filled;
  return filled.charAt(0).toUpperCase() + filled.slice(1).toLowerCase();
}

/**
 * Randomly selects a high-interest word and generates a sentence from it
 * @returns A Word object with the sentence as the text
 */
export function generateRandomSentence(): Word {
  // Pick a random high-interest word
  const hiWord = highInterestWords[Math.floor(Math.random() * highInterestWords.length)];

  // Safety check
  if (!hiWord || hiWord.sentencePatterns.length === 0) {
    throw new Error('No high-interest words available or word has no sentence patterns');
  }

  // Pick a random sentence pattern
  const pattern = hiWord.sentencePatterns[Math.floor(Math.random() * hiWord.sentencePatterns.length)];

  if (!pattern) {
    throw new Error('No sentence pattern available');
  }

  // Generate the sentence
  const sentenceText = fillSentencePattern(hiWord.word, pattern);

  // Return as a Word object
  return {
    id: `sentence:${hiWord.word}:${Date.now()}`,
    text: sentenceText,
    emoji: hiWord.emoji,
    syllables: '',
  };
}

/**
 * Gets all high-interest words
 */
export function getAllHighInterestWords(): HighInterestWord[] {
  return highInterestWords;
}
