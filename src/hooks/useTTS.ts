import { useCallback, useRef } from 'react';
import { getLetterSoundUrl, getWordSoundUrl, getTTSConfig } from '../config/ttsConfig';

/**
 * Custom hook for Text-to-Speech functionality
 * Handles audio playback for letters and words
 */
export function useTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const config = getTTSConfig();

  /**
   * Play letter sound
   * Fetches the audio from the API and plays it
   */
  const playLetterSound = useCallback(async (letter: string): Promise<void> => {
    if (!config.enabled || !letter) {
      return;
    }

    try {
      // Normalize to single lowercase letter
      const normalizedLetter = letter.toLowerCase().trim()[0];

      if (!normalizedLetter || !/^[a-z]$/.test(normalizedLetter)) {
        console.warn(`[TTS] Invalid letter: ${letter}`);
        return;
      }

      // Fetch the audio URL from the API
      const apiUrl = getLetterSoundUrl(normalizedLetter);
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error(`[TTS] Failed to fetch letter sound: ${response.statusText}`);
        return;
      }

      const data = await response.json();

      if (!data.url) {
        console.error('[TTS] No URL returned from API');
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Create and play new audio
      audioRef.current = new Audio(data.url);
      audioRef.current.volume = config.volume / 100;

      await audioRef.current.play();

    } catch (error) {
      console.error('[TTS] Error playing letter sound:', error);
    }
  }, [config.enabled, config.volume]);

  /**
   * Play word sound
   * Fetches the audio from the API and plays it
   */
  const playWordSound = useCallback(async (word: string): Promise<void> => {
    if (!config.enabled || !word) {
      return;
    }

    try {
      // Normalize word
      const normalizedWord = word.toLowerCase().trim();

      if (!/^[a-z ]+$/.test(normalizedWord)) {
        console.warn(`[TTS] Invalid word: ${word}`);
        return;
      }

      // Fetch the audio URL from the API
      const apiUrl = getWordSoundUrl(normalizedWord);
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error(`[TTS] Failed to fetch word sound: ${response.statusText}`);
        return;
      }

      const data = await response.json();

      if (!data.url) {
        console.error('[TTS] No URL returned from API');
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Create and play new audio
      audioRef.current = new Audio(data.url);
      audioRef.current.volume = config.volume / 100;

      await audioRef.current.play();

    } catch (error) {
      console.error('[TTS] Error playing word sound:', error);
    }
  }, [config.enabled, config.volume]);

  /**
   * Stop any currently playing audio
   */
  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return {
    playLetterSound,
    playWordSound,
    stopSound,
  };
}
