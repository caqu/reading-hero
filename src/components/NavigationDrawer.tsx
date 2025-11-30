/**
 * Navigation Drawer
 *
 * Slide-in drawer that contains all navigation items.
 * Works on all devices and screen sizes.
 */

import { useEffect } from 'react';
import { useDrawer } from '../contexts/DrawerContext';
import { Profile } from '../types';
import { Level } from '../engine/LevelingEngine';
import styles from './NavigationDrawer.module.css';

interface NavigationDrawerProps {
  /** Current word index for progress display */
  currentWordIndex: number;
  /** Total number of words */
  totalWords: number;
  /** Correct words count */
  correctWords: number;
  /** Accuracy percentage */
  accuracy: number;
  /** Current level for display */
  currentLevel?: number;
  /** Callback to manually change level */
  onLevelChange?: (level: Level) => void;
  /** Navigation callbacks */
  onViewStats?: () => void;
  onViewSettings?: () => void;
  onCreateYourOwn?: () => void;
  onManageWords?: () => void;
  onRecordSigns?: () => void;
  onProfileSwitch?: (profile: Profile) => void;
  onAddProfile?: () => void;
}

export const NavigationDrawer = ({
  currentWordIndex,
  totalWords,
  correctWords,
  accuracy,
  currentLevel = 1,
  onLevelChange,
  onViewStats,
  onViewSettings,
  onCreateYourOwn,
  onManageWords,
  onRecordSigns,
  onProfileSwitch,
  onAddProfile,
}: NavigationDrawerProps) => {
  const { isDrawerOpen, closeDrawer } = useDrawer();

  // Close drawer on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen, closeDrawer]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleNavItemClick = (callback?: () => void) => {
    closeDrawer();
    callback?.();
  };

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav className={styles.drawer} aria-label="Main navigation">
        <div className={styles.drawerContent}>
          {/* Level Control - Horizontal */}
          {onLevelChange && (
            <div className={styles.levelControl}>
              <label htmlFor="level-slider" className={styles.levelLabel}>
                Level {currentLevel}
              </label>
              <input
                id="level-slider"
                type="range"
                min="1"
                max="5"
                value={currentLevel}
                onChange={(e) => onLevelChange(parseInt(e.target.value) as Level)}
                className={styles.levelSlider}
                aria-label="Adjust difficulty level"
              />
            </div>
          )}

          {/* Progress Info */}
          <div className={styles.progressSection}>
            <div className={styles.stat}>
              <div className={styles.statValue}>{currentWordIndex + 1}</div>
              <div className={styles.statLabel}>of {totalWords}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{correctWords}</div>
              <div className={styles.statLabel}>correct</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{accuracy}%</div>
              <div className={styles.statLabel}>accuracy</div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className={styles.navItems}>
            {onViewStats && (
              <button
                className={styles.navButton}
                onClick={() => handleNavItemClick(onViewStats)}
              >
                📊 Stats
              </button>
            )}

            {onViewSettings && (
              <button
                className={styles.navButton}
                onClick={() => handleNavItemClick(onViewSettings)}
              >
                ⚙️ Settings
              </button>
            )}

            {onCreateYourOwn && (
              <button
                className={styles.navButton}
                onClick={() => handleNavItemClick(onCreateYourOwn)}
              >
                ✏️ Create Your Own
              </button>
            )}

            {onManageWords && (
              <button
                className={styles.navButton}
                onClick={() => handleNavItemClick(onManageWords)}
              >
                📝 Manage My Words
              </button>
            )}

            {onRecordSigns && (
              <button
                className={styles.navButton}
                onClick={() => handleNavItemClick(onRecordSigns)}
              >
                🎥 Record Signs
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};
