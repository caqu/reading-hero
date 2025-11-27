import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FinishScreen } from './components/FinishScreen';
import { GameScreen } from './components/GameScreen';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useGameState } from './hooks/useGameState';
import { useFeedback } from './hooks/useFeedback';
import { useWordRouting } from './hooks/useWordRouting';
import { useLevelingEngine, WordResult } from './engine/LevelingEngine';
import { words } from './data/words';
import { hasProfiles, getActiveProfile, createProfile, updateActiveProfile, getActiveProfileId } from './engine/ProfileManager';
import { initializeSettings } from './engine/SettingsManager';
import { Profile, ProfileLevelingState } from './types';
import './App.css';

type Screen = 'finish' | 'game' | 'stats' | 'settings' | 'create-profile' | 'add-profile';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('finish'); // Start at finish screen
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track if this is the first load

  // Initialize settings and check for profiles on initial load
  useEffect(() => {
    // Initialize settings (theme, etc.)
    initializeSettings();

    if (!hasProfiles()) {
      // No profiles exist - show profile creation screen
      setCurrentScreen('create-profile');
    } else {
      // Load active profile
      const activeProfile = getActiveProfile();
      if (activeProfile) {
        // Profile exists, we'll use it when needed
        console.log('Active profile loaded:', activeProfile.name);
      }
    }
  }, [])

  // Initialize game state with useGameState hook
  const game = useGameState(words);

  // Track if we're currently in word navigation to prevent URL sync loops
  const isNavigatingRef = useRef(false);

  // Initialize feedback system
  const { feedbackState, triggerWrongKey, triggerCorrectLetter, triggerWordComplete } = useFeedback();

  // Get active profile ID
  const activeProfileId = getActiveProfileId();

  // Initialize leveling engine with profile integration
  const handleLevelingStateChange = useCallback((levelingState: any) => {
    // Save leveling state to active profile
    if (activeProfileId) {
      updateActiveProfile({
        levelingState: {
          currentLevel: levelingState.currentLevel,
          wordHistory: levelingState.wordHistory,
          levelStartWordCount: levelingState.levelStartWordCount,
          uniqueWordsCompleted: Array.from(levelingState.uniqueWordsCompleted),
        },
        level: levelingState.currentLevel,
      });
    }
  }, [activeProfileId]);

  const leveling = useLevelingEngine(activeProfileId, handleLevelingStateChange);

  // Load profile's leveling state on mount or when profile changes
  useEffect(() => {
    const activeProfile = getActiveProfile();
    if (activeProfile && activeProfile.levelingState) {
      // Convert array to Set for uniqueWordsCompleted
      leveling.loadStateFromProfile({
        currentLevel: activeProfile.levelingState.currentLevel,
        wordHistory: activeProfile.levelingState.wordHistory,
        levelStartWordCount: activeProfile.levelingState.levelStartWordCount,
        uniqueWordsCompleted: new Set(activeProfile.levelingState.uniqueWordsCompleted),
      });
    }
  }, [activeProfileId]);

  // Handle word change from URL (browser navigation or direct URL)
  const handleWordChangeFromURL = useCallback((wordId: string | null) => {
    if (isNavigatingRef.current) return; // Prevent loops

    if (wordId) {
      // Try to set the word by ID
      game.setWordById(wordId);
    }
    // If wordId is null, the game will stay at its current word (or first word on init)
  }, [game]);

  // Initialize word routing
  const routing = useWordRouting(game.words, handleWordChangeFromURL);

  // Initialize from URL when game screen first loads
  useEffect(() => {
    if (currentScreen === 'game') {
      // Check if there's a word parameter in the URL
      const params = new URLSearchParams(window.location.search);
      const wordParam = params.get('word');

      if (wordParam) {
        // URL has a word parameter - use routing to initialize
        routing.initializeFromURL();
      } else if (game.currentWord) {
        // No URL parameter - sync URL to current word
        routing.syncURLToWordId(game.currentWord.id, true);
      }
    }
  }, [currentScreen]); // Only run when screen changes

  // Track word start time for performance metrics
  const [wordStartTime, setWordStartTime] = useState<number>(Date.now());
  const [wordWrongKeyPresses, setWordWrongKeyPresses] = useState<number>(0);
  const [wordFirstTryCorrect, setWordFirstTryCorrect] = useState<boolean>(true);

  // Reset word tracking when word changes
  useEffect(() => {
    setWordStartTime(Date.now());
    setWordWrongKeyPresses(0);
    setWordFirstTryCorrect(true);
  }, [game.currentWordIndex]);

  // Sync URL when current word changes (only in game screen)
  useEffect(() => {
    if (currentScreen === 'game' && game.currentWord && !isInitialLoad) {
      isNavigatingRef.current = true;
      routing.syncURLToWordId(game.currentWord.id, false);
      // Reset the flag after a short delay
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    }
  }, [game.currentWordIndex, game.currentWord, currentScreen, isInitialLoad, routing]);

  // Calculate revealed letters based on current progress
  const revealedLetters = useMemo(() => {
    if (!game.currentWord) return [];
    const letters = new Array(game.currentWord.text.length).fill(false);
    for (let i = 0; i < game.currentLetterIndex; i++) {
      letters[i] = true;
    }
    return letters;
  }, [game.currentWord, game.currentLetterIndex]);

  // Track completed words for progress display
  const [correctWords, setCorrectWords] = useState(0);

  // Handle key press from both on-screen and physical keyboard
  const handleKeyPress = useCallback((key: string) => {
    // Only handle single letter keys and space
    if (key.length !== 1 || !/[a-zA-Z ]/.test(key)) {
      return;
    }

    // Store current state before processing
    const currentWord = game.currentWord;
    const currentLetterIndexBefore = game.currentLetterIndex;

    if (!currentWord) return;

    const isCorrect = game.handleKeyPress(key);

    if (isCorrect) {
      // Trigger correct letter animation
      triggerCorrectLetter(currentLetterIndexBefore);

      // Check if word was just completed
      const isWordComplete = currentLetterIndexBefore === currentWord.text.length - 1;

      if (isWordComplete) {
        // Word completed - record result in leveling engine
        const timeToComplete = Date.now() - wordStartTime;
        const result: WordResult = {
          wordId: currentWord.id,
          correct: true,
          wrongKeyPresses: wordWrongKeyPresses,
          firstTryCorrect: wordFirstTryCorrect,
          timeToComplete,
          wordLength: currentWord.text.length,
        };
        leveling.recordResult(result);

        // Update active profile with word completion
        const activeProfile = getActiveProfile();
        if (activeProfile) {
          const newStats = {
            ...activeProfile.stats,
            wordsCompleted: activeProfile.stats.wordsCompleted + 1,
            correctAttempts: activeProfile.stats.correctAttempts + currentWord.text.length,
            incorrectAttempts: activeProfile.stats.incorrectAttempts + wordWrongKeyPresses,
            totalKeystrokes: activeProfile.stats.totalKeystrokes + currentWord.text.length + wordWrongKeyPresses,
            accuracy: Math.round(
              ((activeProfile.stats.correctAttempts + currentWord.text.length) /
                (activeProfile.stats.totalKeystrokes + currentWord.text.length + wordWrongKeyPresses)) *
                100
            ),
          };

          updateActiveProfile({
            stats: newStats,
            lastWordId: currentWord.id,
          });
        }

        // Word completed - show confetti and advance after delay
        setCorrectWords(prev => prev + 1);

        // Fire confetti
        triggerWordComplete();

        // Advance to next word after delay (confetti + pause)
        setTimeout(() => {
          game.nextWord();
        }, 1000); // 1 second total (confetti duration + small pause)
      }
    } else {
      // Incorrect key press - track and trigger wrong key feedback
      setWordWrongKeyPresses(prev => prev + 1);
      setWordFirstTryCorrect(false);
      const correctLetter = currentWord.text[currentLetterIndexBefore];
      if (correctLetter) {
        triggerWrongKey(key, correctLetter);
      }
    }
  }, [game, triggerWrongKey, triggerCorrectLetter, triggerWordComplete, leveling, wordStartTime, wordWrongKeyPresses, wordFirstTryCorrect]);

  // Physical keyboard event handler
  useEffect(() => {
    // Only attach listener when game screen is active
    if (currentScreen !== 'game') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if any modifier keys are pressed (Ctrl, Alt, Meta/Cmd, Shift)
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return; // Allow browser shortcuts like Ctrl+R, Ctrl+S, etc.
      }

      // Only handle single letter keys (A-Z, case insensitive) and space
      if (event.key.length === 1 && /[a-zA-Z ]/.test(event.key)) {
        event.preventDefault(); // Prevent default only for game letters and space
        handleKeyPress(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup listener on unmount or screen change
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentScreen, handleKeyPress]);

  const handleStartOrRestart = () => {
    // Check if profile exists before starting
    if (!hasProfiles()) {
      setCurrentScreen('create-profile');
      return;
    }

    // Load active profile's last word if available
    const activeProfile = getActiveProfile();
    if (activeProfile && activeProfile.lastWordId) {
      // Try to set the word from profile
      game.setWordById(activeProfile.lastWordId);
    } else {
      // Reset game state and shuffle words
      game.resetGame();
    }

    setCorrectWords(0);
    setIsInitialLoad(false); // No longer the initial load
    setCurrentScreen('game');
  };

  const handleCreateProfile = (name: string, avatar: string) => {
    const newProfile = createProfile({ name, avatar });

    // If this is adding a profile (not initial creation), go back to game
    if (currentScreen === 'add-profile') {
      // Auto-switch to the new profile
      handleProfileSwitch(newProfile);
      setCurrentScreen('game');
    } else {
      // Initial profile creation - go to finish screen
      setCurrentScreen('finish');
    }
  };

  const handleAddProfile = () => {
    setCurrentScreen('add-profile');
  };

  const handleGameComplete = () => {
    setCurrentScreen('finish');
  };

  const handleViewStats = () => {
    setCurrentScreen('stats');
  };

  const handleViewSettings = () => {
    setCurrentScreen('settings');
  };

  const handleBackToGame = () => {
    setCurrentScreen('game');
  };

  const handleProfileSwitch = (profile: Profile) => {
    // Load profile's leveling state into leveling engine
    if (profile.levelingState) {
      // Convert array to Set for uniqueWordsCompleted
      leveling.loadStateFromProfile({
        currentLevel: profile.levelingState.currentLevel,
        wordHistory: profile.levelingState.wordHistory,
        levelStartWordCount: profile.levelingState.levelStartWordCount,
        uniqueWordsCompleted: new Set(profile.levelingState.uniqueWordsCompleted),
      });
    }

    // When profile switches, reload the game state
    if (profile.lastWordId) {
      game.setWordById(profile.lastWordId);
    } else {
      // If no last word, start from beginning
      game.resetGame();
    }

    // Reset word tracking
    setCorrectWords(0);
    setWordStartTime(Date.now());
    setWordWrongKeyPresses(0);
    setWordFirstTryCorrect(true);

    console.log('Profile switched to:', profile.name);
  };

  // Check if game is complete
  useEffect(() => {
    if (game.isComplete && currentScreen === 'game') {
      // Game completed - could show a completion screen or return to home
      setTimeout(() => {
        handleGameComplete();
      }, 2000);
    }
  }, [game.isComplete, currentScreen]);

  return (
    <div className="app">
      {currentScreen === 'create-profile' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: 'var(--color-background)',
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-text)' }}>Create Your Profile</h1>
          <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>Choose a name and avatar to get started!</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            const avatar = formData.get('avatar') as string;
            if (name && avatar) {
              handleCreateProfile(name, avatar);
            }
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                autoFocus
                maxLength={20}
                style={{
                  padding: '0.5rem',
                  fontSize: '1rem',
                  width: '250px',
                  borderRadius: '8px',
                  border: '2px solid var(--color-primary)',
                  backgroundColor: 'var(--color-background-secondary)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="avatar" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Choose an emoji:</label>
              <select
                id="avatar"
                name="avatar"
                required
                style={{
                  padding: '0.5rem',
                  fontSize: '1.5rem',
                  width: '250px',
                  borderRadius: '8px',
                  border: '2px solid var(--color-primary)',
                  backgroundColor: 'var(--color-background-secondary)',
                  color: 'var(--color-text)',
                }}
              >
                <option value="😀">😀</option>
                <option value="🐱">🐱</option>
                <option value="🦕">🦕</option>
                <option value="🚀">🚀</option>
                <option value="🌟">🌟</option>
                <option value="🎨">🎨</option>
                <option value="🎮">🎮</option>
                <option value="🐶">🐶</option>
                <option value="🐼">🐼</option>
                <option value="🦊">🦊</option>
                <option value="🐸">🐸</option>
                <option value="🦋">🦋</option>
              </select>
            </div>
            <button
              type="submit"
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1.125rem',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Create Profile
            </button>
          </form>
        </div>
      )}
      {currentScreen === 'finish' && (
        <FinishScreen
          onRestart={handleStartOrRestart}
          isInitial={isInitialLoad}
        />
      )}
      {currentScreen === 'game' && (
        <GameScreen
          words={game.words}
          currentWordIndex={game.currentWordIndex}
          currentLetterIndex={game.currentLetterIndex}
          revealedLetters={revealedLetters}
          attempts={game.totalAttempts}
          correctAttempts={game.correctAttempts}
          correctWords={correctWords}
          showWordText={false}
          onComplete={handleGameComplete}
          onKeyPress={handleKeyPress}
          highlightKey={game.currentLetter ?? undefined}
          keyboardDisabled={game.isComplete}
          wrongKey={feedbackState.wrongKey}
          correctKey={feedbackState.correctKey}
          correctTileIndex={feedbackState.correctTileIndex}
          levelFeatures={leveling.features}
          currentLevel={leveling.level}
          onLevelChange={leveling.setLevel}
          onViewStats={handleViewStats}
          onViewSettings={handleViewSettings}
          onProfileSwitch={handleProfileSwitch}
          onAddProfile={handleAddProfile}
        />
      )}
      {currentScreen === 'stats' && (
        <StatsPage
          onBack={handleBackToGame}
          onProfileSwitch={handleProfileSwitch}
        />
      )}
      {currentScreen === 'settings' && (
        <SettingsPage
          onBack={handleBackToGame}
        />
      )}
      {currentScreen === 'add-profile' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: 'var(--color-background)',
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-text)' }}>Add New Profile</h1>
          <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>Choose a name and avatar!</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            const avatar = formData.get('avatar') as string;
            if (name && avatar) {
              handleCreateProfile(name, avatar);
            }
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                autoFocus
                maxLength={20}
                style={{
                  padding: '0.5rem',
                  fontSize: '1rem',
                  width: '250px',
                  borderRadius: '8px',
                  border: '2px solid var(--color-primary)',
                  backgroundColor: 'var(--color-background-secondary)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="avatar" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Choose an emoji:</label>
              <select
                id="avatar"
                name="avatar"
                required
                style={{
                  padding: '0.5rem',
                  fontSize: '1.5rem',
                  width: '250px',
                  borderRadius: '8px',
                  border: '2px solid var(--color-primary)',
                  backgroundColor: 'var(--color-background-secondary)',
                  color: 'var(--color-text)',
                }}
              >
                <option value="😀">😀</option>
                <option value="🐱">🐱</option>
                <option value="🦕">🦕</option>
                <option value="🚀">🚀</option>
                <option value="🌟">🌟</option>
                <option value="🎨">🎨</option>
                <option value="🎮">🎮</option>
                <option value="🐶">🐶</option>
                <option value="🐼">🐼</option>
                <option value="🦊">🦊</option>
                <option value="🐸">🐸</option>
                <option value="🦋">🦋</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1.125rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Create Profile
              </button>
              <button
                type="button"
                onClick={() => setCurrentScreen('game')}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1.125rem',
                  backgroundColor: 'var(--color-background-secondary)',
                  color: 'var(--color-text)',
                  border: '2px solid var(--color-text-secondary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
