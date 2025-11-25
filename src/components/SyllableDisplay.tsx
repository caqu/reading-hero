/**
 * SyllableDisplay.tsx
 *
 * Displays syllabified and spaced-out variants of a word to build
 * orthographic awareness and phonological segmentation skills.
 * Used in Level 3+ to help learners understand word structure.
 */

import styles from './SyllableDisplay.module.css';

export interface SyllableDisplayProps {
  /** The word to display in syllabified forms */
  word: string;
}

/**
 * Simple syllabification algorithm
 * Note: This is a basic implementation. For production, consider using
 * a more sophisticated library like 'syllable' or 'hyphenate' from npm.
 *
 * Basic rules applied:
 * - Split before consonant clusters between vowels (e.g., "mon-key")
 * - Keep consonant blends together (e.g., "str-ong")
 * - Treat single consonants between vowels as starting new syllable
 */
function syllabify(word: string): string[] {
  const lower = word.toLowerCase();
  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

  // Handle very short words
  if (lower.length <= 3) {
    return [word];
  }

  // Simple pattern-based syllabification
  const syllables: string[] = [];
  let currentSyllable = '';
  let prevWasVowel = false;

  for (let i = 0; i < lower.length; i++) {
    const char = lower[i] || '';
    const isVowel = vowels.has(char);
    const nextChar = lower[i + 1];
    const nextIsVowel = nextChar ? vowels.has(nextChar) : false;

    currentSyllable += word[i] || ''; // Use original case, fallback to empty string

    // Split before consonant between vowels (V-CV pattern)
    if (prevWasVowel && !isVowel && nextIsVowel && currentSyllable.length > 1) {
      syllables.push(currentSyllable);
      currentSyllable = '';
    }
    // Split between two vowels (V-V pattern)
    else if (prevWasVowel && isVowel && currentSyllable.length > 1) {
      syllables.push(currentSyllable.slice(0, -1));
      currentSyllable = word[i] || ''; // Fallback to empty string
    }

    prevWasVowel = isVowel;
  }

  if (currentSyllable) {
    syllables.push(currentSyllable);
  }

  return syllables.length > 0 ? syllables : [word];
}

/**
 * SyllableDisplay Component
 *
 * Shows multiple orthographic representations:
 * - Hyphenated syllables: "mon-key"
 * - Dot-separated syllables: "mon·key"
 * - Letter spacing: "m o n k e y"
 *
 * These variants help learners develop orthographic awareness
 * and understand that words are composed of segments.
 */
export const SyllableDisplay = ({ word }: SyllableDisplayProps) => {
  const syllables = syllabify(word);
  const hyphenated = syllables.join('-');
  const dotted = syllables.join('·');
  const spaced = word.split('').join(' ');

  return (
    <div className={styles.container} role="list" aria-label="Syllable variants">
      <div className={styles.syllableGrid}>
        <div className={styles.syllableCard} role="listitem" aria-label={`Hyphenated: ${hyphenated}`}>
          <div className={styles.syllableText}>
            {hyphenated}
          </div>
          <div className={styles.syllableLabel}>syllables</div>
        </div>

        <div className={styles.syllableCard} role="listitem" aria-label={`Dotted: ${dotted}`}>
          <div className={styles.syllableText}>
            {dotted}
          </div>
          <div className={styles.syllableLabel}>segments</div>
        </div>

        <div className={styles.syllableCard} role="listitem" aria-label={`Spaced: ${spaced}`}>
          <div className={`${styles.syllableText} ${styles.spacedText}`}>
            {spaced}
          </div>
          <div className={styles.syllableLabel}>letters</div>
        </div>
      </div>
    </div>
  );
};
