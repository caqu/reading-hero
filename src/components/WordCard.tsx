import { useState, useEffect } from 'react';
import { Word } from '../types';
import { WordVariants } from './WordVariants';
import { SyllableDisplay } from './SyllableDisplay';
import styles from './WordCard.module.css';

interface WordCardProps {
  word: Word;
  showWord?: boolean;
  /** Show multiple font variants (Level 2+) */
  showVariants?: boolean;
  /** Show syllabified versions (Level 3+) */
  showSyllables?: boolean;
  /** Hide emoji after delay (Level 5) */
  hideEmojiAfterDelay?: boolean;
}

export const WordCard = ({
  word,
  showWord = false,
  showVariants = false,
  showSyllables = false,
  hideEmojiAfterDelay = false,
}: WordCardProps) => {
  // Determine what to display: emoji, image, or fallback
  const hasEmoji = word.emoji && word.emoji.length > 0;
  const hasImage = word.imageUrl && word.imageUrl.length > 0;

  // State for hiding emoji after delay (Level 5 feature)
  const [emojiHidden, setEmojiHidden] = useState(false);

  useEffect(() => {
    // Reset emoji visibility when word changes
    setEmojiHidden(false);

    if (hideEmojiAfterDelay && hasEmoji) {
      // Show emoji briefly, then hide it after 2 seconds
      const timer = setTimeout(() => {
        setEmojiHidden(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [word.id, hideEmojiAfterDelay, hasEmoji]);

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        {hasEmoji && !emojiHidden ? (
          // Display emoji as the main visual
          <div
            className={`${styles.emoji} ${hideEmojiAfterDelay ? styles.emojiFlashing : ''}`}
            aria-label={word.emojiDescription || word.text}
          >
            {word.emoji}
          </div>
        ) : hasEmoji && emojiHidden ? (
          // Show placeholder when emoji is hidden
          <div className={styles.emojiHidden} aria-label="Emoji hidden">
            ?
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

      {/* Level 2+: Show word variants */}
      {showVariants && <WordVariants word={word.text} variantCount={5} />}

      {/* Level 3+: Show syllabified versions */}
      {showSyllables && <SyllableDisplay word={word.text} />}
    </div>
  );
};
