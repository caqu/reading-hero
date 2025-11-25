import styles from './LetterTiles.module.css';

interface LetterTilesProps {
  word: string;
  currentIndex: number;
  revealedLetters: boolean[];
  correctTileIndex?: number | null;
}

export const LetterTiles = ({
  word,
  currentIndex,
  revealedLetters,
  correctTileIndex = null
}: LetterTilesProps) => {
  const letters = word.split('');

  return (
    <div className={styles.container} role="group" aria-label="Letter tiles">
      {letters.map((letter, index) => {
        const isRevealed = revealedLetters[index];
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;
        const isCorrectAnimating = index === correctTileIndex;

        return (
          <div
            key={index}
            className={`
              ${styles.tile}
              ${isRevealed ? styles.revealed : ''}
              ${isCurrent ? styles.current : ''}
              ${isPast ? styles.past : ''}
              ${isCorrectAnimating ? styles.correctAnimate : ''}
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
