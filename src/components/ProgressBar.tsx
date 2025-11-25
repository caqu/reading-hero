import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  currentWord: number;
  totalWords: number;
  attempts: number;
  correctWords: number;
}

export const ProgressBar = ({
  currentWord,
  totalWords,
  attempts,
  correctWords,
}: ProgressBarProps) => {
  const progressPercentage = (currentWord / totalWords) * 100;
  const accuracy = attempts > 0 ? Math.round((correctWords / attempts) * 100) : 0;

  return (
    <div className={styles.container} role="region" aria-label="Game progress">
      <div className={styles.statsContainer}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Word</span>
          <span className={styles.statValue} aria-label={`Word ${currentWord} of ${totalWords}`}>
            {currentWord} / {totalWords}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Correct</span>
          <span className={styles.statValue} aria-label={`${correctWords} correct words`}>
            {correctWords}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Accuracy</span>
          <span className={styles.statValue} aria-label={`${accuracy}% accuracy`}>
            {accuracy}%
          </span>
        </div>
      </div>
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={currentWord}
          aria-valuemin={0}
          aria-valuemax={totalWords}
          aria-label={`Progress: ${currentWord} of ${totalWords} words completed`}
        />
      </div>
    </div>
  );
};
