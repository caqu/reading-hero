import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { resetSettings, ThemeMode } from '../engine/SettingsManager';
import styles from './SettingsPage.module.css';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { settings, updateSettings } = useSettings();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleThemeChange = (theme: ThemeMode) => {
    updateSettings({ theme });
  };

  const handleReset = () => {
    resetSettings();
    setShowResetConfirm(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <button
            onClick={onBack}
            className={styles.backButton}
            aria-label="Back to game"
          >
            Back
          </button>
        </div>

        {/* Theme Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Theme</h2>
          <div className={styles.themeButtons}>
            <button
              className={`${styles.themeButton} ${settings.theme === 'light' ? styles.active : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              ☀️ Light
            </button>
            <button
              className={`${styles.themeButton} ${settings.theme === 'dark' ? styles.active : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              🌙 Dark
            </button>
            <button
              className={`${styles.themeButton} ${settings.theme === 'system' ? styles.active : ''}`}
              onClick={() => handleThemeChange('system')}
            >
              💻 System
            </button>
          </div>
        </section>

        {/* Keyboard Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Keyboard</h2>
          <div className={styles.settingsList}>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.showKeyHighlights}
                onChange={(e) => updateSettings({ showKeyHighlights: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Show key highlights</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.animateWrongKeys}
                onChange={(e) => updateSettings({ animateWrongKeys: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Animate wrong keys (shake)</span>
            </label>
            <label className={styles.settingItem}>
              <span className={styles.label}>Keyboard Layout:</span>
              <select
                value={settings.keyboardLayout}
                onChange={(e) => updateSettings({ keyboardLayout: e.target.value as 'alphabetical' | 'qwerty' })}
                className={styles.select}
              >
                <option value="qwerty">QWERTY</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </label>
          </div>
        </section>

        {/* Word Display Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Word Display</h2>
          <div className={styles.settingsList}>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.showFontVariants}
                onChange={(e) => updateSettings({ showFontVariants: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Show font variants</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.showSyllables}
                onChange={(e) => updateSettings({ showSyllables: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Show syllables</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.showSegments}
                onChange={(e) => updateSettings({ showSegments: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Show segments</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.showCaseAlternation}
                onChange={(e) => updateSettings({ showCaseAlternation: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Show uppercase/lowercase alternation</span>
            </label>
          </div>
        </section>

        {/* Animations Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Animations</h2>
          <div className={styles.settingsList}>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.enableConfetti}
                onChange={(e) => updateSettings({ enableConfetti: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Enable confetti on success</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.enableTileAnimations}
                onChange={(e) => updateSettings({ enableTileAnimations: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Enable tile animations</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.enableTryAgainAnimation}
                onChange={(e) => updateSettings({ enableTryAgainAnimation: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Enable "Try again" animation</span>
            </label>
          </div>
        </section>

        {/* Sounds Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Sounds</h2>
          <div className={styles.settingsList}>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.enableLetterSounds}
                onChange={(e) => updateSettings({ enableLetterSounds: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Letter sounds (Level 1 only)</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.enableKeyboardSounds}
                onChange={(e) => updateSettings({ enableKeyboardSounds: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Keyboard click sounds</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.enableSuccessSound}
                onChange={(e) => updateSettings({ enableSuccessSound: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Success sound</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.enableErrorSound}
                onChange={(e) => updateSettings({ enableErrorSound: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Error sound</span>
            </label>
          </div>
        </section>

        {/* Gameplay Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Gameplay</h2>
          <div className={styles.settingsList}>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.autoAdvanceAfterSuccess}
                onChange={(e) => updateSettings({ autoAdvanceAfterSuccess: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Auto-advance after word success</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.requireEnterToAdvance}
                onChange={(e) => updateSettings({ requireEnterToAdvance: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Require Enter key to advance</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.showNextLetterHint}
                onChange={(e) => updateSettings({ showNextLetterHint: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Show next letter hint</span>
            </label>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.speedChallengeMode}
                onChange={(e) => updateSettings({ speedChallengeMode: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Speed challenge mode</span>
            </label>
          </div>
        </section>

        {/* Advanced Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Advanced</h2>
          <div className={styles.settingsList}>
            <label className={styles.settingItem}>
              <input
                type="checkbox"
                checked={settings.allowProfileSpecificSettings}
                onChange={(e) => updateSettings({ allowProfileSpecificSettings: e.target.checked })}
                className={styles.checkbox}
              />
              <span>Allow profile-specific settings</span>
            </label>
          </div>
        </section>

        {/* Reset Section */}
        <section className={styles.resetSection}>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className={styles.resetButton}
            >
              Reset to Defaults
            </button>
          ) : (
            <div className={styles.confirmReset}>
              <p>Are you sure you want to reset all settings?</p>
              <div className={styles.confirmButtons}>
                <button onClick={handleReset} className={styles.confirmButton}>
                  Yes, Reset
                </button>
                <button onClick={() => setShowResetConfirm(false)} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
