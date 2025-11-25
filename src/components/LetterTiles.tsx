import styles from './LetterTiles.module.css';

interface LetterTilesProps {
  word: string;
  currentIndex: number;
  revealedLetters: boolean[];
}

export const LetterTiles = ({ word, currentIndex, revealedLetters }: LetterTilesProps) => {
  const letters = word.split('');

  return (
    <div className={styles.container} role="group" aria-label="Letter tiles">
      {letters.map((letter, index) => {
        const isRevealed = revealedLetters[index];
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;

        return (
          <div
            key={index}
            className={`
              ${styles.tile}
              ${isRevealed ? styles.revealed : ''}
              ${isCurrent ? styles.current : ''}
              ${isPast ? styles.past : ''}
            `}
            aria-label={isRevealed ? `Letter ${letter}` : 'Empty tile'}
            aria-current={isCurrent ? 'true' : 'false'}
          >
            {isRevealed ? letter : ''}
          </div>
        );
      })}
    </div>
  );
};
