import { useState, useEffect } from 'react';
import { Word } from '../types';
import { WordCard } from './WordCard';
import { LetterTiles } from './LetterTiles';
import { OnScreenKeyboard } from './OnScreenKeyboard';
import { FeedbackOverlay } from './FeedbackOverlay';
import styles from './GameScreen.module.css';

interface GameScreenProps {
  words: Word[];
  currentWordIndex: number;
  currentLetterIndex: number;
  revealedLetters: boolean[];
  attempts: number;
  correctWords: number;
  feedbackType: 'success' | 'error' | 'none';
  feedbackMessage?: string;
  showWordText?: boolean;
  onKeyPress?: (key: string) => void;
  onComplete?: () => void;
  highlightKey?: string;
  keyboardDisabled?: boolean;
}

export const GameScreen = ({
  words,
  currentWordIndex,
  currentLetterIndex,
  revealedLetters,
  attempts,
  correctWords,
  feedbackType,
  feedbackMessage,
  showWordText = false,
  onKeyPress,
  highlightKey,
  keyboardDisabled = false,
}: GameScreenProps) => {
  const currentWord = words[currentWordIndex];
  const [showInstruction, setShowInstruction] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!currentWord) {
    return (
      <div className={styles.container}>
        <div className={styles.completionMessage}>
          <h2>Great job!</h2>
          <p>You've completed all the words!</p>
        </div>
      </div>
    );
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
          imageUrl={currentWord.imageUrl}
          word={currentWord.text}
          showWord={showWordText}
        />
        <LetterTiles
          word={currentWord.text}
          currentIndex={currentLetterIndex}
          revealedLetters={revealedLetters}
        />
        {onKeyPress && (
          <OnScreenKeyboard
            onKeyPress={onKeyPress}
            highlightKey={highlightKey}
            disabled={keyboardDisabled}
          />
        )}
      </main>

      <FeedbackOverlay type={feedbackType} message={feedbackMessage} />
    </div>
  );
};
