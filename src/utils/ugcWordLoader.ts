import { Word } from '../types';
import { listSigns } from './signRecordingApi';

/**
 * UGC Word Registry Entry
 * This matches the format from Task 3 backend
 */
export interface UGCWordEntry {
  word: string;
  syllables: string[];
  segments: string[];
  imagePath: string;
  source: 'user';
  createdAt: string;
  active: boolean;
}

/**
 * Load UGC words from the registry
 * Returns empty array if registry doesn't exist yet
 */
async function loadUGCWords(): Promise<Word[]> {
  try {
    const response = await fetch('/ugc/registry.json');

    // If registry doesn't exist yet (404), return empty array
    if (!response.ok) {
      console.log('UGC registry not found - no user-generated words yet');
      return [];
    }

    const registry: UGCWordEntry[] = await response.json();

    // Filter only active entries and convert to Word format
    return registry
      .filter(entry => entry.active)
      .map(entry => {
        const word: Word = {
          id: `user:${entry.word}`,
          text: entry.word,
          imageUrl: entry.imagePath,
          syllables: entry.syllables.join('-'),
          segments: entry.segments.join('·'),
          source: 'user',
          // UGC words bypass leveling - no difficulty set
        };
        return word;
      });
  } catch (error) {
    console.log('Error loading UGC words:', error);
    return [];
  }
}

/**
 * Load all words: built-in words + UGC words
 * Merges both lists with UGC words appended at the end
 * Also checks for recorded ASL signs and adds signVideoUrl if available
 */
export async function loadAllWords(builtInWords: Word[]): Promise<Word[]> {
  // Mark all built-in words with source: 'builtin'
  const markedBuiltInWords = builtInWords.map(word => ({
    ...word,
    source: 'builtin' as const,
  }));

  // Load UGC words
  const ugcWords = await loadUGCWords();

  // Merge: built-in first, then UGC
  const allWords = [...markedBuiltInWords, ...ugcWords];

  // Check for recorded ASL signs and add signVideoUrl
  try {
    const { signs } = await listSigns();

    // Create a map of approved signs for quick lookup
    const approvedSigns = new Set(
      signs
        .filter(sign => sign.status === 'approved')
        .map(sign => sign.word.toLowerCase())
    );

    // Enhance words with sign video URLs if they exist
    return allWords.map(word => {
      const wordText = word.text.toLowerCase();
      if (approvedSigns.has(wordText)) {
        return {
          ...word,
          signVideoUrl: `/asl/signs/${wordText}/sign_loop.mp4`,
        };
      }
      return word;
    });
  } catch (error) {
    console.log('Could not load ASL signs - continuing without sign videos:', error);
    // Return words without sign videos if API fails
    return allWords;
  }
}

/**
 * Parse word ID to determine if it's a UGC word
 * UGC words have format: "user:wordname"
 * Built-in words are just the word ID
 */
export function parseWordId(wordId: string): { isUGC: boolean; wordName: string } {
  if (wordId.startsWith('user:')) {
    return {
      isUGC: true,
      wordName: wordId.substring(5), // Remove "user:" prefix
    };
  }
  return {
    isUGC: false,
    wordName: wordId,
  };
}
