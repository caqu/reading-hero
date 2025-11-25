import { useLevelingEngine } from '../engine/LevelingEngine';
import styles from './StatsPage.module.css';

interface StatsPageProps {
  onBack: () => void;
}

export const StatsPage = ({ onBack }: StatsPageProps) => {
  const leveling = useLevelingEngine();
  const metrics = leveling.getMetrics();

  // Load additional stats from localStorage
  const loadStats = () => {
    try {
      const stored = localStorage.getItem('reading-hero-leveling-state');
      if (!stored) {
        return { totalWords: 0, uniqueWords: 0 };
      }
      const parsed = JSON.parse(stored);
      return {
        totalWords: parsed.wordHistory?.length || 0,
        uniqueWords: parsed.uniqueWordsCompleted?.length || 0,
      };
    } catch (error) {
      console.error('Failed to load stats:', error);
      return { totalWords: 0, uniqueWords: 0 };
    }
  };

  const stats = loadStats();

  const handleReset = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all progress? This cannot be undone!'
    );
    if (confirmed) {
      leveling.resetProgress();
      // Refresh the page to show reset stats
      window.location.reload();
    }
  };

  // Format numbers for display
  const formatPercent = (value: number) => Math.round(value);
  const formatDecimal = (value: number) => value.toFixed(2);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Your Stats</h1>
          <button
            className={styles.backButton}
            onClick={onBack}
            aria-label="Go back to game"
          >
            Back to Game
          </button>
        </header>

        <div className={styles.statsGrid}>
          {/* Current Level - Highlighted */}
          <div className={`${styles.statCard} ${styles.levelCard}`}>
            <div className={styles.statIcon}>🎯</div>
            <div className={styles.statValue}>{leveling.level}</div>
            <div className={styles.statLabel}>Current Level</div>
          </div>

          {/* Total Words Completed */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📚</div>
            <div className={styles.statValue}>{stats.totalWords}</div>
            <div className={styles.statLabel}>Words Completed</div>
          </div>

          {/* Unique Words */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✨</div>
            <div className={styles.statValue}>{stats.uniqueWords}</div>
            <div className={styles.statLabel}>Unique Words</div>
          </div>

          {/* Accuracy Stability Index */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎪</div>
            <div className={styles.statValue}>
              {formatPercent(metrics.accuracyStabilityIndex)}%
            </div>
            <div className={styles.statLabel}>Accuracy Stability</div>
            <div className={styles.statDescription}>
              First-try correct rate
            </div>
          </div>

          {/* Motor Fluency Score */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚡</div>
            <div className={styles.statValue}>
              {formatPercent(metrics.motorFluencyScore)}%
            </div>
            <div className={styles.statLabel}>Motor Fluency</div>
            <div className={styles.statDescription}>
              Typing precision
            </div>
          </div>

          {/* Consistency Score */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎯</div>
            <div className={styles.statValue}>
              {formatPercent(metrics.consistencyScore)}%
            </div>
            <div className={styles.statLabel}>Consistency</div>
            <div className={styles.statDescription}>
              Overall reliability
            </div>
          </div>

          {/* Average Accuracy */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statValue}>
              {formatPercent(metrics.averageAccuracy)}%
            </div>
            <div className={styles.statLabel}>Average Accuracy</div>
            <div className={styles.statDescription}>
              Words completed correctly
            </div>
          </div>

          {/* Error Density */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statValue}>
              {formatDecimal(metrics.averageErrorDensity)}
            </div>
            <div className={styles.statLabel}>Error Density</div>
            <div className={styles.statDescription}>
              Errors per letter
            </div>
          </div>

          {/* Average Wrong Keys */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⌨️</div>
            <div className={styles.statValue}>
              {formatDecimal(metrics.averageWrongKeyPresses)}
            </div>
            <div className={styles.statLabel}>Avg Wrong Keys</div>
            <div className={styles.statDescription}>
              Per word
            </div>
          </div>
        </div>

        {/* Level Features Info */}
        <div className={styles.featuresSection}>
          <h2 className={styles.featuresTitle}>Current Level Features</h2>
          <div className={styles.featuresList}>
            <div className={styles.feature}>
              <span className={styles.featureIndicator}>
                {leveling.features.showKeyHighlights ? '✅' : '❌'}
              </span>
              <span className={styles.featureText}>Keyboard Highlights</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIndicator}>
                {leveling.features.showWordVariants ? '✅' : '❌'}
              </span>
              <span className={styles.featureText}>Word Variants</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIndicator}>
                {leveling.features.showSyllables ? '✅' : '❌'}
              </span>
              <span className={styles.featureText}>Syllables</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIndicator}>
                {leveling.features.allowBlankTiles ? '✅' : '❌'}
              </span>
              <span className={styles.featureText}>Blank Tiles</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIndicator}>
                {leveling.features.hideEmojiAfterDelay ? '✅' : '❌'}
              </span>
              <span className={styles.featureText}>Hidden Emoji</span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className={styles.resetSection}>
          <button
            className={styles.resetButton}
            onClick={handleReset}
            aria-label="Reset all progress"
          >
            Reset Progress
          </button>
          <p className={styles.resetWarning}>
            Warning: This will erase all your stats and return you to Level 1
          </p>
        </div>
      </div>
    </div>
  );
};
