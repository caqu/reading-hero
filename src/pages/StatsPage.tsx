import { useState } from 'react';
import { useLevelingEngine } from '../engine/LevelingEngine';
import { getActiveProfile, getProfiles, setActiveProfile, updateActiveProfile } from '../engine/ProfileManager';
import { Profile, ProfileLevelingState } from '../types';
import styles from './StatsPage.module.css';

interface StatsPageProps {
  onBack: () => void;
  onProfileSwitch?: (profile: Profile) => void;
}

export const StatsPage = ({ onBack, onProfileSwitch }: StatsPageProps) => {
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(getActiveProfile());
  const [showDashboard, setShowDashboard] = useState(false);
  const profiles = getProfiles();

  const leveling = useLevelingEngine();
  const metrics = leveling.getMetrics();

  // Load stats from active profile
  const loadStats = () => {
    if (!activeProfile) {
      return { totalWords: 0, uniqueWords: 0 };
    }
    return {
      totalWords: activeProfile.levelingState?.wordHistory?.length || 0,
      uniqueWords: activeProfile.levelingState?.uniqueWordsCompleted?.length || 0,
    };
  };

  const stats = loadStats();

  const handleProfileChange = (profileId: string) => {
    const success = setActiveProfile(profileId);
    if (success) {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        setActiveProfileState(profile);
        if (onProfileSwitch) {
          onProfileSwitch(profile);
        }
      }
    }
  };

  const handleReset = () => {
    if (!activeProfile) return;

    const confirmed = window.confirm(
      `Are you sure you want to reset ${activeProfile.name}'s progress? This cannot be undone!`
    );
    if (confirmed) {
      // Create initial leveling state
      const initialLevelingState: ProfileLevelingState = {
        currentLevel: 1,
        wordHistory: [],
        levelStartWordCount: 0,
        uniqueWordsCompleted: [],
      };

      // Reset profile stats and leveling state
      updateActiveProfile({
        level: 1,
        lastWordId: null,
        stats: {
          accuracy: 0,
          wordsCompleted: 0,
          correctAttempts: 0,
          incorrectAttempts: 0,
          totalKeystrokes: 0,
        },
        levelingState: initialLevelingState,
      });

      // Refresh the page to show reset stats
      window.location.reload();
    }
  };

  // Format numbers for display
  const formatPercent = (value: number) => Math.round(value);
  const formatDecimal = (value: number) => value.toFixed(2);
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (showDashboard) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.title}>All Profiles Dashboard</h1>
            <div className={styles.headerButtons}>
              <button
                className={styles.backButton}
                onClick={() => setShowDashboard(false)}
                aria-label="Back to stats"
              >
                Back to Stats
              </button>
              <button
                className={styles.backButton}
                onClick={onBack}
                aria-label="Go back to game"
              >
                Back to Game
              </button>
            </div>
          </header>

          <div className={styles.dashboardTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Level</th>
                  <th>Accuracy</th>
                  <th>Words Completed</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className={profile.id === activeProfile?.id ? styles.activeRow : ''}>
                    <td>
                      <div className={styles.profileCell}>
                        <span className={styles.profileAvatar}>{profile.avatar}</span>
                        <span className={styles.profileName}>{profile.name}</span>
                      </div>
                    </td>
                    <td>{profile.level}</td>
                    <td>{profile.stats.accuracy}%</td>
                    <td>{profile.stats.wordsCompleted}</td>
                    <td>{formatTimeAgo(profile.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.profileHeader}>
            <div className={styles.profileInfo}>
              <span className={styles.profileAvatarLarge}>{activeProfile?.avatar || '👤'}</span>
              <div className={styles.profileDetails}>
                <h1 className={styles.title}>{activeProfile?.name || 'No Profile'}'s Stats</h1>
                <select
                  className={styles.profileDropdown}
                  value={activeProfile?.id || ''}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  aria-label="Switch profile"
                >
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.avatar} {profile.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.headerButtons}>
              {profiles.length > 1 && (
                <button
                  className={styles.dashboardButton}
                  onClick={() => setShowDashboard(true)}
                  aria-label="View all profiles dashboard"
                >
                  All Profiles
                </button>
              )}
              <button
                className={styles.backButton}
                onClick={onBack}
                aria-label="Go back to game"
              >
                Back to Game
              </button>
            </div>
          </div>
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
            aria-label="Reset this profile's progress"
          >
            Reset This Profile
          </button>
          <p className={styles.resetWarning}>
            Warning: This will erase {activeProfile?.name || 'this profile'}'s stats and return them to Level 1
          </p>
        </div>
      </div>
    </div>
  );
};
