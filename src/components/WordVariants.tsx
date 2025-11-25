/**
 * WordVariants.tsx
 *
 * Displays multiple print variants of a word to build print variability recognition.
 * Used in Level 2+ to help learners recognize the same word in different fonts and cases.
 */

import styles from './WordVariants.module.css';

export interface WordVariantsProps {
  /** The word to display in multiple variants */
  word: string;
  /** Number of variants to show (3-5) */
  variantCount?: number;
}

/**
 * Available text transformations for print variability
 */
type VariantTransform = 'lowercase' | 'uppercase' | 'titlecase' | 'monospace' | 'serif';

interface Variant {
  text: string;
  className: string;
  label: string;
}

/**
 * Transform word based on variant type
 */
function transformWord(word: string, transform: VariantTransform): string {
  switch (transform) {
    case 'lowercase':
      return word.toLowerCase();
    case 'uppercase':
      return word.toUpperCase();
    case 'titlecase':
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    default:
      return word; // monospace and serif use same text, different CSS
  }
}

/**
 * Get CSS class for variant styling
 */
function getVariantClassName(transform: VariantTransform): string {
  switch (transform) {
    case 'lowercase':
      return styles.lowercase || '';
    case 'uppercase':
      return styles.uppercase || '';
    case 'titlecase':
      return styles.titlecase || '';
    case 'monospace':
      return styles.monospace || '';
    case 'serif':
      return styles.serif || '';
    default:
      return '';
  }
}

/**
 * Get human-readable label for variant
 */
function getVariantLabel(transform: VariantTransform): string {
  switch (transform) {
    case 'lowercase':
      return 'lowercase';
    case 'uppercase':
      return 'UPPERCASE';
    case 'titlecase':
      return 'Title Case';
    case 'monospace':
      return 'monospace';
    case 'serif':
      return 'serif';
    default:
      return '';
  }
}

/**
 * WordVariants Component
 *
 * Shows 3-5 different visual representations of the same word:
 * - lowercase
 * - UPPERCASE
 * - Title Case
 * - monospace font
 * - serif font
 *
 * Helps learners build orthographic flexibility and recognize
 * that the same word can appear in different visual forms.
 */
export const WordVariants = ({ word, variantCount = 5 }: WordVariantsProps) => {
  const allTransforms: VariantTransform[] = [
    'lowercase',
    'uppercase',
    'titlecase',
    'monospace',
    'serif',
  ];

  // Select variants based on count (always include lowercase, uppercase, titlecase first)
  const selectedTransforms = allTransforms.slice(0, Math.min(variantCount, 5));

  const variants: Variant[] = selectedTransforms.map(transform => ({
    text: transformWord(word, transform),
    className: getVariantClassName(transform),
    label: getVariantLabel(transform),
  }));

  return (
    <div className={styles.container} role="list" aria-label="Word variants">
      <div className={styles.variantsGrid}>
        {variants.map((variant, index) => (
          <div
            key={index}
            className={styles.variantCard}
            role="listitem"
            aria-label={`${variant.label}: ${variant.text}`}
          >
            <div className={`${styles.variantText} ${variant.className}`}>
              {variant.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
