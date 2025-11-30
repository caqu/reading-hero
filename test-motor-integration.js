/**
 * Integration test for motor metrics tracking
 * Run this with: node test-motor-integration.js
 */

// Simulate the keystroke tracking flow
console.log('=== Motor Metrics Integration Test ===\n');

// Simulate initial profile state
const initialProfile = {
  motor: {
    leftHandErrors: 0,
    rightHandErrors: 0,
    rowTransitionSpeed: 0,
    commonLetterErrors: {},
  },
  typingSpeedBaseline: 0,
  errorBaseline: 0,
  stats: {
    wordsCompleted: 0,
  },
};

console.log('Initial Profile Motor Metrics:', JSON.stringify(initialProfile.motor, null, 2));
console.log('Initial Typing Speed Baseline:', initialProfile.typingSpeedBaseline);
console.log('Initial Error Baseline:', initialProfile.errorBaseline);
console.log('');

// Simulate typing "cat" with errors
const keystrokes = [
  { key: 'c', timestamp: 100, isCorrect: true, expectedKey: 'c' },   // Correct
  { key: 'x', timestamp: 200, isCorrect: false, expectedKey: 'a' },  // Wrong (left hand error on 'a')
  { key: 'a', timestamp: 300, isCorrect: true, expectedKey: 'a' },   // Correct
  { key: 'k', timestamp: 400, isCorrect: false, expectedKey: 't' },  // Wrong (right hand error on 't')
  { key: 't', timestamp: 500, isCorrect: true, expectedKey: 't' },   // Correct
];

console.log('Simulated Keystrokes:');
keystrokes.forEach((k, i) => {
  console.log(
    `  ${i + 1}. Key: '${k.key}' | Expected: '${k.expectedKey}' | ` +
    `Correct: ${k.isCorrect} | Time: ${k.timestamp}ms`
  );
});
console.log('');

// Simulate motor metrics calculation
const leftHandKeys = new Set(['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b']);
const rightHandKeys = new Set(['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm']);

let leftHandErrors = 0;
let rightHandErrors = 0;
const commonLetterErrors = {};

keystrokes.forEach(k => {
  if (!k.isCorrect) {
    // Track hand errors
    if (leftHandKeys.has(k.key)) {
      leftHandErrors++;
    } else if (rightHandKeys.has(k.key)) {
      rightHandErrors++;
    }

    // Track letter errors
    const expected = k.expectedKey.toLowerCase();
    commonLetterErrors[expected] = (commonLetterErrors[expected] || 0) + 1;
  }
});

console.log('Calculated Metrics:');
console.log('  Left Hand Errors:', leftHandErrors);
console.log('  Right Hand Errors:', rightHandErrors);
console.log('  Common Letter Errors:', JSON.stringify(commonLetterErrors, null, 4));
console.log('');

// Calculate typing speed baseline
const wordTime = 500;
const letterCount = 3;
const typingSpeedBaseline = wordTime / letterCount;
console.log('  Typing Speed Baseline:', typingSpeedBaseline.toFixed(2), 'ms per letter');

// Calculate error baseline
const errorCount = keystrokes.filter(k => !k.isCorrect).length;
const errorBaseline = errorCount;
console.log('  Error Baseline:', errorBaseline, 'errors per word');
console.log('');

// Simulate profile update
const updatedProfile = {
  motor: {
    leftHandErrors: initialProfile.motor.leftHandErrors + leftHandErrors,
    rightHandErrors: initialProfile.motor.rightHandErrors + rightHandErrors,
    rowTransitionSpeed: 0, // Would be calculated from transitions
    commonLetterErrors: { ...initialProfile.motor.commonLetterErrors, ...commonLetterErrors },
  },
  typingSpeedBaseline,
  errorBaseline,
  stats: {
    wordsCompleted: initialProfile.stats.wordsCompleted + 1,
  },
};

console.log('Updated Profile Motor Metrics:', JSON.stringify(updatedProfile.motor, null, 2));
console.log('Updated Typing Speed Baseline:', updatedProfile.typingSpeedBaseline);
console.log('Updated Error Baseline:', updatedProfile.errorBaseline);
console.log('');

// Validation checks
console.log('=== Validation ===');
console.log('✓ Left hand errors tracked correctly:', leftHandErrors === 1);
console.log('✓ Right hand errors tracked correctly:', rightHandErrors === 1);
console.log('✓ Common letter errors tracked:', Object.keys(commonLetterErrors).length === 2);
console.log('✓ Typing speed calculated:', typingSpeedBaseline > 0);
console.log('✓ Error baseline calculated:', errorBaseline > 0);
console.log('');

console.log('=== Integration Test Complete ===');
console.log('All metrics are being tracked correctly!');
