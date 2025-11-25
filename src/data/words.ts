import { Word } from '../types';

/**
 * A curated list of simple, child-friendly words for the MotorKeys game.
 * Each word is chosen to be easily recognizable and typeable for young learners.
 */
export const WORD_LIST: Word[] = [
  {
    id: 'cat',
    text: 'cat',
    imageUrl: '/images/cat.png', // ✅ Real image
    signImageUrl: '/images/cat.png',
    difficulty: 'easy'
  },
  {
    id: 'dog',
    text: 'dog',
    imageUrl: '/images/dog.png', // ✅ Real image
    signImageUrl: '/images/dog.png',
    difficulty: 'easy'
  },
  {
    id: 'sun',
    text: 'sun',
    imageUrl: '/images/sun.png', // ✅ Real image
    signImageUrl: '/images/sun.png',
    difficulty: 'easy'
  },
  {
    id: 'bed',
    text: 'bed',
    imageUrl: '/images/bed.png', // ✅ Real image
    signImageUrl: '/images/bed.png',
    difficulty: 'easy'
  },
  {
    id: 'mom',
    text: 'mom',
    imageUrl: '/images/mom.png', // ✅ Real image
    signImageUrl: '/images/mom.png',
    difficulty: 'easy'
  },
  {
    id: 'dad',
    text: 'dad',
    imageUrl: 'https://via.placeholder.com/300?text=Dad', // ⏳ Placeholder - awaiting real image
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Dad',
    difficulty: 'easy'
  },
  {
    id: 'hat',
    text: 'hat',
    imageUrl: '/images/hat.png', // ✅ Real image
    signImageUrl: '/images/hat.png',
    difficulty: 'easy'
  },
  {
    id: 'cup',
    text: 'cup',
    imageUrl: '/images/cup.png', // ✅ Real image
    signImageUrl: '/images/cup.png',
    difficulty: 'easy'
  },
  {
    id: 'bus',
    text: 'bus',
    imageUrl: '/images/bus.png', // ✅ Real image
    signImageUrl: '/images/bus.png',
    difficulty: 'easy'
  },
  {
    id: 'map',
    text: 'map',
    imageUrl: '/images/map.png', // ✅ Real image
    signImageUrl: '/images/map.png',
    difficulty: 'easy'
  },
  {
    id: 'toy',
    text: 'toy',
    imageUrl: '/images/toy.png', // ✅ Real image
    signImageUrl: '/images/toy.png',
    difficulty: 'easy'
  }
];

// Export alias for backwards compatibility
export const words = WORD_LIST;