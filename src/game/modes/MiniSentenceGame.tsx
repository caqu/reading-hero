/**
 * Mini Sentence Game Mode
 *
 * Gameplay mode where users type a short sentence (3-5 words).
 * Examples: "The dog is big.", "I see a cat.", "Mom has a ball."
 *
 * For now, uses a hard-coded list of sentences.
 * Future: Could be generated from WordBank clusters and templates.
 */

import { useState, useCallback, useEffect } from 'react';
import { GameItem, GameItemStats, OnGameItemComplete, GameModeConfig } from '../types';

/**
 * A mini sentence template
 */
export interface MiniSentence {
  /** Unique ID for this sentence */
  id: string;

  /** The sentence text to display and type */
  text: string;

  /** Word IDs referenced in this sentence (for stats tracking) */
  wordIds: string[];

  /** Optional emoji to display */
  emoji?: string;

  /** Optional category/theme */
  category?: string;
}

/**
 * Hard-coded seed list of mini sentences
 * Future: Generate these from WordBank + templates
 */
export const SEED_SENTENCES: MiniSentence[] = [
  // Animal sentences (using words from Kindergarten Core + emoji words)
  { id: 's1', text: 'The dog barks.', wordIds: ['the', 'dog', 'barks'], emoji: '🐶', category: 'animal' },
  { id: 's2', text: 'I see a cat.', wordIds: ['i', 'see', 'a', 'cat'], emoji: '🐱', category: 'animal' },
  { id: 's3', text: 'A big bear.', wordIds: ['a', 'big', 'bear'], emoji: '🐻', category: 'animal' },
  { id: 's4', text: 'The fox runs.', wordIds: ['the', 'fox', 'runs'], emoji: '🦊', category: 'animal' },
  { id: 's5', text: 'I like dogs.', wordIds: ['i', 'like', 'dogs'], emoji: '🐕', category: 'animal' },

  // Simple statements
  { id: 's6', text: 'I am happy.', wordIds: ['i', 'am', 'happy'], emoji: '😊' },
  { id: 's7', text: 'You are nice.', wordIds: ['you', 'are', 'nice'], emoji: '👍' },
  { id: 's8', text: 'It is fun.', wordIds: ['it', 'is', 'fun'], emoji: '🎉' },
  { id: 's9', text: 'We can play.', wordIds: ['we', 'can', 'play'], emoji: '🎮' },
  { id: 's10', text: 'They go home.', wordIds: ['they', 'go', 'home'], emoji: '🏠' },

  // Family sentences
  { id: 's11', text: 'Mom is here.', wordIds: ['mom', 'is', 'here'], emoji: '👩' },
  { id: 's12', text: 'Dad has a car.', wordIds: ['dad', 'has', 'a', 'car'], emoji: '👨' },
  { id: 's13', text: 'My baby is cute.', wordIds: ['my', 'baby', 'is', 'cute'], emoji: '👶', category: 'family' },

  // Action sentences
  { id: 's14', text: 'I can run fast.', wordIds: ['i', 'can', 'run', 'fast'], emoji: '🏃' },
  { id: 's15', text: 'We like to jump.', wordIds: ['we', 'like', 'to', 'jump'], emoji: '🤸' },
  { id: 's16', text: 'She can read it.', wordIds: ['she', 'can', 'read', 'it'], emoji: '📖' },

  // Object sentences
  { id: 's17', text: 'I have a ball.', wordIds: ['i', 'have', 'a', 'ball'], emoji: '⚽' },
  { id: 's18', text: 'This is my book.', wordIds: ['this', 'is', 'my', 'book'], emoji: '📕' },
  { id: 's19', text: 'That is a tree.', wordIds: ['that', 'is', 'a', 'tree'], emoji: '🌳' },
  { id: 's20', text: 'Look at the sun.', wordIds: ['look', 'at', 'the', 'sun'], emoji: '☀️' },

  // More varied sentences
  { id: 's21', text: 'I want to go.', wordIds: ['i', 'want', 'to', 'go'], emoji: '🚶' },
  { id: 's22', text: 'Can you see it?', wordIds: ['can', 'you', 'see', 'it'], emoji: '👀' },
  { id: 's23', text: 'We are friends.', wordIds: ['we', 'are', 'friends'], emoji: '👫' },
  { id: 's24', text: 'The bird can fly.', wordIds: ['the', 'bird', 'can', 'fly'], emoji: '🐦', category: 'animal' },
  { id: 's25', text: 'I love my mom.', wordIds: ['i', 'love', 'my', 'mom'], emoji: '❤️', category: 'family' },
];

/**
 * Props for MiniSentenceGame
 */
export interface MiniSentenceGameProps {
  /** The sentence to type */
  sentence: MiniSentence;

  /** Game mode configuration */
  config?: GameModeConfig;

  /** Callback when sentence is completed */
  onComplete?: OnGameItemComplete;

