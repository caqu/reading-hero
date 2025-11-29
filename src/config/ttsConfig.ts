/**
 * Text-to-Speech Configuration
 * Controls TTS behavior for letter and word pronunciation
 */

import { getApiBaseUrl, areBackendAPIsAvailable } from './apiConfig';

/**
 * Delay in milliseconds after the last letter sound before playing the full word
 */
export const WORD_COMPLETION_DELAY_MS = 400;

export interface TTSConfig {
  /** API endpoint base URL */
  apiBaseUrl: string;

  /** Voice speaking rate (0-10, default 0 is normal speed) */
  speakingRate: number;

  /** Voice volume (0-100) */
  volume: number;

  /** Audio output format */
  audioFormat: 'wav' | 'mp3';

  /** Cache directory for audio files */
  cacheDirectory: string;

  /** Enable audio playback */
  enabled: boolean;

  /** Preload all letter sounds on app start */
  preloadLetterSounds: boolean;
}

export const DEFAULT_TTS_CONFIG: TTSConfig = {
  apiBaseUrl: `${getApiBaseUrl()}/api/tts`,
  speakingRate: 0,
  volume: 100,
  audioFormat: 'wav',
  cacheDirectory: '/audio/letters',
  // Disable TTS if backend APIs are not available (e.g., on Vercel without backend)
  enabled: areBackendAPIsAvailable(),
  preloadLetterSounds: false,
};

/**
 * Get the current TTS configuration
 * Can be extended to read from localStorage or user settings
 */
export function getTTSConfig(): TTSConfig {
  return { ...DEFAULT_TTS_CONFIG };
}

/**
 * Build the URL for fetching a letter sound
 */
export function getLetterSoundUrl(letter: string): string {
  const config = getTTSConfig();
  return `${config.apiBaseUrl}/letter?char=${encodeURIComponent(letter.toLowerCase())}`;
}

/**
 * Build the URL for fetching a word sound (future feature)
 */
export function getWordSoundUrl(word: string): string {
  const config = getTTSConfig();
  return `${config.apiBaseUrl}/word?text=${encodeURIComponent(word.toLowerCase())}`;
}
