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
 * Dictionary of common word syllabifications for accuracy
 */
const SYLLABLE_DICTIONARY: Record<string, string[]> = {
  'tractor': ['trac', 'tor'],
  'doctor': ['doc', 'tor'],
  'monster': ['mon', 'ster'],
  'winter': ['win', 'ter'],
  'sister': ['sis', 'ter'],
  'brother': ['broth', 'er'],
  'mother': ['moth', 'er'],
  'father': ['fa', 'ther'],
  'teacher': ['teach', 'er'],
  'number': ['num', 'ber'],
  'letter': ['let', 'ter'],
  'better': ['bet', 'ter'],
  'happy': ['hap', 'py'],
  'monkey': ['mon', 'key'],
  'turkey': ['tur', 'key'],
  'chicken': ['chick', 'en'],
  'kitten': ['kit', 'ten'],
  'puppy': ['pup', 'py'],
  'bunny': ['bun', 'ny'],
  'tiger': ['ti', 'ger'],
  'dragon': ['drag', 'on'],
  'balloon': ['bal', 'loon'],
  'yellow': ['yel', 'low'],
  'purple': ['pur', 'ple'],
  'orange': ['or', 'ange'],
  'pumpkin': ['pump', 'kin'],
  'melon': ['mel', 'on'],
  'lemon': ['lem', 'on'],
};

/**
 * Improved syllabification algorithm
 * Uses dictionary for common words, falls back to pattern matching
 *
 * Pattern rules:
 * - VCCV: Split between consonants (e.g., "win-ter")
 * - VCV: Split before single consonant (e.g., "ro-bot")
 * - VV: Split between vowels (e.g., "di-et")
 */
function syllabify(word: string): string[] {
  const lower = word.toLowerCase();

  // Check dictionary first
  if (SYLLABLE_DICTIONARY[lower]) {
    return SYLLABLE_DICTIONARY[lower];
  }

  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

  // Handle very short words
  if (lower.length <= 3) {
    return [word];
  }

  const syllables: string[] = [];
  let currentSyllable = '';

  for (let i = 0; i < lower.length; i++) {
    const char = lower[i] || '';
    const isVowel = vowels.has(char);
    currentSyllable += word[i] || '';

    // Look ahead to determine split point
    const next1 = lower[i + 1];
    const next2 = lower[i + 2];

    if (!next1) continue; // End of word

    const next1IsVowel = vowels.has(next1);
    const next2IsVowel = next2 ? vowels.has(next2) : false;

    // VCCV pattern: vowel-consonant-consonant-vowel (split between consonants)
    if (isVowel && !next1IsVowel && next2 && !next2IsVowel) {
      currentSyllable += word[i + 1] || '';
      syllables.push(currentSyllable);
      currentSyllable = '';
      i++; // Skip the consonant we just added
    }
    // VCV pattern: vowel-consonant-vowel (split before consonant)
    else if (isVowel && !next1IsVowel && next2IsVowel && currentSyllable.length > 1) {
      syllables.push(currentSyllable);
      currentSyllable = '';
    }
    // VV pattern: two vowels together (split between them)
    else if (isVowel && next1IsVowel && currentSyllable.length > 1) {
      syllables.push(currentSyllable);
      currentSyllable = '';
    }
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
 *
 * These variants help learners develop orthographic awareness
 * and understand that words are composed of segments.
 */
export const SyllableDisplay = ({ word }: SyllableDisplayProps) => {
  const syllables = syllabify(word);
  const hyphenated = syllables.join('-');
  const dotted = syllables.join('·');

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
      </div>
    </div>
  );
};
