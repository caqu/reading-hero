import styles from './FinishScreen.module.css';

interface FinishScreenProps {
  onRestart: () => void;
  isInitial?: boolean;
}

export const FinishScreen = ({ onRestart, isInitial = false }: FinishScreenProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <img
            src="/assets/ASL-Reading-Hero-logo.png"
            alt="ASL Reading Hero Logo"
            className={styles.logo}
          />
        </div>

        {!isInitial && (
          <div className={styles.completionMessage}>
            <h1 className={styles.message}>You're Done!</h1>
          </div>
        )}

        <button
          className={styles.restartButton}
          onClick={onRestart}
          aria-label={isInitial ? "Start the game" : "Restart the game"}
        >
          {isInitial ? 'Start' : 'Restart'}
        </button>
      </div>
    </div>
  );
};
