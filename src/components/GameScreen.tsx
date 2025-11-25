import { Word } from '../types';
import { WordCard } from './WordCard';
import { LetterTiles } from './LetterTiles';
import { ProgressBar } from './ProgressBar';
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
}: GameScreenProps) => {
  const currentWord = words[currentWordIndex];

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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <ProgressBar
          currentWord={currentWordIndex + 1}
          totalWords={words.length}
          attempts={attempts}
          correctWords={correctWords}
        />
      </header>

      <main className={styles.main}>
        <section className={styles.wordSection} aria-label="Current word">
          <WordCard
            imageUrl={currentWord.imageUrl}
            word={currentWord.text}
            showWord={showWordText}
          />
        </section>

        <section className={styles.tilesSection} aria-label="Letter tiles">
          <LetterTiles
            word={currentWord.text}
            currentIndex={currentLetterIndex}
            revealedLetters={revealedLetters}
          />
        </section>

        <section className={styles.instructionSection}>
          <p className={styles.instruction}>
            Type the letters to spell the word
          </p>
        </section>
      </main>

      <FeedbackOverlay type={feedbackType} message={feedbackMessage} />
    </div>
  );
};
