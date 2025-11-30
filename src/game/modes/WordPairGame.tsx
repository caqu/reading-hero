/**
 * Word Pair Game Mode
 *
 * Gameplay mode where users type a two-word phrase (modifier + noun).
 * Examples: "big dog", "red ball", "funny cat"
 *
 * For now, uses a simple map of adjectives per category.
 * Future: Could be generated from WordBank clusters.
 */

import { useState, useCallback, useEffect } from 'react';
import { Word } from '../../types';
import { GameItem, GameItemStats, OnGameItemComplete, GameModeConfig } from '../types';

/**
 * Simple map of adjectives for different semantic categories
 */
const ADJECTIVES_FOR_CATEGORY: Record<string, string[]> = {
  animal: ['big', 'little', 'funny', 'silly', 'happy', 'tiny'],
  food: ['hot', 'cold', 'yummy', 'fresh', 'sweet', 'tasty'],
  toy: ['new', 'old', 'fun', 'cool', 'soft', 'small'],
  family: ['nice', 'kind', 'dear', 'sweet', 'good'],
  default: ['big', 'little', 'new', 'old', 'nice', 'fun'],
};

/**
 * Props for WordPairGame
 */
export interface WordPairGameProps {
  /** The head noun word */
  noun: Word;

  /** Optional modifier (adjective). If not provided, one is chosen. */
  modifier?: string;

  /** Optional semantic category for adjective selection */
  category?: string;

  /** Game mode configuration */
  config?: GameModeConfig;

  /** Callback when pair is completed */
  onComplete?: OnGameItemComplete;

  /** Callback for each key press */
  onKeyPress?: (key: string, correct: boolean) => void;
}

/**
 * State for word pair game instance
 */
export interface WordPairGameState {
  /** The game item being played */
  gameItem: GameItem;

  /** The modifier word */
  modifier: string;

  /** The noun word */
  noun: Word;

  /** Current character index (across full "modifier noun" string) */
  currentCharIndex: number;

  /** Whether the pair is complete */
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
 * Select a random adjective for the given category
 */
function selectAdjective(category?: string): string {
  const adjectives = ADJECTIVES_FOR_CATEGORY[category || 'default'] || ADJECTIVES_FOR_CATEGORY.default!;
  return adjectives[Math.floor(Math.random() * adjectives.length)] || 'big';
}

/**
 * Create a GameItem from a modifier and noun
 */
function createWordPairGameItem(modifier: string, noun: Word): GameItem {
  const pairText = `${modifier} ${noun.text}`;
  return {
    id: `pair:${modifier}-${noun.id}`,
    displayText: pairText,
    targetText: pairText.toLowerCase(),
    wordIds: [noun.id], // Track the noun for stats
    mode: 'pair',
    emoji: noun.emoji,
    signVideoUrl: noun.signVideoUrl,
    signVideoWebmUrl: noun.signVideoWebmUrl,
    imageUrl: noun.imageUrl,
  };
}

/**
 * WordPairGame Hook
 *
 * Manages state and logic for typing a two-word phrase.
 *
 * @param noun - The head noun
 * @param modifier - Optional modifier (auto-selected if not provided)
 * @param category - Optional category for adjective selection
 * @param config - Optional configuration
 * @param onComplete - Callback when pair is completed
 * @param onKeyPress - Callback for each key press
 * @returns Game state and handlers
 */
export function useWordPairGame(
  noun: Word,
  modifier?: string,
  category?: string,
  config?: GameModeConfig,
  onComplete?: OnGameItemComplete,
  onKeyPress?: (key: string, correct: boolean) => void
): {
  state: WordPairGameState;
  handleKeyPress: (key: string) => boolean;
  reset: () => void;
} {
  const [state, setState] = useState<WordPairGameState>(() => {
    const selectedModifier = modifier || selectAdjective(category);
    return {
      gameItem: createWordPairGameItem(selectedModifier, noun),
      modifier: selectedModifier,
      noun,
      currentCharIndex: 0,
      isComplete: false,
      startTime: Date.now(),
      correctKeys: 0,
      wrongKeys: 0,
      firstTryCorrect: true,
    };
  });

  // Reset when noun changes
  useEffect(() => {
    const selectedModifier = modifier || selectAdjective(category);
    setState({
      gameItem: createWordPairGameItem(selectedModifier, noun),
      modifier: selectedModifier,
      noun,
      currentCharIndex: 0,
      isComplete: false,
      startTime: Date.now(),
      correctKeys: 0,
      wrongKeys: 0,
      firstTryCorrect: true,
    });
  }, [noun.id, modifier, category]);

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
    const selectedModifier = modifier || selectAdjective(category);
    setState({
      gameItem: createWordPairGameItem(selectedModifier, noun),
      modifier: selectedModifier,
      noun,
      currentCharIndex: 0,
      isComplete: false,
      startTime: Date.now(),
      correctKeys: 0,
      wrongKeys: 0,
      firstTryCorrect: true,
    });
  }, [noun, modifier, category]);

  return {
    state,
    handleKeyPress,
    reset,
  };
}
