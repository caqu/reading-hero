import { useState, useEffect } from 'react';
import { Word, Profile } from '../types';
import { WordCard } from './WordCard';
import { LetterTiles } from './LetterTiles';
import { OnScreenKeyboard } from './OnScreenKeyboard';
import { ProfileSelector } from './ProfileSelector';
import { LevelFeatures, Level } from '../engine/LevelingEngine';
import styles from './GameScreen.module.css';

interface GameScreenProps {
  words: Word[];
  currentWordIndex: number;
  currentLetterIndex: number;
  revealedLetters: boolean[];
  attempts: number;
  correctAttempts: number;
  correctWords: number;
  showWordText?: boolean;
  onKeyPress?: (key: string) => void;
  onComplete?: () => void;
  highlightKey?: string;
  keyboardDisabled?: boolean;
  wrongKey?: string | null;
  correctKey?: string | null;
  correctTileIndex?: number | null;
  /** Level features that control gameplay behavior */
  levelFeatures?: LevelFeatures;
  /** Current level (1-5) for display */
  currentLevel?: number;
  /** Callback to manually change level */
  onLevelChange?: (level: Level) => void;
  /** Callback to navigate to stats page */
  onViewStats?: () => void;
  /** Callback when profile is switched */
  onProfileSwitch?: (profile: Profile) => void;
}

export const GameScreen = ({
  words,
  currentWordIndex,
  currentLetterIndex,
  revealedLetters,
  attempts,
  correctAttempts,
  correctWords,
  showWordText = false,
  onKeyPress,
  highlightKey,
  keyboardDisabled = false,
  wrongKey = null,
  correctKey = null,
  correctTileIndex = null,
  levelFeatures,
  currentLevel = 1,
  onLevelChange,
  onViewStats,
  onProfileSwitch,
}: GameScreenProps) => {
  const currentWord = words[currentWordIndex];
  const [showInstruction, setShowInstruction] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // If no current word, don't render anything (game is complete)
  if (!currentWord) {
    return null;
  }

  // Calculate accuracy as percentage of correct key presses out of total attempts
  const accuracy = attempts > 0 ? Math.round((correctAttempts * 100) / attempts) : 0;

  return (
    <div className={styles.container}>
      {showInstruction && (
        <div className={styles.floatingInstruction}>
          Type the letters to spell the word
        </div>
      )}

      <aside className={styles.sidebar}>
        <ProfileSelector onProfileSwitch={onProfileSwitch} />
        <div className={styles.progressInfo}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{currentWordIndex + 1}</div>
            <div className={styles.statLabel}>of {words.length}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{correctWords}</div>
            <div className={styles.statLabel}>correct</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{accuracy}%</div>
            <div className={styles.statLabel}>accuracy</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{currentLevel}</div>
            <div className={styles.statLabel}>level</div>
            {onLevelChange && (
              <input
                type="range"
                min="1"
                max="5"
                value={currentLevel}
                onChange={(e) => onLevelChange(parseInt(e.target.value) as Level)}
                className={styles.levelSlider}
                aria-label="Set level"
              />
            )}
          </div>
          {onViewStats && (
            <button
              className={styles.statsButton}
              onClick={onViewStats}
              aria-label="View detailed statistics"
            >
              View Stats
            </button>
          )}
        </div>
      </aside>

      <main className={styles.main}>
        <WordCard
          word={currentWord}
          showWord={showWordText}
          showVariants={levelFeatures?.showWordVariants}
          showSyllables={levelFeatures?.showSyllables}
          hideEmojiAfterDelay={levelFeatures?.hideEmojiAfterDelay}
        />
        <LetterTiles
          word={currentWord.text}
          currentIndex={currentLetterIndex}
          revealedLetters={revealedLetters}
          correctTileIndex={correctTileIndex}
          useBlankTiles={levelFeatures?.allowBlankTiles}
        />
        {onKeyPress && (
          <OnScreenKeyboard
            onKeyPress={onKeyPress}
            highlightKey={highlightKey}
            disabled={keyboardDisabled}
            wrongKey={wrongKey}
            correctKey={correctKey}
            showHighlights={levelFeatures?.showKeyHighlights}
          />
        )}
      </main>
    </div>
  );
};
