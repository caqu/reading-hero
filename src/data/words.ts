import { Word } from '../types';
import { EMOJI_WORDS } from './emojiWords';
import { ShuffleBag } from '../utils/ShuffleBag';

/**
 * Hardcoded first 2 words that ALWAYS appear in this exact order.
 * 1. cat - WITH sign language video
 * 2. dad - with custom image
 */
const FIRST_2_WORDS: Word[] = [
  {
    id: 'cat',
    text: 'cat',
    imageUrl: '/images/cat.png',
    signImageUrl: '/images/cat.png',
    signVideoUrl: '/signs/processed/cat.mp4',
    signVideoWebmUrl: '/signs/processed/cat.webm',
    signThumbnailUrl: '/signs/thumbnails/cat.png',
    difficulty: 'easy',
    syllables: 'cat',
    segments: 'cat'
  },
  {
    id: 'dad',
    text: 'dad',
    imageUrl: '/images/dad.png',
    signImageUrl: '/images/dad.png',
    difficulty: 'easy',
    syllables: 'dad',
    segments: 'dad'
  }
];

/**
 * Other curated words with custom images (to be randomized after first 2)
 */
const OTHER_CURATED_WORDS: Word[] = [
  {
    id: 'dog',
    text: 'dog',
    imageUrl: '/images/dog.png',
    signImageUrl: '/images/dog.png',
    signVideoUrl: '/signs/processed/dog.mp4',
    signVideoWebmUrl: '/signs/processed/dog.webm',
    signThumbnailUrl: '/signs/thumbnails/dog.png',
    difficulty: 'easy',
    syllables: 'dog',
    segments: 'dog'
  },
  {
    id: 'sun',
    text: 'sun',
    imageUrl: '/images/sun.png',
    signImageUrl: '/images/sun.png',
    difficulty: 'easy',
    syllables: 'sun',
    segments: 'sun'
  },
  {
    id: 'bed',
    text: 'bed',
    imageUrl: '/images/bed.png',
    signImageUrl: '/images/bed.png',
    difficulty: 'easy',
    syllables: 'bed',
    segments: 'bed'
  },
  {
    id: 'mom',
    text: 'mom',
    imageUrl: '/images/mom.png',
    signImageUrl: '/images/mom.png',
    difficulty: 'easy',
    syllables: 'mom',
    segments: 'mom'
  },
  {
    id: 'car',
    text: 'car',
    emoji: '🚗',
    emojiDescription: 'car',
    difficulty: 'easy',
    syllables: 'car',
    segments: 'car'
  },
  {
    id: 'ball',
    text: 'ball',
    imageUrl: '/images/ball.png',
    signImageUrl: '/images/ball.png',
    difficulty: 'easy',
    syllables: 'ball',
    segments: 'ball'
  },
  {
    id: 'tree',
    text: 'tree',
    imageUrl: '/images/tree.png',
    signImageUrl: '/images/tree.png',
    difficulty: 'easy',
    syllables: 'tree',
    segments: 'tree'
  },
  {
    id: 'fish',
    text: 'fish',
    imageUrl: '/images/fish.png',
    signImageUrl: '/images/fish.png',
    difficulty: 'easy',
    syllables: 'fish',
    segments: 'fish'
  }
];

/**
 * Creates a new shuffled word list with hardcoded first 2 words,
 * then randomized curated and emoji words.
 *
 * Game Flow:
 * 1. Words 1-2: cat, dad (HARDCODED - cat has video)
 * 2. Words 3+: Other curated words + emoji words in random order
 *
 * This function is called once at initialization to create the full word list.
 */
function createWordList(): Word[] {
  // Shuffle the other curated words
  const curatedShuffleBag = new ShuffleBag(OTHER_CURATED_WORDS);
  const shuffledCuratedWords: Word[] = [];
  for (let i = 0; i < OTHER_CURATED_WORDS.length; i++) {
    shuffledCuratedWords.push(curatedShuffleBag.next());
  }

  // Shuffle the emoji words
  const emojiShuffleBag = new ShuffleBag(EMOJI_WORDS);
  const shuffledEmojiWords: Word[] = [];
  for (let i = 0; i < EMOJI_WORDS.length; i++) {
    shuffledEmojiWords.push(emojiShuffleBag.next());
  }

  // Return: hardcoded first 2, then shuffled curated, then shuffled emoji
  return [...FIRST_2_WORDS, ...shuffledCuratedWords, ...shuffledEmojiWords];
}

/**
 * Complete word list for the game.
 * - First 2 words: cat, dad (hardcoded order, cat has video)
 * - Next 8 words: Other curated words in random order
 * - Remaining words: 220+ emoji-based words in random order
 *
 * Total: 230+ words for extensive gameplay.
 */
export const WORD_LIST: Word[] = createWordList();

// Export alias for backwards compatibility
export const words = WORD_LIST;