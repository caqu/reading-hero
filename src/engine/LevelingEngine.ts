/**
 * LevelingEngine.ts
 *
 * Implements a 5-level adaptive difficulty system for Reading Hero.
 * Tracks user performance and automatically promotes/demotes based on mastery criteria.
 *
 * Levels:
 * 1. Concept Level - Basic learning with full guidance
 * 2. Print Variability - Multiple font variants
 * 3. Orthographic Complexity - Syllables and spacing
 * 4. Motor Independence - No highlights, blank tiles
 * 5. Full Generalization - Hidden emoji, full challenge
 */

import { useState, useCallback, useEffect } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Current level in the adaptive difficulty system (1-5)
 */
export type Level = 1 | 2 | 3 | 4 | 5;

/**
 * Result data recorded after each word completion
 */
export interface WordResult {
  /** Unique identifier for the word */
  wordId: string;
  /** Whether the word was completed correctly (all letters correct eventually) */
  correct: boolean;
  /** Number of incorrect key presses during this word */
  wrongKeyPresses: number;
  /** Whether all letters were typed correctly on first try */
  firstTryCorrect: boolean;
  /** Time taken to complete the word in milliseconds */
  timeToComplete: number;
  /** Length of the word (number of letters) */
  wordLength: number;
}

/**
 * Feature flags that control gameplay based on current level
 */
export interface LevelFeatures {
  /** Show highlighted next key on keyboard (Level 1-3) */
  showKeyHighlights: boolean;
  /** Show multiple font variants of the word (Level 2+) */
  showWordVariants: boolean;
  /** Show syllabified versions of the word (Level 3+) */
  showSyllables: boolean;
  /** Show tiles as blank until correct key pressed (Level 4-5) */
  allowBlankTiles: boolean;
  /** Hide emoji after brief delay (Level 5) */
  hideEmojiAfterDelay: boolean;
}

/**
 * Performance metrics calculated from word results
 */
export interface PerformanceMetrics {
  /** Accuracy Stability Index: (first_try_correct / total_words) × 100 */
  accuracyStabilityIndex: number;
  /** Motor Fluency Score: 1 - (wrong_presses / total_presses) */
  motorFluencyScore: number;
  /** Average error density: wrong_presses / word_length */
  averageErrorDensity: number;
  /** Consistency Score: first_try_correct_words / total_words */
  consistencyScore: number;
  /** Average accuracy percentage */
  averageAccuracy: number;
  /** Average wrong key presses per word */
  averageWrongKeyPresses: number;
  /** Number of words in the evaluation window */
  wordCount: number;
}

/**
 * Persistent state stored in localStorage
 */
interface LevelingState {
  currentLevel: Level;
  wordHistory: WordResult[];
  levelStartWordCount: number; // Words completed at start of current level
  uniqueWordsCompleted: Set<string>; // Track unique words for Level 2 criteria
}

// ============================================================================
// LEVEL CONFIGURATIONS
// ============================================================================

/**
 * Configuration for each level's promotion criteria
 */
interface LevelConfig {
  /** Minimum accuracy percentage required */
  minAccuracy: number;
  /** Maximum average wrong key presses per word */
  maxWrongKeyPresses: number;
  /** Minimum consistency score (first-try correctness) */
  minConsistencyScore?: number;
  /** Number of recent words to evaluate for promotion */
  evaluationWindow: number;
  /** Minimum words at current level before promotion allowed */
  minWordsBeforePromotion: number;
  /** Additional custom criteria checker */
  customCriteria?: (metrics: PerformanceMetrics, history: WordResult[]) => boolean;
}

const LEVEL_CONFIGS: Record<Level, LevelConfig> = {
  1: {
    minAccuracy: 95,
    maxWrongKeyPresses: 2,
    evaluationWindow: 20,
    minWordsBeforePromotion: 10,
    customCriteria: (metrics, history) => {
      // Check retry rate: ≤ 1 retry per 10 words
      const recentWords = history.slice(-10);
      const retriedWords = recentWords.filter(w => !w.firstTryCorrect).length;
      return retriedWords <= 1;
    }
  },
  2: {
    minAccuracy: 90,
    maxWrongKeyPresses: 1.5,
    evaluationWindow: 30,
    minWordsBeforePromotion: 10,
    customCriteria: (metrics, history) => {
      // Must complete ≥ 50 unique words
      const uniqueWords = new Set(history.map(w => w.wordId));
      return uniqueWords.size >= 50;
    }
  },
  3: {
    minAccuracy: 90,
    maxWrongKeyPresses: 1,
    minConsistencyScore: 85,
    evaluationWindow: 40,
    minWordsBeforePromotion: 10,
  },
  4: {
    minAccuracy: 85,
    maxWrongKeyPresses: 1,
    minConsistencyScore: 85,
    evaluationWindow: 30,
    minWordsBeforePromotion: 10,
  },
  5: {
    minAccuracy: 80,
    maxWrongKeyPresses: 1.5,
    evaluationWindow: 15,
    minWordsBeforePromotion: 0, // Already at max level
  }
};

