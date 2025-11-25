import { Word } from '../types';
import styles from './WordCard.module.css';

interface WordCardProps {
  word: Word;
  showWord?: boolean;
}

export const WordCard = ({ word, showWord = false }: WordCardProps) => {
  // Determine what to display: emoji, image, or fallback
  const hasEmoji = word.emoji && word.emoji.length > 0;
  const hasImage = word.imageUrl && word.imageUrl.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        {hasEmoji ? (
          // Display emoji as the main visual
          <div className={styles.emoji} aria-label={word.emojiDescription || word.text}>
            {word.emoji}
          </div>
        ) : hasImage ? (
          // Display image if no emoji
          <img
            src={word.imageUrl}
            alt={showWord ? word.text : 'Word image'}
            className={styles.image}
          />
        ) : (
          // Fallback: show word text if no emoji or image
          <div className={styles.fallbackText}>
            {word.text}
          </div>
        )}
      </div>
      {showWord && (
        <div className={styles.wordText} aria-label={`Word: ${word.text}`}>
          {word.text}
        </div>
      )}
    </div>
  );
};
