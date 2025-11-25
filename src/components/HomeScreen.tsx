import styles from './HomeScreen.module.css';

interface HomeScreenProps {
  onStart: () => void;
}

export const HomeScreen = ({ onStart }: HomeScreenProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to MotorKeys!</h1>
        <p className={styles.subtitle}>
          Practice typing and learn new words
        </p>
        <button
          className={styles.startButton}
          onClick={onStart}
          aria-label="Start the game"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};
