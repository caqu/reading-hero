import { Word } from '../types';
import { EMOJI_WORDS } from './emojiWords';

/**
 * Curated words with custom images and sign videos.
 * Note: Word order is now managed by the adaptive sequencer.
 */
const CURATED_WORDS: Word[] = [
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
  },
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
    emoji: '⚽',
    emojiDescription: 'soccer ball',
    imageUrl: '/images/ball.png',
    signImageUrl: '/images/ball.png',
    difficulty: 'easy',
    syllables: 'ball',
    segments: 'ball'
  },
  {
    id: 'tree',
    text: 'tree',
    emoji: '🌲',
    emojiDescription: 'evergreen tree',
    imageUrl: '/images/tree.png',
    signImageUrl: '/images/tree.png',
    difficulty: 'easy',
    syllables: 'tree',
    segments: 'tree'
  },
  {
    id: 'fish',
    text: 'fish',
    emoji: '🐟',
    emojiDescription: 'fish',
    difficulty: 'easy',
    syllables: 'fish',
    segments: 'fish'
  }
];

/**
 * Complete word list for the game.
 * Combines curated words with custom images/signs and emoji-based words.
 *
 * Word order and sequencing is now managed by the adaptive sequencer,
 * which intelligently selects content based on learner performance,
 * engagement, and spaced repetition needs.
 *
 * Total: 230+ words for extensive gameplay.
 */
export const WORD_LIST: Word[] = [...CURATED_WORDS, ...EMOJI_WORDS];

// Export alias for backwards compatibility
export const words = WORD_LIST;