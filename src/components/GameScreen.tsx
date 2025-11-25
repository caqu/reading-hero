import { useState, useEffect } from 'react';
import { Word } from '../types';
import { WordCard } from './WordCard';
import { LetterTiles } from './LetterTiles';
import { OnScreenKeyboard } from './OnScreenKeyboard';
import styles from './GameScreen.module.css';

interface GameScreenProps {
  words: Word[];
  currentWordIndex: number;
  currentLetterIndex: number;
  revealedLetters: boolean[];
  attempts: number;
  correctWords: number;
  showWordText?: boolean;
  onKeyPress?: (key: string) => void;
  onComplete?: () => void;
  highlightKey?: string;
  keyboardDisabled?: boolean;
  wrongKey?: string | null;
  correctKey?: string | null;
  correctTileIndex?: number | null;
}

export const GameScreen = ({
  words,
  currentWordIndex,
  currentLetterIndex,
  revealedLetters,
  attempts,
  correctWords,
  showWordText = false,
  onKeyPress,
  highlightKey,
  keyboardDisabled = false,
  wrongKey = null,
  correctKey = null,
  correctTileIndex = null,
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

  const accuracy = attempts > 0 ? Math.round((correctWords * 100) / attempts) : 0;

  return (
    <div className={styles.container}>
      {showInstruction && (
        <div className={styles.floatingInstruction}>
          Type the letters to spell the word
        </div>
      )}

      <aside className={styles.sidebar}>
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
        </div>
      </aside>

      <main className={styles.main}>
        <WordCard
          word={currentWord}
          showWord={showWordText}
        />
        <LetterTiles
          word={currentWord.text}
          currentIndex={currentLetterIndex}
          revealedLetters={revealedLetters}
          correctTileIndex={correctTileIndex}
        />
        {onKeyPress && (
          <OnScreenKeyboard
            onKeyPress={onKeyPress}
            highlightKey={highlightKey}
            disabled={keyboardDisabled}
            wrongKey={wrongKey}
            correctKey={correctKey}
          />
        )}
      </main>
    </div>
  );
};