// ============================================================================
// METRICS CALCULATION
// ============================================================================

/**
 * Calculate performance metrics from a window of word results
 */
function calculateMetrics(results: WordResult[]): PerformanceMetrics {
  if (results.length === 0) {
    return {
      accuracyStabilityIndex: 0,
      motorFluencyScore: 0,
      averageErrorDensity: 0,
      consistencyScore: 0,
      averageAccuracy: 0,
      averageWrongKeyPresses: 0,
      wordCount: 0,
    };
  }

  const firstTryCorrectCount = results.filter(r => r.firstTryCorrect).length;
  const totalWords = results.length;

  // ASI = (first_try_correct / total_words) × 100
  const accuracyStabilityIndex = (firstTryCorrectCount / totalWords) * 100;

  // Consistency Score = first_try_correct_words / total_words
  const consistencyScore = (firstTryCorrectCount / totalWords) * 100;

  // Calculate total key presses and wrong key presses
  let totalWrongKeyPresses = 0;
  let totalKeyPresses = 0;
  let totalErrorDensity = 0;

  results.forEach(result => {
    totalWrongKeyPresses += result.wrongKeyPresses;
    // Total key presses = correct keys + wrong keys
    totalKeyPresses += result.wordLength + result.wrongKeyPresses;
    // Error density per word
    totalErrorDensity += result.wrongKeyPresses / result.wordLength;
  });

  // MFS = 1 - (wrong_key_presses / total_key_presses)
  const motorFluencyScore = totalKeyPresses > 0
    ? (1 - (totalWrongKeyPresses / totalKeyPresses)) * 100
    : 0;

  // Average error density across all words
  const averageErrorDensity = totalErrorDensity / totalWords;

  // Average accuracy: words completed correctly / total words
  const correctWords = results.filter(r => r.correct).length;
  const averageAccuracy = (correctWords / totalWords) * 100;

  // Average wrong key presses per word
  const averageWrongKeyPresses = totalWrongKeyPresses / totalWords;

  return {
    accuracyStabilityIndex,
    motorFluencyScore,
    averageErrorDensity,
    consistencyScore,
    averageAccuracy,
    averageWrongKeyPresses,
    wordCount: totalWords,
  };
}

/**
 * Check if criteria are met for promotion to next level
 */
function shouldPromote(
  currentLevel: Level,
  metrics: PerformanceMetrics,
  history: WordResult[],
  wordsAtCurrentLevel: number
): boolean {
  if (currentLevel === 5) return false; // Already at max level

  const config = LEVEL_CONFIGS[currentLevel];

  // Check minimum words requirement
  if (wordsAtCurrentLevel < config.minWordsBeforePromotion) {
    return false;
  }

  // Check basic criteria
  const meetsAccuracy = metrics.averageAccuracy >= config.minAccuracy;
  const meetsWrongKeyPresses = metrics.averageWrongKeyPresses <= config.maxWrongKeyPresses;
  const meetsConsistency = config.minConsistencyScore
    ? metrics.consistencyScore >= config.minConsistencyScore
    : true;

  // Check custom criteria if defined
  const meetsCustom = config.customCriteria
    ? config.customCriteria(metrics, history)
    : true;

  return meetsAccuracy && meetsWrongKeyPresses && meetsConsistency && meetsCustom;
}

/**
 * Check if performance has dropped enough to warrant demotion
 */