  /** Callback for each key press */
  onKeyPress?: (key: string, correct: boolean) => void;
}

/**
 * State for mini sentence game instance
 */
export interface MiniSentenceGameState {
  /** The game item being played */
  gameItem: GameItem;

  /** The original sentence */
  sentence: MiniSentence;

  /** Current character index */
  currentCharIndex: number;

  /** Whether the sentence is complete */
  isComplete: boolean;

  /** Start time */
  startTime: number;

  /** Number of correct key presses */
  correctKeys: number;

  /** Number of wrong key presses */
  wrongKeys: number;

  /** Whether first try was correct */
  firstTryCorrect: boolean;
}

/**
 * Create a GameItem from a MiniSentence
 */
function sentenceToGameItem(sentence: MiniSentence): GameItem {
  return {
    id: `sentence:${sentence.id}`,
    displayText: sentence.text,
    targetText: sentence.text.toLowerCase(),
    wordIds: sentence.wordIds,
    mode: 'sentence',
    emoji: sentence.emoji,
  };
}

/**
 * MiniSentenceGame Hook
 *
 * Manages state and logic for typing a mini sentence.
 *
 * @param sentence - The sentence to type
 * @param config - Optional configuration
 * @param onComplete - Callback when sentence is completed
 * @param onKeyPress - Callback for each key press
 * @returns Game state and handlers
 */
export function useMiniSentenceGame(
  sentence: MiniSentence,
  config?: GameModeConfig,
  onComplete?: OnGameItemComplete,
  onKeyPress?: (key: string, correct: boolean) => void
): {
  state: MiniSentenceGameState;
  handleKeyPress: (key: string) => boolean;
  reset: () => void;
} {
  const [state, setState] = useState<MiniSentenceGameState>(() => ({
    gameItem: sentenceToGameItem(sentence),
    sentence,
    currentCharIndex: 0,
    isComplete: false,
    startTime: Date.now(),
    correctKeys: 0,
    wrongKeys: 0,
    firstTryCorrect: true,
  }));

  // Reset when sentence changes
  useEffect(() => {
    setState({
      gameItem: sentenceToGameItem(sentence),
      sentence,
      currentCharIndex: 0,
      isComplete: false,
      startTime: Date.now(),
      correctKeys: 0,
      wrongKeys: 0,
      firstTryCorrect: true,
    });
  }, [sentence.id]);

  const handleKeyPress = useCallback((key: string): boolean => {
    setState(currentState => {
      if (currentState.isComplete) {
        return currentState;
      }

      const targetChar = currentState.gameItem.targetText[currentState.currentCharIndex];
      if (!targetChar) {
        return currentState;
      }

      const isCorrect = key.toLowerCase() === targetChar.toLowerCase();

      // Call parent key press handler
      onKeyPress?.(key, isCorrect);

      if (isCorrect) {
        const newCharIndex = currentState.currentCharIndex + 1;
        const newCorrectKeys = currentState.correctKeys + 1;
        const isNowComplete = newCharIndex >= currentState.gameItem.targetText.length;

        const newState = {
          ...currentState,
          currentCharIndex: newCharIndex,
          correctKeys: newCorrectKeys,
          isComplete: isNowComplete,
        };

        // If complete, trigger completion callback
        if (isNowComplete && onComplete) {
          const stats: GameItemStats = {
            gameItem: currentState.gameItem,
            durationMs: Date.now() - currentState.startTime,
            correctKeys: newCorrectKeys,
            wrongKeys: currentState.wrongKeys,
            firstTryCorrect: currentState.firstTryCorrect,
            completedAt: Date.now(),
          };
          onComplete(stats);
        }

        return newState;
      } else {
        // Wrong key
        return {
          ...currentState,
          wrongKeys: currentState.wrongKeys + 1,
          firstTryCorrect: false,
        };
      }
    });

    return state.isComplete;
  }, [onComplete, onKeyPress, state.isComplete]);

  const reset = useCallback(() => {
    setState({
      gameItem: sentenceToGameItem(sentence),
      sentence,
      currentCharIndex: 0,
      isComplete: false,
      startTime: Date.now(),
      correctKeys: 0,
      wrongKeys: 0,
      firstTryCorrect: true,
    });
  }, [sentence]);

  return {
    state,
    handleKeyPress,
    reset,
  };
}

/**
 * Get a random sentence from the seed list
 */
export function getRandomSentence(category?: string): MiniSentence {
  const filtered = category
    ? SEED_SENTENCES.filter(s => s.category === category)
    : SEED_SENTENCES;

  const list = filtered.length > 0 ? filtered : SEED_SENTENCES;
  return list[Math.floor(Math.random() * list.length)]!;
}

/**
 * Get sentences by category
 */
export function getSentencesByCategory(category: string): MiniSentence[] {
  return SEED_SENTENCES.filter(s => s.category === category);
}
