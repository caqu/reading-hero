import { useState, useEffect, useMemo, useCallback } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { OnScreenKeyboard } from './components/OnScreenKeyboard';
import { useGameState } from './hooks/useGameState';
import { words } from './data/words';
import './App.css';

type Screen = 'home' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'none'>('none');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Initialize game state with useGameState hook
  const game = useGameState(words);

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
      // Check if word was just completed
      const isWordComplete = currentLetterIndexBefore === currentWord.text.length - 1;

      if (isWordComplete) {
        // Word completed - show success feedback
        setCorrectWords(prev => prev + 1);
        setFeedbackType('success');
        setFeedbackMessage('Great job!');

        // Clear feedback and advance to next word after delay
        setTimeout(() => {
          setFeedbackType('none');
          setFeedbackMessage('');
          game.nextWord(); // Advance to next word
        }, 2000); // 2 second delay to show success and let player see completed word
      }
      // Note: For correct letters (not word completion), we don't show any feedback
      // The letter tile will reveal itself, which is sufficient visual feedback
    } else {
      // Incorrect key press - show error feedback
      setFeedbackType('error');
      setFeedbackMessage('Try again!');

      // Clear feedback after animation
      setTimeout(() => {
        setFeedbackType('none');
        setFeedbackMessage('');
      }, 800);
    }
  }, [game]);

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
    setFeedbackType('none');
    setFeedbackMessage('');
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
        <>
          <GameScreen
            words={game.words}
            currentWordIndex={game.currentWordIndex}
            currentLetterIndex={game.currentLetterIndex}
            revealedLetters={revealedLetters}
            attempts={game.totalAttempts}
            correctWords={correctWords}
            feedbackType={feedbackType}
            feedbackMessage={feedbackMessage}
            showWordText={false}
            onComplete={handleGameComplete}
          />
          <OnScreenKeyboard
            onKeyPress={handleKeyPress}
            highlightKey={game.currentLetter || undefined}
            disabled={game.isComplete}
          />
        </>
      )}
    </div>
  );
}

export default App;
