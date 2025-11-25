import { Word } from '../types';

/**
 * A curated list of simple, child-friendly words for the MotorKeys game.
 * Each word is chosen to be easily recognizable and typeable for young learners.
 */
export const WORD_LIST: Word[] = [
  {
    id: 'cat',
    text: 'cat',
    imageUrl: 'https://via.placeholder.com/300?text=Cat',
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Cat',
    difficulty: 'easy'
  },
  {
    id: 'dog',
    text: 'dog',
    imageUrl: 'https://via.placeholder.com/300?text=Dog',
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Dog',
    difficulty: 'easy'
  },
  {
    id: 'sun',
    text: 'sun',
    imageUrl: 'https://via.placeholder.com/300?text=Sun',
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Sun',
    difficulty: 'easy'
  },
  {
    id: 'bed',
    text: 'bed',
    imageUrl: 'https://via.placeholder.com/300?text=Bed',
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Bed',
    difficulty: 'easy'
  },
  {
    id: 'mom',
    text: 'mom',
    imageUrl: 'https://via.placeholder.com/300?text=Mom',
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Mom',
    difficulty: 'easy'
  },
  {
    id: 'dad',
    text: 'dad',
    imageUrl: 'https://via.placeholder.com/300?text=Dad',
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Dad',
    difficulty: 'easy'
  },
  {
    id: 'hat',
    text: 'hat',
    imageUrl: 'https://via.placeholder.com/300?text=Hat',
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Hat',
    difficulty: 'easy'
  },
  {
    id: 'cup',
    text: 'cup',
    imageUrl: 'https://via.placeholder.com/300?text=Cup',
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Cup',
    difficulty: 'easy'
  },
  {
    id: 'bus',
    text: 'bus',
    imageUrl: 'https://via.placeholder.com/300?text=Bus',
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Bus',
    difficulty: 'easy'
  },
  {
    id: 'map',
    text: 'map',
    imageUrl: 'https://via.placeholder.com/300?text=Map',
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Map',
    difficulty: 'easy'
  },
  {
    id: 'toy',
    text: 'toy',
    imageUrl: 'https://via.placeholder.com/300?text=Toy',
    signImageUrl: 'https://via.placeholder.com/300?text=Sign+Toy',
    difficulty: 'easy'
  }
];

// Export alias for backwards compatibility
export const words = WORD_LIST;