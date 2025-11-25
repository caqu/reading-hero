import { useState, useEffect, useMemo, useCallback } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { useGameState } from './hooks/useGameState';
import { useFeedback } from './hooks/useFeedback';
import { words } from './data/words';
import './App.css';

type Screen = 'home' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('game'); // Start directly in game

  // Initialize game state with useGameState hook
  const game = useGameState(words);

  // Initialize feedback system
  const { feedbackState, triggerWrongKey, triggerCorrectLetter, triggerWordComplete } = useFeedback();

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
    // Only handle single letter keys
    if (key.length !== 1 || !/[a-zA-Z]/.test(key)) {
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
      // Incorrect key press - trigger wrong key feedback
      const correctLetter = currentWord.text[currentLetterIndexBefore];
      if (correctLetter) {
        triggerWrongKey(key, correctLetter);
      }
    }
  }, [game, triggerWrongKey, triggerCorrectLetter, triggerWordComplete]);

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

      // Only handle single letter keys (A-Z, case insensitive)
      if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
        event.preventDefault(); // Prevent default only for game letters
        handleKeyPress(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup listener on unmount or screen change
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentScreen, handleKeyPress]);

  const handleStartGame = () => {
    // Reset game state
    game.resetGame();
    setCorrectWords(0);
    setCurrentScreen('game');
  };

  const handleGameComplete = () => {
    setCurrentScreen('home');
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
      {currentScreen === 'home' && <HomeScreen onStart={handleStartGame} />}
      {currentScreen === 'game' && (
        <GameScreen
          words={game.words}
          currentWordIndex={game.currentWordIndex}
          currentLetterIndex={game.currentLetterIndex}
          revealedLetters={revealedLetters}
          attempts={game.totalAttempts}
          correctWords={correctWords}
          showWordText={false}
          onComplete={handleGameComplete}
          onKeyPress={handleKeyPress}
          highlightKey={game.currentLetter ?? undefined}
          keyboardDisabled={game.isComplete}
          wrongKey={feedbackState.wrongKey}
          correctKey={feedbackState.correctKey}
          correctTileIndex={feedbackState.correctTileIndex}
        />
      )}
    </div>
  );
}

export default App;
