/**
 * SettingsManager.ts
 *
 * Manages application settings stored in localStorage.
 * Settings are device-level (not tied to profiles).
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Settings {
  // Theme
  theme: ThemeMode;

  // Keyboard Settings
  showKeyHighlights: boolean;
  animateWrongKeys: boolean;
  keyboardLayout: 'simplified' | 'qwerty';

  // Variant Display Settings
  showFontVariants: boolean;
  showSyllables: boolean;
  showSegments: boolean;
  showCaseAlternation: boolean;

  // Animation Settings
  enableConfetti: boolean;
  enableTileAnimations: boolean;
  enableTryAgainAnimation: boolean;

  // Sound Settings
  enableKeyboardSounds: boolean;
  enableSuccessSound: boolean;
  enableErrorSound: boolean;

  // Gameplay Settings
  autoAdvanceAfterSuccess: boolean;
  requireEnterToAdvance: boolean;
  showNextLetterHint: boolean;
  speedChallengeMode: boolean;

  // Advanced
  allowProfileSpecificSettings: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  // Theme
  theme: 'system',

  // Keyboard Settings
  showKeyHighlights: true,
  animateWrongKeys: true,
  keyboardLayout: 'qwerty',

  // Variant Display Settings (all true by default, level-based)
  showFontVariants: true,
  showSyllables: true,
  showSegments: true,
  showCaseAlternation: true,

  // Animation Settings
  enableConfetti: true,
  enableTileAnimations: true,
  enableTryAgainAnimation: true,

  // Sound Settings (all off by default)
  enableKeyboardSounds: false,
  enableSuccessSound: false,
  enableErrorSound: false,

  // Gameplay Settings
  autoAdvanceAfterSuccess: true,
  requireEnterToAdvance: false,
  showNextLetterHint: false,
  speedChallengeMode: false,

  // Advanced
  allowProfileSpecificSettings: false,
};

const STORAGE_KEY = 'settings';

type SettingsListener = (settings: Settings) => void;

let cachedSettings: Settings | null = null;
const listeners: Set<SettingsListener> = new Set();

/**
 * Load settings from localStorage
 */
function loadSettings(): Settings {
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle missing properties
      const settings = { ...DEFAULT_SETTINGS, ...parsed };
      cachedSettings = settings;
      return settings;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  const settings = { ...DEFAULT_SETTINGS };
  cachedSettings = settings;
  return settings;
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    cachedSettings = settings;
    notifyListeners(settings);
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Notify all listeners of settings changes
 */
function notifyListeners(settings: Settings): void {
  listeners.forEach(listener => listener(settings));
}

/**
 * Get current settings
 */
export function getSettings(): Settings {
  return loadSettings();
}

/**
 * Update settings with partial updates
 */
export function updateSettings(partial: Partial<Settings>): Settings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  saveSettings(updated);
  return updated;
}

/**
 * Subscribe to settings changes
 */
export function subscribe(listener: SettingsListener): () => void {
  listeners.add(listener);

  // Return unsubscribe function
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Reset settings to defaults
 */
export function resetSettings(): Settings {
  const defaults = { ...DEFAULT_SETTINGS };
  saveSettings(defaults);
  return defaults;
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;

  if (theme === 'system') {
    // Remove explicit classes and let system preference take over
    root.classList.remove('light', 'dark');
  } else if (theme === 'dark') {
    root.classList.remove('light');
    root.classList.add('dark');
  } else {
    // Light mode
    root.classList.remove('dark');
    root.classList.add('light');
  }
}

/**
 * Initialize settings on app startup
 */
export function initializeSettings(): void {
  const settings = getSettings();
  applyTheme(settings.theme);

  // Listen for system theme changes when using 'system' mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const currentSettings = getSettings();
    if (currentSettings.theme === 'system') {
      applyTheme('system');
    }
  });
}
