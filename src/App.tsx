import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FinishScreen } from './components/FinishScreen';
import { GameScreen } from './components/GameScreen';
import { useGameState } from './hooks/useGameState';
import { useFeedback } from './hooks/useFeedback';
import { useWordRouting } from './hooks/useWordRouting';
import { useLevelingEngine, WordResult } from './engine/LevelingEngine';
import { words } from './data/words';
import './App.css';

type Screen = 'finish' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('finish'); // Start at finish screen
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track if this is the first load

  // Initialize game state with useGameState hook
  const game = useGameState(words);

  // Track if we're currently in word navigation to prevent URL sync loops
  const isNavigatingRef = useRef(false);

  // Initialize feedback system
  const { feedbackState, triggerWrongKey, triggerCorrectLetter, triggerWordComplete } = useFeedback();

  // Initialize leveling engine
  const leveling = useLevelingEngine();

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
    // Reset game state and shuffle words
    game.resetGame();
    setCorrectWords(0);
    setIsInitialLoad(false); // No longer the initial load
    setCurrentScreen('game');
  };

  const handleGameComplete = () => {
    setCurrentScreen('finish');
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
        />
      )}
    </div>
  );
}

export default App;
