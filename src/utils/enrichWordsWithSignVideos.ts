/**
 * Utility to enrich Word objects with ASL sign video URLs
 * by fetching the list of available signs from the backend
 */

import { Word } from '../types';
import { listSigns } from './signRecordingApi';

/**
 * Normalize word text to match backend storage
 * Must match the backend's sanitizeSignWord function
 */
function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Enriches a word list with sign video URLs for words that have recorded signs
 *
 * @param words - Array of Word objects to enrich
 * @returns Promise<Word[]> - Array of words with signVideoUrl populated where available
 */
export async function enrichWordsWithSignVideos(words: Word[]): Promise<Word[]> {
  try {
    // Fetch list of recorded signs from backend
    const { signs } = await listSigns();

    // Create a map of normalized word -> sign metadata
    const signMap = new Map(
      signs
        .filter(sign => sign.status === 'approved') // Only use approved signs
        .map(sign => [sign.word, sign])
    );

    // Enrich each word with sign video URLs if available
    return words.map(word => {
      const normalizedText = normalizeWord(word.text);
      const sign = signMap.get(normalizedText);

      if (sign) {
        // Add sign video URLs to the word
        return {
          ...word,
          signVideoUrl: sign.loopPath, // e.g., /asl/signs/monkeyface/sign_loop.mp4
          signVideoWebmUrl: sign.rawPath, // e.g., /asl/signs/monkeyface/raw.webm
        };
      }

      // Return word unchanged if no sign video exists
      return word;
    });
  } catch (error) {
    console.error('Failed to enrich words with sign videos:', error);
    // Return original words if fetch fails - graceful degradation
    return words;
  }
}
