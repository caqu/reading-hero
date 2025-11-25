import styles from './WordCard.module.css';

interface WordCardProps {
  imageUrl: string;
  word: string;
  showWord?: boolean;
}

export const WordCard = ({ imageUrl, word, showWord = false }: WordCardProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <img
          src={imageUrl}
          alt={showWord ? word : 'Word image'}
          className={styles.image}
        />
      </div>
      {showWord && (
        <div className={styles.wordText} aria-label={`Word: ${word}`}>
          {word}
        </div>
      )}
    </div>
  );
};
