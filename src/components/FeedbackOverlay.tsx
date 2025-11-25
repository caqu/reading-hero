import { useEffect, useState } from 'react';
import styles from './FeedbackOverlay.module.css';

interface FeedbackOverlayProps {
  type: 'success' | 'error' | 'none';
  message?: string;
}

export const FeedbackOverlay = ({ type, message }: FeedbackOverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (type !== 'none') {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
    setIsVisible(false);
    return undefined;
  }, [type]);

  if (!isVisible || type === 'none') {
    return null;
  }

  const getIcon = (): string => {
    if (type === 'success') {
      return '✓';
    } else if (type === 'error') {
      return '✗';
    }
    return '';
  };

  return (
    <div
      className={`${styles.overlay} ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          {getIcon()}
        </span>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};
