/**
 * ASL Sign Inventory System
 *
 * Tracks which words have been recorded and which are still missing.
 * Compares the master recording word list against the backend sign registry.
 */

import { RECORDING_WORD_LIST } from '../data/recordingWordList';
import { listSigns } from './signRecordingApi';

export interface SignInventory {
  missing: string[];    // Words that need recording
  recorded: string[];   // Words already recorded (approved or pending)
}

/**
 * Normalize word for comparison with backend storage
 * Must match the backend's sanitizeSignWord function:
 * - Converts to lowercase
 * - Removes all non-alphanumeric characters (spaces, hyphens, etc.)
 *
 * Example: "Monkey face" -> "monkeyface"
 */
function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Build inventory of recorded vs missing signs
 *
 * Fetches the list of recorded signs from the backend and compares it
 * against the master recording word list to determine which words are
 * still missing.
 *
 * Words with status 'approved' or 'pending' are considered recorded.
 * Words with status 'deleted' are treated as missing.
 *
 * @returns {Promise<SignInventory>} Object with missing and recorded arrays
 * @throws {Error} If backend request fails (caller should handle fallback)
 */
export async function buildInventory(): Promise<SignInventory> {
  try {
    // Get all words from the master recording list
    const allWords = RECORDING_WORD_LIST;

    // Fetch recorded signs from backend
    const { signs } = await listSigns();

    // Extract words that have been recorded (approved or pending)
    // Exclude deleted signs - they count as missing
    // Backend stores words normalized (lowercase, no spaces), so we need to normalize for comparison
    const recordedWordsNormalized = signs
      .filter(sign => sign.status === 'approved' || sign.status === 'pending')
      .map(sign => normalizeWord(sign.word));

    // Create a Set for efficient lookup
    const recordedSet = new Set(recordedWordsNormalized);

    // Find words that haven't been recorded yet
    // Compare normalized versions to match backend storage
    const missing = allWords.filter(word => !recordedSet.has(normalizeWord(word)));

    // Return original word forms (not normalized) for display
    const recorded = allWords.filter(word => recordedSet.has(normalizeWord(word)));

    return {
      missing,
      recorded
    };
  } catch (error) {
    console.error('Error building sign inventory:', error);
    throw error; // Re-throw so caller can handle fallback
  }
}

/**
 * Get the next unrecorded word from the inventory
 *
 * @param {SignInventory} inventory - The current inventory
 * @returns {string | null} The next word to record, or null if all done
 */
export function getNextWord(inventory: SignInventory): string | null {
  return inventory.missing.length > 0 ? inventory.missing[0] ?? null : null;
}

/**
 * Check if all words have been recorded
 *
 * @param {SignInventory} inventory - The current inventory
 * @returns {boolean} True if no words are missing
 */
export function isInventoryComplete(inventory: SignInventory): boolean {
  return inventory.missing.length === 0;
}

/**
 * Get total word count from master list
 *
 * @returns {number} Total number of words in recording list
 */
export function getTotalWordCount(): number {
  return RECORDING_WORD_LIST.length;
}
