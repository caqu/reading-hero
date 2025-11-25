import { useEffect, useState } from 'react';
import styles from './FeedbackOverlay.module.css';

interface FeedbackOverlayProps {
  type: 'success' | 'error' | 'celebration' | 'none';
  message?: string;
  duration?: number;
}

export const FeedbackOverlay = ({
  type,
  message,
  duration = 1500
}: FeedbackOverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Sound effects placeholders (can be implemented with actual audio later)
  const playSound = (soundType: string) => {
    // Future implementation for sound effects
    console.log(`Playing ${soundType} sound`);
  };

  useEffect(() => {
    if (type !== 'none') {
      setIsVisible(true);

      // Play appropriate sound
      switch (type) {
        case 'success':
          playSound('success');
          break;
        case 'error':
          playSound('error');
          break;
        case 'celebration':
          playSound('celebration');
          break;
      }

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
    setIsVisible(false);
    return undefined;
  }, [type, duration]);

  if (!isVisible || type === 'none') {
    return null;
  }

  const getIcon = (): string => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'celebration': return '🎉';
      default: return '';
    }
  };

  return (
    <div
      className={`${styles.overlay} ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className={`${styles.content} ${styles[`${type}Animation`]}`}>
        <span className={styles.icon} aria-hidden="true">
          {getIcon()}
        </span>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};