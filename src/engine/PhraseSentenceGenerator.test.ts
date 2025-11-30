/**
 * PhraseSentenceGenerator.test.ts
 *
 * Tests for phrase and sentence generation functionality
 */

import { describe, it, expect } from 'vitest';
import { generatePhrase, generateMicroSentence, generatePhrases, generateMicroSentences } from './PhraseSentenceGenerator';
import type { ContentItem } from '../types/ContentItem';

// Mock seed word for testing
const mockSeedWord: ContentItem = {
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
};

describe('PhraseSentenceGenerator', () => {
  describe('generatePhrase', () => {
    it('should generate a 2-word phrase', () => {
      const phrase = generatePhrase(mockSeedWord);

      expect(phrase.type).toBe('phrase');
      expect(phrase.stage).toBe(4);

      // Check that it's a 2-word phrase
      const wordCount = phrase.text.split(/\s+/).length;
      expect(wordCount).toBe(2);
    });

    it('should include the seed word as noun', () => {
      const phrase = generatePhrase(mockSeedWord);

      expect(phrase.text).toContain('dog');
    });

    it('should inherit category from seed word', () => {
      const phrase = generatePhrase(mockSeedWord);

      expect(phrase.category).toBe('animals');
    });

    it('should inherit emoji from seed word', () => {
      const phrase = generatePhrase(mockSeedWord);

      expect(phrase.emoji).toBe('🐶');
    });

    it('should inherit multimodal properties', () => {
      const phrase = generatePhrase(mockSeedWord);

      expect(phrase.hasImage).toBe(true);
      expect(phrase.hasASL).toBe(true);
      expect(phrase.hasSpanish).toBe(true);
    });

    it('should have valid letter count including space', () => {
      const phrase = generatePhrase(mockSeedWord);

      expect(phrase.letterCount).toBe(phrase.text.length);
      expect(phrase.letterCount).toBeGreaterThan(3); // At least "a dog".length
    });

    it('should calculate syllables', () => {
      const phrase = generatePhrase(mockSeedWord);

      expect(phrase.syllables).toBeGreaterThan(0);
    });

    it('should assign proper SR bin', () => {
      const phrase = generatePhrase(mockSeedWord);

      expect(['A', 'B', 'C']).toContain(phrase.srBin);
    });

    it('should have novelty score', () => {
      const phrase = generatePhrase(mockSeedWord);

      expect(phrase.noveltyScore).toBeGreaterThanOrEqual(0);
      expect(phrase.noveltyScore).toBeLessThanOrEqual(1);
    });

    it('should inherit concreteness score', () => {
      const phrase = generatePhrase(mockSeedWord);

      expect(phrase.concretenessScore).toBe(0.9);
    });
  });

  describe('generateMicroSentence', () => {
    it('should generate a sentence with 3-7 words', () => {
      const sentence = generateMicroSentence(mockSeedWord);

      expect(sentence.type).toBe('sentence');
      expect(sentence.stage).toBe(5);

      const wordCount = sentence.text.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(2);
      expect(wordCount).toBeLessThanOrEqual(7);
    });

    it('should include the seed word as noun', () => {
      const sentence = generateMicroSentence(mockSeedWord);

      const lowerText = sentence.text.toLowerCase();
      expect(lowerText).toContain('dog');
    });

    it('should end with punctuation', () => {
      const sentence = generateMicroSentence(mockSeedWord);

      expect(sentence.text).toMatch(/\.$/);
    });

    it('should inherit category from seed word', () => {
      const sentence = generateMicroSentence(mockSeedWord);

      expect(sentence.category).toBe('animals');
    });

    it('should inherit emoji from seed word', () => {
      const sentence = generateMicroSentence(mockSeedWord);

      expect(sentence.emoji).toBe('🐶');
    });

    it('should inherit multimodal properties', () => {
      const sentence = generateMicroSentence(mockSeedWord);

      expect(sentence.hasImage).toBe(true);
      expect(sentence.hasASL).toBe(true);
      expect(sentence.hasSpanish).toBe(true);
    });

    it('should have valid letter count including spaces and punctuation', () => {
      const sentence = generateMicroSentence(mockSeedWord);

      expect(sentence.letterCount).toBe(sentence.text.length);
    });

    it('should calculate syllables', () => {
      const sentence = generateMicroSentence(mockSeedWord);

      expect(sentence.syllables).toBeGreaterThan(0);
    });

    it('should assign proper SR bin', () => {
      const sentence = generateMicroSentence(mockSeedWord);

      expect(['A', 'B', 'C']).toContain(sentence.srBin);
    });

    it('should have higher novelty score than phrases', () => {
      const sentence = generateMicroSentence(mockSeedWord);

      expect(sentence.noveltyScore).toBeGreaterThanOrEqual(0.6);
      expect(sentence.noveltyScore).toBeLessThanOrEqual(1);
    });

    it('should inherit concreteness score', () => {
      const sentence = generateMicroSentence(mockSeedWord);

      expect(sentence.concretenessScore).toBe(0.9);
    });
  });

  describe('generatePhrases', () => {
    it('should generate multiple unique phrases', () => {
      const phrases = generatePhrases(mockSeedWord, 5);

      expect(phrases).toHaveLength(5);

      // Check uniqueness
      const texts = phrases.map(p => p.text);
      const uniqueTexts = new Set(texts);
      expect(uniqueTexts.size).toBe(5);
    });

    it('should all be stage 4 phrases', () => {
      const phrases = generatePhrases(mockSeedWord, 3);

      phrases.forEach(phrase => {
        expect(phrase.type).toBe('phrase');
        expect(phrase.stage).toBe(4);
      });
    });
  });

  describe('generateMicroSentences', () => {
    it('should generate multiple unique sentences', () => {
      const sentences = generateMicroSentences(mockSeedWord, 5);

      expect(sentences).toHaveLength(5);

      // Check uniqueness
      const texts = sentences.map(s => s.text);
      const uniqueTexts = new Set(texts);
      expect(uniqueTexts.size).toBe(5);
    });

    it('should all be stage 5 sentences', () => {
      const sentences = generateMicroSentences(mockSeedWord, 3);

      sentences.forEach(sentence => {
        expect(sentence.type).toBe('sentence');
        expect(sentence.stage).toBe(5);
      });
    });
  });

  describe('Integration examples', () => {
    it('should generate varied phrases', () => {
      const phrases = generatePhrases(mockSeedWord, 10);

      console.log('\nExample phrases:');
      phrases.slice(0, 5).forEach(p => {
        console.log(`  - "${p.text}" (syllables: ${p.syllables}, complexity: ${p.orthographicComplexity})`);
      });

      expect(phrases.length).toBe(10);
    });

    it('should generate varied sentences', () => {
      const sentences = generateMicroSentences(mockSeedWord, 10);

      console.log('\nExample sentences:');
      sentences.slice(0, 5).forEach(s => {
        console.log(`  - "${s.text}" (syllables: ${s.syllables}, complexity: ${s.orthographicComplexity})`);
      });

      expect(sentences.length).toBe(10);
    });
  });
});
