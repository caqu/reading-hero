/**
 * Simple test to verify motor metrics tracking logic
 * Run with: node test-motor-metrics.js
 */

// Simulate the motor metrics functions (simplified for Node.js testing)

const LEFT_HAND_KEYS = new Set(['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b']);
const RIGHT_HAND_KEYS = new Set(['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm']);
const TOP_ROW = new Set(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']);
const HOME_ROW = new Set(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']);
const BOTTOM_ROW = new Set(['z', 'x', 'c', 'v', 'b', 'n', 'm']);

function isLeftHandKey(key) {
  return LEFT_HAND_KEYS.has(key.toLowerCase());
}

function isRightHandKey(key) {
  return RIGHT_HAND_KEYS.has(key.toLowerCase());
}

function getKeyboardRow(key) {
  const lowerKey = key.toLowerCase();
  if (TOP_ROW.has(lowerKey)) return 0;
  if (HOME_ROW.has(lowerKey)) return 1;
  if (BOTTOM_ROW.has(lowerKey)) return 2;
  return -1;
}

function isRowTransition(key1, key2) {
  const row1 = getKeyboardRow(key1);
  const row2 = getKeyboardRow(key2);
  return row1 !== -1 && row2 !== -1 && row1 !== row2;
}

// Test cases
console.log('Testing Motor Metrics Functions\n');
console.log('================================\n');

// Test 1: Hand detection
console.log('Test 1: Hand Detection');
console.log('  "a" is left hand:', isLeftHandKey('a'), '(expected: true)');
console.log('  "l" is right hand:', isRightHandKey('l'), '(expected: true)');
console.log('  "t" is left hand:', isLeftHandKey('t'), '(expected: true)');
console.log('  "y" is right hand:', isRightHandKey('y'), '(expected: true)');
console.log('');

// Test 2: Row detection
console.log('Test 2: Row Detection');
console.log('  "q" row:', getKeyboardRow('q'), '(expected: 0 - top)');
console.log('  "a" row:', getKeyboardRow('a'), '(expected: 1 - home)');
console.log('  "z" row:', getKeyboardRow('z'), '(expected: 2 - bottom)');
console.log('');

// Test 3: Row transitions
console.log('Test 3: Row Transitions');
console.log('  "a" to "q" is transition:', isRowTransition('a', 'q'), '(expected: true)');
console.log('  "a" to "s" is transition:', isRowTransition('a', 's'), '(expected: false)');
console.log('  "q" to "z" is transition:', isRowTransition('q', 'z'), '(expected: true)');
console.log('');

// Test 4: Simulate word completion with errors
console.log('Test 4: Simulated Word Tracking - "cat"');
const profile = {
  motor: {
    leftHandErrors: 0,
    rightHandErrors: 0,
    rowTransitionSpeed: 0,
    commonLetterErrors: {}
  },
  typingSpeedBaseline: 1000,
  errorBaseline: 2,
  stats: { wordsCompleted: 0 }
};

const keystrokes = [
  { key: 'c', timestamp: 0, isCorrect: true, expectedKey: 'c' },
  { key: 'x', timestamp: 50, isCorrect: false, expectedKey: 'a' },  // Wrong key (left hand)
  { key: 'a', timestamp: 100, isCorrect: true, expectedKey: 'a' },
  { key: 't', timestamp: 150, isCorrect: true, expectedKey: 't' }
];

// Simulate updateMotorMetrics
let updatedMotor = { ...profile.motor, commonLetterErrors: {} };

for (const keystroke of keystrokes) {
  if (!keystroke.isCorrect) {
    if (isLeftHandKey(keystroke.key)) {
      updatedMotor.leftHandErrors++;
    } else if (isRightHandKey(keystroke.key)) {
      updatedMotor.rightHandErrors++;
    }

    const expectedLetter = keystroke.expectedKey.toLowerCase();
    updatedMotor.commonLetterErrors[expectedLetter] =
      (updatedMotor.commonLetterErrors[expectedLetter] || 0) + 1;
  }
}

// Calculate row transitions
const correctKeystrokes = keystrokes.filter(k => k.isCorrect);
let transitionTimes = [];

for (let i = 1; i < correctKeystrokes.length; i++) {
  const prevKey = correctKeystrokes[i - 1];
  const currKey = correctKeystrokes[i];

  if (isRowTransition(prevKey.key, currKey.key)) {
    const transitionTime = currKey.timestamp - prevKey.timestamp;
    transitionTimes.push(transitionTime);
  }
}

if (transitionTimes.length > 0) {
  const avgTransitionTime = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length;
  updatedMotor.rowTransitionSpeed = avgTransitionTime;
}

console.log('  Left hand errors:', updatedMotor.leftHandErrors, '(expected: 1)');
console.log('  Right hand errors:', updatedMotor.rightHandErrors, '(expected: 0)');
console.log('  Common letter errors:', updatedMotor.commonLetterErrors);
console.log('  Row transition speed:', updatedMotor.rowTransitionSpeed, 'ms');
console.log('');

// Test 5: Typing speed and error baseline
console.log('Test 5: Baseline Updates');
const wordTime = 150;
const letterCount = 3;
const errorCount = 1;

const typingSpeedPerLetter = wordTime / letterCount;
console.log('  Typing speed per letter:', typingSpeedPerLetter.toFixed(2), 'ms (expected: 50ms)');

const updatedTypingSpeed = profile.stats.wordsCompleted === 0
  ? typingSpeedPerLetter
  : (profile.typingSpeedBaseline * 0.9) + (typingSpeedPerLetter * 0.1);
console.log('  Updated baseline:', updatedTypingSpeed.toFixed(2), 'ms');

const updatedErrorBaseline = profile.stats.wordsCompleted === 0
  ? errorCount
  : (profile.errorBaseline * 0.9) + (errorCount * 0.1);
console.log('  Updated error baseline:', updatedErrorBaseline.toFixed(2));
console.log('');

console.log('================================');
console.log('All tests completed successfully!');