function shouldDemote(
  currentLevel: Level,
  metrics: PerformanceMetrics,
  history: WordResult[]
): boolean {
  if (currentLevel === 1) return false; // Already at minimum level

  // Demotion thresholds (stricter than promotion)
  const demotionThresholds: Record<Level, { accuracy: number; errorDensity: number }> = {
    1: { accuracy: 0, errorDensity: Infinity }, // Can't demote from L1
    2: { accuracy: 85, errorDensity: 0.4 }, // Drop below L1 requirements
    3: { accuracy: 80, errorDensity: 0.35 },
    4: { accuracy: 75, errorDensity: 0.3 },
    5: { accuracy: 70, errorDensity: 0.25 },
  };

  const threshold = demotionThresholds[currentLevel];

  // Check for catastrophic failures (≥3 failed attempts on a single word)
  const recentWords = history.slice(-15);
  const hasCatastrophicFailure = recentWords.some(w => w.wrongKeyPresses >= 3 * w.wordLength);

  // Check if accuracy dropped below threshold
  const accuracyTooLow = metrics.averageAccuracy < threshold.accuracy;
  const errorDensityTooHigh = metrics.averageErrorDensity > threshold.errorDensity;

  return hasCatastrophicFailure || accuracyTooLow || errorDensityTooHigh;
}

/**
 * Get feature flags for a given level
 */
function getFeaturesForLevel(level: Level): LevelFeatures {
  return {
    showKeyHighlights: level <= 3, // Levels 1-3 show highlights
    showWordVariants: level >= 2, // Levels 2+ show variants
    showSyllables: level >= 3, // Levels 3+ show syllables
    allowBlankTiles: level >= 4, // Levels 4-5 use blank tiles
    hideEmojiAfterDelay: level === 5, // Only Level 5 hides emoji
  };
}

// ============================================================================
// LOCALSTORAGE PERSISTENCE
// ============================================================================

const STORAGE_KEY = 'reading-hero-leveling-state';

/**
 * Load leveling state from localStorage
 */
function loadState(): LevelingState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createInitialState();
    }

    const parsed = JSON.parse(stored);

    // Convert uniqueWordsCompleted array back to Set
    return {
      currentLevel: parsed.currentLevel || 1,
      wordHistory: parsed.wordHistory || [],
      levelStartWordCount: parsed.levelStartWordCount || 0,
      uniqueWordsCompleted: new Set(parsed.uniqueWordsCompleted || []),
    };
  } catch (error) {
    console.error('Failed to load leveling state:', error);
    return createInitialState();
  }
}

/**
 * Save leveling state to localStorage
 */
