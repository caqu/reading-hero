/**
 * SyllableDisplay.tsx
 *
 * Displays syllabified and spaced-out variants of a word to build
 * orthographic awareness and phonological segmentation skills.
 * Used in Level 3+ to help learners understand word structure.
 */

import { Word } from '../types';
import styles from './SyllableDisplay.module.css';

export interface SyllableDisplayProps {
  /** The word object with syllables and segments */
  word: Word;
}

/**
 * SyllableDisplay Component
 *
 * Shows multiple orthographic representations:
 * - Hyphenated syllables: "mon-key"
 * - Dot-separated segments: "mon·key"
 *
 * These variants help learners develop orthographic awareness
 * and understand that words are composed of segments.
 */
export const SyllableDisplay = ({ word }: SyllableDisplayProps) => {
  // If no syllables/segments data, show word as-is
  if (!word.syllables || !word.segments) {
    return (
      <div className={styles.container} role="list" aria-label="Syllable variants">
        <div className={styles.syllableGrid}>
          <div className={styles.syllableCard} role="listitem" aria-label={`Syllables: ${word.text}`}>
            <div className={styles.syllableText}>{word.text}</div>
            <div className={styles.syllableLabel}>syllables</div>
          </div>
          <div className={styles.syllableCard} role="listitem" aria-label={`Segments: ${word.text}`}>
            <div className={styles.syllableText}>{word.text}</div>
            <div className={styles.syllableLabel}>segments</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} role="list" aria-label="Syllable variants">
      <div className={styles.syllableGrid}>
        <div className={styles.syllableCard} role="listitem" aria-label={`Hyphenated: ${word.syllables}`}>
          <div className={styles.syllableText}>
            {word.syllables}
          </div>
          <div className={styles.syllableLabel}>syllables</div>
        </div>

        <div className={styles.syllableCard} role="listitem" aria-label={`Dotted: ${word.segments}`}>
          <div className={styles.syllableText}>
            {word.segments}
          </div>
          <div className={styles.syllableLabel}>segments</div>
        </div>
      </div>
    </div>
  );
};
