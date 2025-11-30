/**
 * Motor-Learning Metrics Tracking Utilities
 *
 * Tracks keyboard motor skills including:
 * - Left/right hand errors
 * - Common letter errors
 * - Row transition speed
 * - Typing speed baseline
 */

import type { Profile } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Left hand keys on QWERTY keyboard
 */
const LEFT_HAND_KEYS = new Set([
  'q', 'w', 'e', 'r', 't',
  'a', 's', 'd', 'f', 'g',
  'z', 'x', 'c', 'v', 'b'
]);

/**
 * Right hand keys on QWERTY keyboard
 */
const RIGHT_HAND_KEYS = new Set([
  'y', 'u', 'i', 'o', 'p',
  'h', 'j', 'k', 'l',
  'n', 'm'
]);

/**
 * Keyboard rows for transition tracking
 */
enum KeyboardRow {
  TOP = 0,
  HOME = 1,
  BOTTOM = 2,
  UNKNOWN = -1
}

const TOP_ROW = new Set(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']);
const HOME_ROW = new Set(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']);
const BOTTOM_ROW = new Set(['z', 'x', 'c', 'v', 'b', 'n', 'm']);

// ============================================================================
// TYPES
// ============================================================================

/**
 * Represents a single keystroke with timing and correctness info
 */
export interface KeystrokeData {
  key: string;
  timestamp: number;
  isCorrect: boolean;
  expectedKey: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determines if a key is pressed by the left hand
 */
export function isLeftHandKey(key: string): boolean {
  return LEFT_HAND_KEYS.has(key.toLowerCase());
}

/**
 * Determines if a key is pressed by the right hand
 */
export function isRightHandKey(key: string): boolean {
  return RIGHT_HAND_KEYS.has(key.toLowerCase());
}

/**
 * Gets the keyboard row for a given key
 */
export function getKeyboardRow(key: string): KeyboardRow {
  const lowerKey = key.toLowerCase();
  if (TOP_ROW.has(lowerKey)) return KeyboardRow.TOP;
  if (HOME_ROW.has(lowerKey)) return KeyboardRow.HOME;
  if (BOTTOM_ROW.has(lowerKey)) return KeyboardRow.BOTTOM;
  return KeyboardRow.UNKNOWN;
}

/**
 * Checks if there was a row transition between two keys
 */
export function isRowTransition(key1: string, key2: string): boolean {
  const row1 = getKeyboardRow(key1);
  const row2 = getKeyboardRow(key2);
  return row1 !== KeyboardRow.UNKNOWN &&
         row2 !== KeyboardRow.UNKNOWN &&
         row1 !== row2;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Updates motor-learning metrics in the profile based on keystrokes from a completed word
 *
 * @param profile - The learner profile to update
 * @param keystrokes - Array of keystroke data for the word
 * @param wordTime - Total time to complete the word in milliseconds
 * @param letterCount - Number of letters in the word
 * @returns Updated motor metrics object
 */
export function updateMotorMetrics(
  profile: Profile,
  keystrokes: KeystrokeData[],
  wordTime: number,
  letterCount: number
): Profile['motor'] {
  // Start with current motor metrics
  const updatedMotor = { ...profile.motor };

  // Deep clone commonLetterErrors to avoid mutation
  updatedMotor.commonLetterErrors = { ...profile.motor.commonLetterErrors };

  // 1. Track left/right hand errors
  for (const keystroke of keystrokes) {
    if (!keystroke.isCorrect) {
      // Increment error count for the hand that made the mistake
      if (isLeftHandKey(keystroke.key)) {
        updatedMotor.leftHandErrors++;
      } else if (isRightHandKey(keystroke.key)) {
        updatedMotor.rightHandErrors++;
      }

      // 2. Track common letter errors (by expected letter)
      const expectedLetter = keystroke.expectedKey.toLowerCase();
      updatedMotor.commonLetterErrors[expectedLetter] =
        (updatedMotor.commonLetterErrors[expectedLetter] || 0) + 1;
    }
  }

  // 3. Calculate row transition speed
  // Only track correct keystrokes for transition speed
  const correctKeystrokes = keystrokes.filter(k => k.isCorrect);

  if (correctKeystrokes.length >= 2) {
    let transitionTimes: number[] = [];

    for (let i = 1; i < correctKeystrokes.length; i++) {
      const prevKey = correctKeystrokes[i - 1]!;
      const currKey = correctKeystrokes[i]!;

      if (isRowTransition(prevKey.key, currKey.key)) {
        const transitionTime = currKey.timestamp - prevKey.timestamp;
        transitionTimes.push(transitionTime);
      }
    }

    // Update rolling average if we have transition data
    if (transitionTimes.length > 0) {
      const avgTransitionTime = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length;

      // Rolling average: 90% old value, 10% new value
      if (updatedMotor.rowTransitionSpeed === 0) {
        // First data point - use it directly
        updatedMotor.rowTransitionSpeed = avgTransitionTime;
      } else {
        updatedMotor.rowTransitionSpeed =
          (updatedMotor.rowTransitionSpeed * 0.9) + (avgTransitionTime * 0.1);
      }
    }
  }

  return updatedMotor;
}

/**
 * Updates typing speed baseline in the profile
 *
 * @param profile - The learner profile to update
 * @param wordTime - Total time to complete the word in milliseconds
 * @param letterCount - Number of letters in the word
 * @returns Updated typing speed baseline (ms per letter)
 */
export function updateTypingSpeedBaseline(
  profile: Profile,
  wordTime: number,
  letterCount: number
): number {
  if (letterCount === 0) return profile.typingSpeedBaseline;

  const currentSpeedPerLetter = wordTime / letterCount;

  // Rolling average: 90% old value, 10% new value
  if (profile.typingSpeedBaseline === 0 || profile.stats.wordsCompleted === 0) {
    // First data point - use it directly
    return currentSpeedPerLetter;
  } else {
    return (profile.typingSpeedBaseline * 0.9) + (currentSpeedPerLetter * 0.1);
  }
}

/**
 * Updates error baseline in the profile
 *
 * @param profile - The learner profile to update
 * @param errorCount - Number of errors in the completed word
 * @returns Updated error baseline (average errors per word)
 */
export function updateErrorBaseline(
  profile: Profile,
  errorCount: number
): number {
  // Rolling average: 90% old value, 10% new value
  if (profile.errorBaseline === 0 || profile.stats.wordsCompleted === 0) {
    // First data point - use it directly
    return errorCount;
  } else {
    return (profile.errorBaseline * 0.9) + (errorCount * 0.1);
  }
}
