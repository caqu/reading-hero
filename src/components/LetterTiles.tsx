import styles from './LetterTiles.module.css';

interface LetterTilesProps {
  word: string;
  currentIndex: number;
  revealedLetters: boolean[];
  correctTileIndex?: number | null;
  /** Whether to show tiles as blank until revealed (Level 4-5) */
  useBlankTiles?: boolean;
  /** Whether to enable tile animations */
  enableAnimations?: boolean;
}

export const LetterTiles = ({
  word,
  currentIndex,
  revealedLetters,
  correctTileIndex = null,
  useBlankTiles = false,
  enableAnimations = true,
}: LetterTilesProps) => {
  const letters = word.split('');

  return (
    <div className={styles.container} role="group" aria-label="Letter tiles">
      {letters.map((letter, index) => {
        const isRevealed = revealedLetters[index];
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;
        const isCorrectAnimating = index === correctTileIndex;

        // In blank tile mode, tiles appear empty until revealed
        const showLetter = isRevealed;
        const showBlank = useBlankTiles && !isRevealed;

        return (
          <div
            key={index}
            className={`
              ${styles.tile}
              ${isRevealed ? styles.revealed : ''}
              ${isCurrent ? styles.current : ''}
              ${isPast ? styles.past : ''}
              ${isCorrectAnimating && enableAnimations ? styles.correctAnimate : ''}
              ${showBlank ? styles.blank : ''}
            `}
            aria-label={showLetter ? `Letter ${letter}` : 'Empty tile'}
            aria-current={isCurrent ? 'true' : 'false'}
          >
            {showLetter ? letter : ''}
          </div>
        );
      })}
    </div>
  );
};
