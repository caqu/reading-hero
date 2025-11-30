/**
 * Tests for Motor-Learning Metrics Tracking
 */

import { describe, it, expect } from 'vitest';
import {
  isLeftHandKey,
  isRightHandKey,
  getKeyboardRow,
  isRowTransition,
  updateMotorMetrics,
  updateTypingSpeedBaseline,
  updateErrorBaseline,
  type KeystrokeData,
} from './motorMetrics';
import type { Profile } from '../types';

// Helper to create a minimal profile for testing
function createTestProfile(): Profile {
  return {
    id: 'test-profile',
    name: 'Test User',
    avatar: '😀',
    level: 1,
    lastWordId: null,
    stats: {
      accuracy: 0,
      wordsCompleted: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      totalKeystrokes: 0,
    },
    levelingState: {
      currentLevel: 1,
      wordHistory: [],
      levelStartWordCount: 0,
      uniqueWordsCompleted: [],
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    progressionState: 1,
    engagementScore: 50,
    typingSpeedBaseline: 0,
    errorBaseline: 0,
    categoryAffinity: {
      animals: 50,
      food: 50,
      fantasy: 50,
      tech: 50,
      nature: 50,
      actions: 50,
      feelings: 50,
      places: 50,
      activities: 50,
      nowWords: 50,
    },
    motor: {
      leftHandErrors: 0,
      rightHandErrors: 0,
      rowTransitionSpeed: 0,
      commonLetterErrors: {},
    },
    spacedRepetition: {
      A: [],
      B: [],
      C: [],
    },
    lastTenItems: [],
    totalCompleted: 0,
  };
}

describe('Hand Detection', () => {
  it('identifies left hand keys correctly', () => {
    // Top row left
    expect(isLeftHandKey('q')).toBe(true);
    expect(isLeftHandKey('w')).toBe(true);
    expect(isLeftHandKey('e')).toBe(true);
    expect(isLeftHandKey('r')).toBe(true);
    expect(isLeftHandKey('t')).toBe(true);

    // Home row left
    expect(isLeftHandKey('a')).toBe(true);
    expect(isLeftHandKey('s')).toBe(true);
    expect(isLeftHandKey('d')).toBe(true);
    expect(isLeftHandKey('f')).toBe(true);
    expect(isLeftHandKey('g')).toBe(true);

    // Bottom row left
    expect(isLeftHandKey('z')).toBe(true);
    expect(isLeftHandKey('x')).toBe(true);
    expect(isLeftHandKey('c')).toBe(true);
    expect(isLeftHandKey('v')).toBe(true);
    expect(isLeftHandKey('b')).toBe(true);
  });

  it('identifies right hand keys correctly', () => {
    // Top row right
    expect(isRightHandKey('y')).toBe(true);
    expect(isRightHandKey('u')).toBe(true);
    expect(isRightHandKey('i')).toBe(true);
    expect(isRightHandKey('o')).toBe(true);
    expect(isRightHandKey('p')).toBe(true);

    // Home row right
    expect(isRightHandKey('h')).toBe(true);
    expect(isRightHandKey('j')).toBe(true);
    expect(isRightHandKey('k')).toBe(true);
    expect(isRightHandKey('l')).toBe(true);

    // Bottom row right
    expect(isRightHandKey('n')).toBe(true);
    expect(isRightHandKey('m')).toBe(true);
  });

  it('handles case insensitivity', () => {
    expect(isLeftHandKey('Q')).toBe(true);
    expect(isLeftHandKey('A')).toBe(true);
    expect(isRightHandKey('Y')).toBe(true);
    expect(isRightHandKey('M')).toBe(true);
  });
});

describe('Row Detection', () => {
  it('detects top row keys', () => {
    expect(getKeyboardRow('q')).toBe(0); // TOP
    expect(getKeyboardRow('w')).toBe(0);
    expect(getKeyboardRow('p')).toBe(0);
  });

  it('detects home row keys', () => {
    expect(getKeyboardRow('a')).toBe(1); // HOME
    expect(getKeyboardRow('s')).toBe(1);
    expect(getKeyboardRow('l')).toBe(1);
  });

  it('detects bottom row keys', () => {
    expect(getKeyboardRow('z')).toBe(2); // BOTTOM
    expect(getKeyboardRow('x')).toBe(2);
    expect(getKeyboardRow('m')).toBe(2);
  });

  it('returns unknown for non-letter keys', () => {
    expect(getKeyboardRow(' ')).toBe(-1); // UNKNOWN
    expect(getKeyboardRow('1')).toBe(-1);
  });
});

describe('Row Transitions', () => {
  it('detects row transitions correctly', () => {
    // Top to home
    expect(isRowTransition('q', 'a')).toBe(true);
    // Home to bottom
    expect(isRowTransition('s', 'z')).toBe(true);
    // Top to bottom
    expect(isRowTransition('w', 'x')).toBe(true);
    // Bottom to top
    expect(isRowTransition('c', 'r')).toBe(true);
  });

  it('returns false for same row', () => {
    expect(isRowTransition('q', 'w')).toBe(false); // Both top
    expect(isRowTransition('a', 's')).toBe(false); // Both home
    expect(isRowTransition('z', 'x')).toBe(false); // Both bottom
  });

  it('returns false for unknown keys', () => {
    expect(isRowTransition(' ', 'a')).toBe(false);
    expect(isRowTransition('a', ' ')).toBe(false);
  });
});

describe('Motor Metrics Updates', () => {
  it('tracks left hand errors correctly', () => {
    const profile = createTestProfile();
    const keystrokes: KeystrokeData[] = [
      { key: 'c', timestamp: 100, isCorrect: true, expectedKey: 'c' },
      { key: 'x', timestamp: 200, isCorrect: false, expectedKey: 'a' }, // Left hand error
      { key: 'a', timestamp: 300, isCorrect: true, expectedKey: 'a' },
    ];

    const updatedMotor = updateMotorMetrics(profile, keystrokes, 300, 3);

    expect(updatedMotor.leftHandErrors).toBe(1);
    expect(updatedMotor.rightHandErrors).toBe(0);
  });

  it('tracks right hand errors correctly', () => {
    const profile = createTestProfile();
    const keystrokes: KeystrokeData[] = [
      { key: 'h', timestamp: 100, isCorrect: true, expectedKey: 'h' },
      { key: 'k', timestamp: 200, isCorrect: false, expectedKey: 'i' }, // Right hand error
      { key: 'i', timestamp: 300, isCorrect: true, expectedKey: 'i' },
    ];

    const updatedMotor = updateMotorMetrics(profile, keystrokes, 300, 3);

    expect(updatedMotor.leftHandErrors).toBe(0);
    expect(updatedMotor.rightHandErrors).toBe(1);
  });

  it('tracks common letter errors', () => {
    const profile = createTestProfile();
    const keystrokes: KeystrokeData[] = [
      { key: 'c', timestamp: 100, isCorrect: false, expectedKey: 'a' }, // Error on 'a'
      { key: 'a', timestamp: 200, isCorrect: true, expectedKey: 'a' },
      { key: 'x', timestamp: 300, isCorrect: false, expectedKey: 't' }, // Error on 't'
      { key: 't', timestamp: 400, isCorrect: true, expectedKey: 't' },
    ];

    const updatedMotor = updateMotorMetrics(profile, keystrokes, 400, 4);

    expect(updatedMotor.commonLetterErrors['a']).toBe(1);
    expect(updatedMotor.commonLetterErrors['t']).toBe(1);
  });

  it('calculates row transition speed', () => {
    const profile = createTestProfile();
    const keystrokes: KeystrokeData[] = [
      { key: 'q', timestamp: 100, isCorrect: true, expectedKey: 'q' }, // Top row
      { key: 'a', timestamp: 250, isCorrect: true, expectedKey: 'a' }, // Home row (150ms transition)
      { key: 's', timestamp: 350, isCorrect: true, expectedKey: 's' }, // Home row (no transition)
      { key: 'z', timestamp: 550, isCorrect: true, expectedKey: 'z' }, // Bottom row (200ms transition)
    ];

    const updatedMotor = updateMotorMetrics(profile, keystrokes, 500, 4);

    // Average transition time: (150 + 200) / 2 = 175ms
    expect(updatedMotor.rowTransitionSpeed).toBeCloseTo(175, 0);
  });

  it('updates row transition speed with rolling average', () => {
    const profile = createTestProfile();
    profile.motor.rowTransitionSpeed = 200; // Existing baseline

    const keystrokes: KeystrokeData[] = [
      { key: 'q', timestamp: 100, isCorrect: true, expectedKey: 'q' }, // Top row
      { key: 'a', timestamp: 200, isCorrect: true, expectedKey: 'a' }, // Home row (100ms transition)
    ];

    const updatedMotor = updateMotorMetrics(profile, keystrokes, 200, 2);

    // Rolling average: (200 * 0.9) + (100 * 0.1) = 190
    expect(updatedMotor.rowTransitionSpeed).toBeCloseTo(190, 0);
  });

  it('does not track row transitions for incorrect keystrokes', () => {
    const profile = createTestProfile();
    const keystrokes: KeystrokeData[] = [
      { key: 'q', timestamp: 100, isCorrect: true, expectedKey: 'q' }, // Top row
      { key: 'x', timestamp: 200, isCorrect: false, expectedKey: 'a' }, // Wrong key (should be ignored)
      { key: 'a', timestamp: 300, isCorrect: true, expectedKey: 'a' }, // Home row
    ];

    const updatedMotor = updateMotorMetrics(profile, keystrokes, 300, 3);

    // Should only consider q->a transition (200ms)
    expect(updatedMotor.rowTransitionSpeed).toBeCloseTo(200, 0);
  });

  it('does not update motor metrics when no errors occur', () => {
    const profile = createTestProfile();
    const keystrokes: KeystrokeData[] = [
      { key: 'c', timestamp: 100, isCorrect: true, expectedKey: 'c' },
      { key: 'a', timestamp: 200, isCorrect: true, expectedKey: 'a' },
      { key: 't', timestamp: 300, isCorrect: true, expectedKey: 't' },
    ];

    const updatedMotor = updateMotorMetrics(profile, keystrokes, 300, 3);

    expect(updatedMotor.leftHandErrors).toBe(0);
    expect(updatedMotor.rightHandErrors).toBe(0);
    expect(Object.keys(updatedMotor.commonLetterErrors).length).toBe(0);
  });
});

describe('Typing Speed Baseline', () => {
  it('initializes typing speed baseline on first word', () => {
    const profile = createTestProfile();
    profile.typingSpeedBaseline = 0;
    profile.stats.wordsCompleted = 0;

    const wordTime = 1000; // 1 second
    const letterCount = 5;

    const baseline = updateTypingSpeedBaseline(profile, wordTime, letterCount);

    // 1000ms / 5 letters = 200ms per letter
    expect(baseline).toBe(200);
  });

  it('updates typing speed baseline with rolling average', () => {
    const profile = createTestProfile();
    profile.typingSpeedBaseline = 300; // 300ms per letter baseline
    profile.stats.wordsCompleted = 10;

    const wordTime = 1000; // 1 second
    const letterCount = 10; // 100ms per letter

    const baseline = updateTypingSpeedBaseline(profile, wordTime, letterCount);

    // Rolling average: (300 * 0.9) + (100 * 0.1) = 280
    expect(baseline).toBeCloseTo(280, 0);
  });

  it('handles zero letter count', () => {
    const profile = createTestProfile();
    profile.typingSpeedBaseline = 200;

    const baseline = updateTypingSpeedBaseline(profile, 1000, 0);

    // Should return existing baseline
    expect(baseline).toBe(200);
  });
});

describe('Error Baseline', () => {
  it('initializes error baseline on first word', () => {
    const profile = createTestProfile();
    profile.errorBaseline = 0;
    profile.stats.wordsCompleted = 0;

    const errorCount = 3;
    const baseline = updateErrorBaseline(profile, errorCount);

    expect(baseline).toBe(3);
  });

  it('updates error baseline with rolling average', () => {
    const profile = createTestProfile();
    profile.errorBaseline = 5; // 5 errors per word average
    profile.stats.wordsCompleted = 10;

    const errorCount = 1; // Only 1 error this time

    const baseline = updateErrorBaseline(profile, errorCount);

    // Rolling average: (5 * 0.9) + (1 * 0.1) = 4.6
    expect(baseline).toBeCloseTo(4.6, 1);
  });

  it('handles zero errors', () => {
    const profile = createTestProfile();
    profile.errorBaseline = 2;
    profile.stats.wordsCompleted = 5;

    const baseline = updateErrorBaseline(profile, 0);

    // Rolling average: (2 * 0.9) + (0 * 0.1) = 1.8
    expect(baseline).toBeCloseTo(1.8, 1);
  });
});

describe('Integration Tests', () => {
  it('tracks complete word typing session', () => {
    const profile = createTestProfile();

    // Simulate typing "cat" with some errors
    const keystrokes: KeystrokeData[] = [
      { key: 'c', timestamp: 100, isCorrect: true, expectedKey: 'c' },   // Bottom row
      { key: 'x', timestamp: 200, isCorrect: false, expectedKey: 'a' },  // Wrong key (left hand error)
      { key: 'a', timestamp: 300, isCorrect: true, expectedKey: 'a' },   // Home row
      { key: 't', timestamp: 400, isCorrect: true, expectedKey: 't' },   // Top row
    ];

    const wordTime = 400;
    const letterCount = 3;

    const updatedMotor = updateMotorMetrics(profile, keystrokes, wordTime, letterCount);
    const updatedTypingSpeed = updateTypingSpeedBaseline(profile, wordTime, letterCount);
    const updatedErrorBaseline = updateErrorBaseline(profile, 1);

    // Verify all metrics
    expect(updatedMotor.leftHandErrors).toBe(1);
    expect(updatedMotor.rightHandErrors).toBe(0);
    expect(updatedMotor.commonLetterErrors['a']).toBe(1);
    expect(updatedMotor.rowTransitionSpeed).toBeGreaterThan(0); // Should have transitions
    expect(updatedTypingSpeed).toBeCloseTo(133.33, 1); // 400ms / 3 letters
    expect(updatedErrorBaseline).toBe(1);
  });
});
