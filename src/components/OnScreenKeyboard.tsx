import { memo } from 'react';
import styles from './OnScreenKeyboard.module.css';

interface OnScreenKeyboardProps {
  /** Callback when a key is pressed */
  onKeyPress: (key: string) => void;
  /** Optional key to highlight for guidance */
  highlightKey?: string;
  /** Whether the keyboard should be disabled */
  disabled?: boolean;
  /** Key that was pressed incorrectly (for shake animation) */
  wrongKey?: string | null;
  /** Correct key to hint at (for pulse animation) */
  correctKey?: string | null;
}

/**
 * QWERTY layout keyboard rows
 * Fourth row contains spacebar
 */
const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  [' '], // Spacebar on its own row
];

/**
 * Right-hand touch typing keys (for visual distinction)
 */
const RIGHT_HAND_KEYS = new Set(['Y', 'U', 'I', 'O', 'P', 'H', 'J', 'K', 'L', 'N', 'M']);

/**
 * OnScreenKeyboard component
 *
 * Displays a QWERTY layout keyboard with clickable buttons.
 * Supports:
 * - Touch-friendly large buttons
 * - Visual feedback on click
 * - Optional key highlighting for guidance
 * - Keyboard accessibility (tab navigation)
 * - Disabled state
 */
export const OnScreenKeyboard = memo(({
  onKeyPress,
  highlightKey,
  disabled = false,
  wrongKey = null,
  correctKey = null,
}: OnScreenKeyboardProps) => {
  const handleKeyClick = (key: string) => {
    if (!disabled) {
      onKeyPress(key);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, key: string) => {
    // Allow Enter or Space to trigger the button
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleKeyClick(key);
    }
  };

  return (
    <div
      className={styles.keyboard}
      role="group"
      aria-label="On-screen keyboard"
    >
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.keyboardRow}>
          {row.map((key, keyIndex) => {
            const isSpacebar = key === ' ';
            const normalizedKey = isSpacebar ? ' ' : key.toLowerCase();
            const normalizedHighlight = highlightKey?.toLowerCase();
            const normalizedWrong = wrongKey?.toLowerCase();
            const normalizedCorrect = correctKey?.toLowerCase();

            const isHighlighted = normalizedKey === normalizedHighlight;
            const isWrong = normalizedKey === normalizedWrong;
            const isCorrectHint = normalizedKey === normalizedCorrect;
            const isRightHand = RIGHT_HAND_KEYS.has(key);

            return (
              <button
                key={`${key}-${keyIndex}`}
                type="button"
                className={`${styles.key} ${isSpacebar ? styles.spacebar : ''} ${isRightHand ? styles.rightHand : ''} ${isHighlighted ? styles.highlighted : ''} ${isWrong ? styles.wrong : ''} ${isCorrectHint ? styles.correctHint : ''}`}
                onClick={() => handleKeyClick(key)}
                onKeyDown={(e) => handleKeyDown(e, key)}
                disabled={disabled}
                aria-label={isSpacebar ? 'Space' : `Letter ${key}`}
                aria-pressed={isHighlighted}
              >
                {isSpacebar ? 'SPACE' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
});

OnScreenKeyboard.displayName = 'OnScreenKeyboard';
