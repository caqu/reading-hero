import { useState, useEffect } from 'react';
import { Word } from '../types';
import { WordVariants } from './WordVariants';
import { SignVideo } from './SignVideo';
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
  /** Whether the word is currently celebrating (for emoji bobblehead animation) */
  isCelebrating?: boolean;
}

export const WordCard = ({
  word,
  showWord = false,
  showVariants = false,
  showSyllables = false,
  hideEmojiAfterDelay = false,
  isCelebrating = false,
}: WordCardProps) => {
  // Determine what to display: video, emoji, image, or fallback
  const hasVideo = word.signVideoUrl && word.signVideoUrl.length > 0;
  const hasEmoji = word.emoji && word.emoji.length > 0;
  const hasImage = word.imageUrl && word.imageUrl.length > 0;

  // State for hiding emoji after delay (Level 5 feature)
  const [emojiHidden, setEmojiHidden] = useState(false);

  // State for animation trigger - use word ID as key to re-trigger animation
  const [animationKey, setAnimationKey] = useState(word.id);

  useEffect(() => {
    // Reset emoji visibility when word changes
    setEmojiHidden(false);

    // Trigger animation by updating key
    setAnimationKey(word.id);

    if (hideEmojiAfterDelay && hasEmoji) {
      // Show emoji briefly, then hide it after 2 seconds
      const timer = setTimeout(() => {
        setEmojiHidden(true);
      }, 2000);

      return () => clearTimeout(timer);
    }

    // Return empty cleanup function if not hiding emoji
    return () => {};
  }, [word.id, hideEmojiAfterDelay, hasEmoji]);

  return (
    <div className={styles.container}>
      {/* Task 6: Side-by-side layout when both emoji/image and sign video exist */}
      {hasVideo && (hasEmoji || hasImage) ? (
        <div className={styles.sideBySideContainer}>
          {/* Left: Emoji or Image */}
          <div className={styles.imageContainer}>
            {hasEmoji && !emojiHidden ? (
              <div
                key={animationKey}
                className={`${styles.emoji} ${!isCelebrating ? styles.bounceIn : ''} ${hideEmojiAfterDelay ? styles.emojiFlashing : ''} ${isCelebrating ? styles.bobblehead : ''}`}
                aria-label={word.emojiDescription || word.text}
              >
                {word.emoji}
              </div>
            ) : hasEmoji && emojiHidden ? (
              <div className={styles.emojiHidden} aria-label="Emoji hidden">
                ?
              </div>
            ) : hasImage ? (
              <img
                key={animationKey}
                src={word.imageUrl}
                alt={showWord ? word.text : 'Word image'}
                className={`${styles.image} ${styles.bounceIn}`}
              />
            ) : null}
          </div>

          {/* Right: ASL Sign Video */}
          <div className={styles.imageContainer}>
            <SignVideo
              key={animationKey}
              mp4Src={word.signVideoUrl}
              webmSrc={word.signVideoWebmUrl}
              thumbnailSrc={word.signThumbnailUrl}
              alt={`ASL sign for ${word.text}`}
              className={`${styles.video} ${styles.bounceIn}`}
            />
          </div>
        </div>
      ) : (
        /* Single item layout (original behavior) */
        <div className={styles.imageContainer}>
          {hasVideo ? (
            // Display ASL sign language video only
            <SignVideo
              key={animationKey}
              mp4Src={word.signVideoUrl}
              webmSrc={word.signVideoWebmUrl}
              thumbnailSrc={word.signThumbnailUrl}
              alt={`ASL sign for ${word.text}`}
              className={`${styles.video} ${styles.bounceIn}`}
            />
          ) : hasEmoji && !emojiHidden ? (
            // Display emoji as the main visual
            <div
              key={animationKey}
              className={`${styles.emoji} ${!isCelebrating ? styles.bounceIn : ''} ${hideEmojiAfterDelay ? styles.emojiFlashing : ''} ${isCelebrating ? styles.bobblehead : ''}`}
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
              key={animationKey}
              src={word.imageUrl}
              alt={showWord ? word.text : 'Word image'}
              className={`${styles.image} ${styles.bounceIn}`}
            />
          ) : (
            // Fallback: show word text if no video, emoji, or image
            <div className={styles.fallbackText}>
              {word.text}
            </div>
          )}
        </div>
      )}

      {showWord && (
        <div className={styles.wordText} aria-label={`Word: ${word.text}`}>
          {word.text}
        </div>
      )}

      {/* Level 2+: Show word variants, Level 3+: Include syllables and segments */}
      {showVariants && (
        <WordVariants
          word={word}
          showSyllables={showSyllables}
        />
      )}
    </div>
  );
};