function saveState(state: LevelingState): void {
  try {
    // Convert Set to array for JSON serialization
    const toStore = {
      ...state,
      uniqueWordsCompleted: Array.from(state.uniqueWordsCompleted),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error('Failed to save leveling state:', error);
  }
}

/**
 * Create initial state
 */
function createInitialState(): LevelingState {
  return {
    currentLevel: 1,
    wordHistory: [],
    levelStartWordCount: 0,
    uniqueWordsCompleted: new Set(),
  };
}

// ============================================================================
// HOOK: useLevelingEngine
// ============================================================================

export interface LevelingEngineAPI {
  /** Current level (1-5) */
  level: Level;
  /** Active feature flags for current level */
  features: LevelFeatures;
  /** Current performance metrics */
  metrics: PerformanceMetrics;
  /** Record the result of a completed word */
  recordResult: (result: WordResult) => void;
  /** Get current level */
  getCurrentLevel: () => Level;
  /** Get active features for current level */
  getActiveFeatures: () => LevelFeatures;
  /** Get current performance metrics */
  getMetrics: () => PerformanceMetrics;
  /** Reset all progress (for testing/debugging) */
  resetProgress: () => void;
  /** Manually set level (for testing/debugging) */
  setLevel: (level: Level) => void;
  /** Load state from a profile */
  loadStateFromProfile: (profileState: LevelingState) => void;
  /** Get current state to save to profile */
  getStateForProfile: () => LevelingState;
}

/**
 * Hook for managing adaptive difficulty leveling
 *
 * @param profileId - Optional profile ID to load/save state for. If not provided, uses global localStorage.
 * @param onStateChange - Optional callback when state changes (for profile updates)
 * @returns API for recording results and accessing level state
 *
 * @example
 * ```tsx
 * const leveling = useLevelingEngine(profileId, handleLevelingStateChange);
 *
 * // After word completion
 * leveling.recordResult({
 *   wordId: 'cat',
 *   correct: true,
 *   wrongKeyPresses: 1,
 *   firstTryCorrect: false,
 *   timeToComplete: 3500,
 *   wordLength: 3,
 * });
 *
 * // Use features to adapt UI
 * if (leveling.features.showKeyHighlights) {
 *   // Show keyboard highlights
 * }
 * ```
 */
export function useLevelingEngine(
  profileId?: string | null,
  onStateChange?: (state: LevelingState) => void
): LevelingEngineAPI {
  const [state, setState] = useState<LevelingState>(loadState);

  // Persist state changes to localStorage (only if no profile)
  useEffect(() => {
    if (!profileId) {
      saveState(state);
    }

    // Notify parent of state changes (for profile updates)
    if (onStateChange) {
      onStateChange(state);
    }
  }, [state, profileId, onStateChange]);

  // Calculate current metrics
  const metrics = calculateMetrics(
    state.wordHistory.slice(-LEVEL_CONFIGS[state.currentLevel].evaluationWindow)
  );

  // Get current features
  const features = getFeaturesForLevel(state.currentLevel);

  /**
   * Record a word result and evaluate for level changes
   */
  const recordResult = useCallback((result: WordResult) => {
    setState(prevState => {
      const newHistory = [...prevState.wordHistory, result];
      const newUniqueWords = new Set(prevState.uniqueWordsCompleted).add(result.wordId);

      // Calculate words completed at current level
      const wordsAtCurrentLevel = newHistory.length - prevState.levelStartWordCount;

      // Get evaluation window for current level
      const config = LEVEL_CONFIGS[prevState.currentLevel];
      const recentResults = newHistory.slice(-config.evaluationWindow);

      // Calculate metrics for evaluation
      const currentMetrics = calculateMetrics(recentResults);

      let newLevel = prevState.currentLevel;
      let newLevelStartWordCount = prevState.levelStartWordCount;

      // Check for promotion
      if (shouldPromote(prevState.currentLevel, currentMetrics, recentResults, wordsAtCurrentLevel)) {
        newLevel = Math.min(5, prevState.currentLevel + 1) as Level;
        newLevelStartWordCount = newHistory.length;
        console.log(`🎉 Level Up! ${prevState.currentLevel} → ${newLevel}`);
      }
      // Check for demotion (only if not just promoted)
      else if (shouldDemote(prevState.currentLevel, currentMetrics, recentResults)) {
        newLevel = Math.max(1, prevState.currentLevel - 1) as Level;
        newLevelStartWordCount = newHistory.length;
        console.log(`⬇️ Level Down: ${prevState.currentLevel} → ${newLevel}`);
      }

      // Keep only last 200 words in history to prevent unbounded growth
      const trimmedHistory = newHistory.slice(-200);

      return {
        currentLevel: newLevel,
        wordHistory: trimmedHistory,
        levelStartWordCount: newLevelStartWordCount,
        uniqueWordsCompleted: newUniqueWords,
      };
    });
  }, []);

  /**
   * Get current level
   */
  const getCurrentLevel = useCallback(() => state.currentLevel, [state.currentLevel]);

  /**
   * Get active features
   */
  const getActiveFeatures = useCallback(() => features, [features]);

  /**
   * Get current metrics
   */
  const getMetrics = useCallback(() => metrics, [metrics]);

  /**
   * Reset all progress (for testing/debugging)
   */
  const resetProgress = useCallback(() => {
    const initialState = createInitialState();
    setState(initialState);
    saveState(initialState);
  }, []);

  /**
   * Manually set level (for testing/debugging)
   */
  const setLevel = useCallback((newLevel: Level) => {
    setState(prevState => {
      const newState = {
        ...prevState,
        currentLevel: newLevel,
        levelStartWordCount: prevState.wordHistory.length,
      };
      if (!profileId) {
        saveState(newState);
      }
      return newState;
    });
  }, [profileId]);

  /**
   * Load state from a profile
   */
  const loadStateFromProfile = useCallback((profileState: LevelingState) => {
    setState({
      currentLevel: profileState.currentLevel,
      wordHistory: profileState.wordHistory,
      levelStartWordCount: profileState.levelStartWordCount,
      uniqueWordsCompleted: new Set(profileState.uniqueWordsCompleted),
    });
  }, []);

  /**
   * Get current state to save to profile
   */
  const getStateForProfile = useCallback((): LevelingState => {
    return {
      currentLevel: state.currentLevel,
      wordHistory: state.wordHistory,
      levelStartWordCount: state.levelStartWordCount,
      uniqueWordsCompleted: state.uniqueWordsCompleted,
    };
  }, [state]);

  return {
    level: state.currentLevel,
    features,
    metrics,
    recordResult,
    getCurrentLevel,
    getActiveFeatures,
    getMetrics,
    resetProgress,
    setLevel,
    loadStateFromProfile,
    getStateForProfile,
  };
}
