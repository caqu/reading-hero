import { EMOJI_WORDS } from './emojiWords';

/**
 * Complete word list for ASL sign recording.
 * Contains all emoji-based words that need ASL sign videos.
 *
 * This is the master list used by the /record-signs page to
 * systematically record ASL signs for every word in the app.
 *
 * Total: 220 emoji words
 */
export const RECORDING_WORD_LIST = EMOJI_WORDS.map(word => word.text);

// Export count for convenience
export const RECORDING_WORD_COUNT = RECORDING_WORD_LIST.length;
