/**
 * Dev Game Mode Page
 *
 * Development page for testing the three game modes:
 * - Single Word
 * - Word Pair
 * - Mini Sentence
 *
 * Accessible via: /dev/play?mode=single|pair|sentence&category=animal|food|etc
 */

import { useState, useEffect, useMemo } from 'react';
import { GameModeId } from '../game/types';
import { useGameRunner, getModeName, getModeDescription } from '../game/GameRunner';
import { Word } from '../types';
import { WordCard } from '../components/WordCard';
import { LetterTiles } from '../components/LetterTiles';
import { OnScreenKeyboard } from '../components/OnScreenKeyboard';
import styles from './DevGameModePage.module.css';

/**
 * Sample words for testing
 * In production, these would come from WordBank
 */
const SAMPLE_WORDS: Word[] = [
  { id: 'dog', text: 'dog', emoji: '🐶', source: 'builtin' },
  { id: 'cat', text: 'cat', emoji: '🐱', source: 'builtin' },
  { id: 'bear', text: 'bear', emoji: '🐻', source: 'builtin' },
  { id: 'fox', text: 'fox', emoji: '🦊', source: 'builtin' },
  { id: 'ball', text: 'ball', emoji: '⚽', source: 'builtin' },
  { id: 'car', text: 'car', emoji: '🚗', source: 'builtin' },
  { id: 'book', text: 'book', emoji: '📕', source: 'builtin' },
  { id: 'tree', text: 'tree', emoji: '🌳', source: 'builtin' },
];

interface DevGameModePageProps {
  onBack?: () => void;
}

export const DevGameModePage = ({ onBack }: DevGameModePageProps) => {
  const [mode, setMode] = useState<GameModeId>('single');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [revealedLetters, setRevealedLetters] = useState<boolean[]>([]);

  // Initialize game runner
  const game = useGameRunner({
    mode,
    words: SAMPLE_WORDS,
    category,
    onItemComplete: (stats) => {
      console.log('[DevMode] Item completed:', stats);
    },
    onSessionComplete: () => {
      console.log('[DevMode] Session completed!');
      alert('Session complete! Great job!');
    },
    onKeyPress: (key, correct) => {
      console.log(`[DevMode] Key press: ${key} - ${correct ? 'correct' : 'wrong'}`);
    },
  });

  // Update revealed letters based on game state
  useEffect(() => {
    const targetText = game.gameState.gameItem.targetText;
    const currentIndex = 'currentLetterIndex' in game.gameState
      ? game.gameState.currentLetterIndex
      : 'currentCharIndex' in game.gameState
      ? game.gameState.currentCharIndex
      : 0;

    const revealed = Array.from({ length: targetText.length }, (_, i) => i < currentIndex);
    setRevealedLetters(revealed);
  }, [game.gameState]);

  // Handle mode change
  const handleModeChange = (newMode: GameModeId) => {
    setMode(newMode);
  };

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
  };

  // Keyboard handler
  const handleKeyPress = (key: string) => {
    game.handleKeyPress(key);
  };

  // Get current word/content for display
  const currentWord = useMemo((): Word => {
    if (mode === 'single' || mode === 'pair') {
      return game.currentContent as Word;
    }
    // For sentence mode, create a pseudo-word with the sentence
    return {
      id: game.gameState.gameItem.id,
      text: game.gameState.gameItem.displayText,
      emoji: game.gameState.gameItem.emoji,
      source: 'builtin',
    };
  }, [mode, game.currentContent, game.gameState.gameItem]);

  return (
    <div className={styles.container}>
      {/* Header with mode selector */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>🎮 Game Mode Dev</h1>
          <div className={styles.modeInfo}>
            <span className={styles.modeName}>{getModeName(mode)}</span>
            <span className={styles.modeDesc}>{getModeDescription(mode)}</span>
          </div>
        </div>
        {onBack && (
          <button className={styles.backButton} onClick={onBack}>
            ← Back
          </button>
        )}
      </header>

      {/* Mode selector */}
      <div className={styles.modeSelector}>
        <button
          className={`${styles.modeButton} ${mode === 'single' ? styles.active : ''}`}
          onClick={() => handleModeChange('single')}
        >
          Single Word
        </button>
        <button
          className={`${styles.modeButton} ${mode === 'pair' ? styles.active : ''}`}
          onClick={() => handleModeChange('pair')}
        >
          Word Pair
        </button>
        <button
          className={`${styles.modeButton} ${mode === 'sentence' ? styles.active : ''}`}
          onClick={() => handleModeChange('sentence')}
        >
          Mini Sentence
        </button>
      </div>

      {/* Category selector (for pair and sentence modes) */}
      {(mode === 'pair' || mode === 'sentence') && (
        <div className={styles.categorySelector}>
          <label>Category: </label>
          <button
            className={`${styles.categoryButton} ${!category ? styles.active : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            All
          </button>
          <button
            className={`${styles.categoryButton} ${category === 'animal' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('animal')}
          >
            Animals
          </button>
          <button
            className={`${styles.categoryButton} ${category === 'family' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('family')}
          >
            Family
          </button>
        </div>
      )}

      {/* Progress indicator */}
      <div className={styles.progress}>
        Item {game.currentIndex + 1} of {game.totalItems}
      </div>

      {/* Game area */}
      <main className={styles.main}>
        {/* Word card with emoji/image */}
        <div className={styles.wordCardContainer}>
          <WordCard
            word={currentWord}
            showWord={false}
          />
        </div>

        {/* Letter tiles */}
        <div className={styles.tilesContainer}>
          <LetterTiles
            word={game.gameState.gameItem.displayText}
            currentIndex={'currentLetterIndex' in game.gameState ? game.gameState.currentLetterIndex : 'currentCharIndex' in game.gameState ? game.gameState.currentCharIndex : 0}
            revealedLetters={revealedLetters}
          />
        </div>

        {/* Keyboard */}
        <div className={styles.keyboardContainer}>
          <OnScreenKeyboard
            onKeyPress={handleKeyPress}
            layout="qwerty"
          />
        </div>
      </main>

      {/* Debug info */}
      <div className={styles.debug}>
        <details>
          <summary>Debug Info</summary>
          <pre>{JSON.stringify({
            mode,
            category,
            currentIndex: game.currentIndex,
            isComplete: game.isComplete,
            gameItem: game.gameState.gameItem,
            correctKeys: game.gameState.correctKeys,
            wrongKeys: game.gameState.wrongKeys,
          }, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};
