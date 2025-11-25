import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

export interface FeedbackState {
  wrongKey: string | null;
  correctKey: string | null;
  correctTileIndex: number | null;
}

/**
 * useFeedback hook
 *
 * Provides methods to trigger gentle, non-verbal feedback animations:
 * - triggerWrongKey: Shows shake animation on incorrect key
 * - triggerCorrectLetter: Animates correct letter tile
 * - triggerWordComplete: Fires confetti burst
 */
export const useFeedback = () => {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    wrongKey: null,
    correctKey: null,
    correctTileIndex: null,
  });

  /**
   * Trigger wrong key feedback
   * - Shakes the incorrect key
   * - Flashes it soft red
   * - Pulses the correct key
   */
  const triggerWrongKey = useCallback((wrongKey: string, correctKey: string) => {
    setFeedbackState({
      wrongKey: wrongKey.toUpperCase(),
      correctKey: correctKey.toUpperCase(),
      correctTileIndex: null,
    });

    // Clear feedback after animation completes
    setTimeout(() => {
      setFeedbackState({
        wrongKey: null,
        correctKey: null,
        correctTileIndex: null,
      });
    }, 500); // 500ms total duration (shake + flash)
  }, []);

  /**
   * Trigger correct letter feedback
   * - Animates the tile with gentle scale-up
   */
  const triggerCorrectLetter = useCallback((tileIndex: number) => {
    setFeedbackState(prev => ({
      ...prev,
      correctTileIndex: tileIndex,
    }));

    // Clear after animation
    setTimeout(() => {
      setFeedbackState(prev => ({
        ...prev,
        correctTileIndex: null,
      }));
    }, 200); // 200ms scale animation
  }, []);

  /**
   * Trigger word completion feedback
   * - Fires confetti burst from top center
   * - Auto-disappears within 600-1000ms
   * - Non-blocking, no modal
   */
  const triggerWordComplete = useCallback(() => {
    // Fire confetti burst
    const duration = 800; // ms
    const animationEnd = Date.now() + duration;

    const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.3 },
        colors: colors,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.3 },
        colors: colors,
        disableForReducedMotion: true,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return {
    feedbackState,
    triggerWrongKey,
    triggerCorrectLetter,
    triggerWordComplete,
  };
};
