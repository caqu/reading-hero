import { useState, useEffect } from 'react';
import { Word, Profile } from '../types';
import { WordCard } from './WordCard';
import { LetterTiles } from './LetterTiles';
import { OnScreenKeyboard } from './OnScreenKeyboard';
import { HamburgerButton } from './HamburgerButton';
import { NavigationDrawer } from './NavigationDrawer';
import { LevelFeatures, Level } from '../engine/LevelingEngine';
import { useSettings } from '../hooks/useSettings';
import styles from './GameScreen.module.css';

interface GameScreenProps {
  words: Word[];
  currentWordIndex: number;
  currentLetterIndex: number;
  revealedLetters: boolean[];
  attempts: number;
  correctAttempts: number;
  correctWords: number;
  showWordText?: boolean;
  onKeyPress?: (key: string) => void;
  onComplete?: () => void;
  highlightKey?: string;
  keyboardDisabled?: boolean;
  wrongKey?: string | null;
  correctKey?: string | null;
  correctTileIndex?: number | null;
  /** Whether the word is currently celebrating (for emoji bobblehead animation) */
  isCelebrating?: boolean;
  /** Level features that control gameplay behavior */
  levelFeatures?: LevelFeatures;
  /** Current level (1-5) for display */
  currentLevel?: number;
  /** Callback to manually change level */
  onLevelChange?: (level: Level) => void;
  /** Callback to navigate to stats page */
  onViewStats?: () => void;
  /** Callback to navigate to settings page */
  onViewSettings?: () => void;
  /** Callback to navigate to create your own page */
  onCreateYourOwn?: () => void;
  /** Callback to navigate to manage words page */
  onManageWords?: () => void;
  /** Callback when profile is switched */
  onProfileSwitch?: (profile: Profile) => void;
  /** Callback to navigate to add profile screen */
  onAddProfile?: () => void;
  /** Callback when a UGC word is removed */
  onRemoveWord?: (wordId: string) => void;
}

export const GameScreen = ({
  words,
  currentWordIndex,
  currentLetterIndex,
  revealedLetters,
  attempts,
  correctAttempts,
  correctWords,
  showWordText = false,
  onKeyPress,
  highlightKey,
  keyboardDisabled = false,
  wrongKey = null,
  correctKey = null,
  correctTileIndex = null,
  isCelebrating = false,
  levelFeatures,
  currentLevel = 1,
  onLevelChange,
  onViewStats,
  onViewSettings,
  onCreateYourOwn,
  onManageWords,
  onProfileSwitch,
  onAddProfile,
  onRemoveWord,
}: GameScreenProps) => {
  const currentWord = words[currentWordIndex];
  const [showInstruction, setShowInstruction] = useState(true);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const { settings } = useSettings();

  // Compute effective keyboard layout based on setting and level
  const effectiveLayout = (() => {
    if (settings.keyboardLayout === 'default') {
      // Default progression: alphabetical on Level 1, QWERTY on Level 2+
      return currentLevel === 1 ? 'alphabetical' : 'qwerty';
    }
    // Use explicit setting (always alphabetical or always qwerty)
    return settings.keyboardLayout;
  })();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // If no current word, don't render anything (game is complete)
  if (!currentWord) {
    return null;
  }

  // Calculate accuracy as percentage of correct key presses out of total attempts
  const accuracy = attempts > 0 ? Math.round((correctAttempts * 100) / attempts) : 0;

  // Check if current word is a UGC word
  const isUGCWord = currentWord?.source === 'user';

  // Handle remove button click
  const handleRemoveClick = () => {
    setShowRemoveConfirmation(true);
  };

  // Handle confirmed removal
  const handleConfirmRemove = () => {
    if (currentWord && onRemoveWord) {
      onRemoveWord(currentWord.id);
    }
    setShowRemoveConfirmation(false);
  };

  // Handle cancel removal
  const handleCancelRemove = () => {
    setShowRemoveConfirmation(false);
  };

  return (
    <div className={styles.container}>
      {/* Hamburger Button */}
      <HamburgerButton />

      {/* Stats Display - Top Right */}
      <div className={styles.statsDisplay}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{currentWordIndex + 1}</div>
          <div className={styles.statLabel}>of {words.length}</div>
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

      {/* Level Control - Bottom Left */}
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

      {/* Navigation Drawer */}
      <NavigationDrawer
        currentWordIndex={currentWordIndex}
        totalWords={words.length}
        correctWords={correctWords}
        accuracy={accuracy}
        onViewStats={onViewStats}
        onViewSettings={onViewSettings}
        onCreateYourOwn={onCreateYourOwn}
        onManageWords={onManageWords}
        onRecordSigns={import.meta.env.DEV ? () => window.location.href = '/record-signs' : undefined}
        onProfileSwitch={onProfileSwitch}
        onAddProfile={onAddProfile}
      />

      {showInstruction && (
        <div className={styles.floatingInstruction}>
          Type the letters to spell the word
        </div>
      )}

      <main className={styles.main}>
        {/* UGC Word Remove Button - Top Right Corner */}
        {isUGCWord && onRemoveWord && (
          <button
            className={styles.removeButton}
            onClick={handleRemoveClick}
            aria-label="Remove this word from rotation"
            title="Remove this word"
          >
            🗑️
          </button>
        )}

        <WordCard
          word={currentWord}
          showWord={showWordText}
          showVariants={settings.showFontVariants && (levelFeatures?.showWordVariants ?? true)}
          showSyllables={settings.showSyllables && (levelFeatures?.showSyllables ?? true)}
          hideEmojiAfterDelay={levelFeatures?.hideEmojiAfterDelay}
          isCelebrating={isCelebrating}
        />
        <LetterTiles
          word={currentWord.text}
          currentIndex={currentLetterIndex}
          revealedLetters={revealedLetters}
          correctTileIndex={correctTileIndex}
          useBlankTiles={levelFeatures?.allowBlankTiles}
          enableAnimations={settings.enableTileAnimations}
        />
        {onKeyPress && (
          <OnScreenKeyboard
            onKeyPress={onKeyPress}
            highlightKey={highlightKey}
            disabled={keyboardDisabled}
            wrongKey={wrongKey}
            correctKey={correctKey}
            showHighlights={settings.showKeyHighlights && (levelFeatures?.showKeyHighlights ?? true)}
            animateWrongKeys={settings.animateWrongKeys}
            layout={effectiveLayout}
          />
        )}

        {/* Removal Confirmation Dialog */}
        {showRemoveConfirmation && (
          <div className={styles.confirmationOverlay}>
            <div className={styles.confirmationDialog}>
              <h3>Remove this word?</h3>
              <p>This will hide "{currentWord.text}" from rotation.</p>
              <p className={styles.confirmationNote}>The word will remain saved and can be managed later.</p>
              <div className={styles.confirmationButtons}>
                <button
                  className={styles.confirmButton}
                  onClick={handleConfirmRemove}
                >
                  Remove
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelRemove}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
