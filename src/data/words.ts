import { Word } from '../types';
import { EMOJI_WORDS } from './emojiWords';
import { ShuffleBag } from '../utils/ShuffleBag';

/**
 * The first 10 curated words that ALWAYS appear first in the game.
 * These are high-quality words with real images and sign language videos.
 * These words will ALWAYS be shown in this exact order at the start of each game.
 */
export const FIRST_10_WORDS: Word[] = [
  {
    id: 'cat',
    text: 'cat',
    imageUrl: '/images/cat.png',
    signImageUrl: '/images/cat.png',
    signVideoUrl: '/signs/processed/cat.mp4',
    signVideoWebmUrl: '/signs/processed/cat.webm',
    signThumbnailUrl: '/signs/thumbnails/cat.png',
    difficulty: 'easy'
  },
  {
    id: 'dog',
    text: 'dog',
    imageUrl: '/images/dog.png',
    signImageUrl: '/images/dog.png',
    signVideoUrl: '/signs/processed/dog.mp4',
    signVideoWebmUrl: '/signs/processed/dog.webm',
    signThumbnailUrl: '/signs/thumbnails/dog.png',
    difficulty: 'easy'
  },
  {
    id: 'sun',
    text: 'sun',
    imageUrl: '/images/sun.png',
    signImageUrl: '/images/sun.png',
    difficulty: 'easy'
  },
  {
    id: 'bed',
    text: 'bed',
    imageUrl: '/images/bed.png',
    signImageUrl: '/images/bed.png',
    difficulty: 'easy'
  },
  {
    id: 'mom',
    text: 'mom',
    imageUrl: '/images/mom.png',
    signImageUrl: '/images/mom.png',
    difficulty: 'easy'
  },
  {
    id: 'dad',
    text: 'dad',
    imageUrl: '/images/dad.png',
    signImageUrl: '/images/dad.png',
    difficulty: 'easy'
  },
  {
    id: 'car',
    text: 'car',
    imageUrl: '/images/car.png',
    signImageUrl: '/images/car.png',
    difficulty: 'easy'
  },
  {
    id: 'ball',
    text: 'ball',
    imageUrl: '/images/ball.png',
    signImageUrl: '/images/ball.png',
    difficulty: 'easy'
  },
  {
    id: 'tree',
    text: 'tree',
    imageUrl: '/images/tree.png',
    signImageUrl: '/images/tree.png',
    difficulty: 'easy'
  },
  {
    id: 'fish',
    text: 'fish',
    imageUrl: '/images/fish.png',
    signImageUrl: '/images/fish.png',
    difficulty: 'easy'
  }
];

/**
 * Creates a new shuffled word list combining the first 10 curated words
 * with a randomized emoji word list.
 *
 * Structure:
 * 1. First 10 words (always in order): cat, dog, sun, bed, mom, dad, car, ball, tree, fish
 * 2. Remaining words: shuffled emoji words (200+ entries)
 *
 * This function is called once at initialization to create the full word list.
 */
function createWordList(): Word[] {
  const shuffleBag = new ShuffleBag(EMOJI_WORDS);
  const shuffledEmojiWords: Word[] = [];

  // Extract all emoji words in random order
  for (let i = 0; i < EMOJI_WORDS.length; i++) {
    shuffledEmojiWords.push(shuffleBag.next());
  }

  return [...FIRST_10_WORDS, ...shuffledEmojiWords];
}

/**
 * Complete word list for the game.
 * - First 10 words: Curated words with real images (always shown first)
 * - Remaining words: 200+ emoji-based words in shuffled order
 *
 * Total: 210+ words for extensive gameplay.
 */
export const WORD_LIST: Word[] = createWordList();

// Export alias for backwards compatibility
export const words = WORD_LIST;