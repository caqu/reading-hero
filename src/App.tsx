import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { words } from './data/words';
import './App.css';

type Screen = 'home' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState<boolean[]>(
    new Array(words[0]?.text.length || 0).fill(false)
  );
  const [attempts, setAttempts] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'none'>('none');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const handleStartGame = () => {
    // Reset game state
    setCurrentScreen('game');
    setCurrentWordIndex(0);
    setCurrentLetterIndex(0);
    setRevealedLetters(new Array(words[0]?.text.length || 0).fill(false));
    setAttempts(0);
    setCorrectWords(0);
    setFeedbackType('none');
    setFeedbackMessage('');
  };

  const handleGameComplete = () => {
    setCurrentScreen('home');
  };

  return (
    <div className="app">
      {currentScreen === 'home' && <HomeScreen onStart={handleStartGame} />}
      {currentScreen === 'game' && (
        <GameScreen
          words={words}
          currentWordIndex={currentWordIndex}
          currentLetterIndex={currentLetterIndex}
          revealedLetters={revealedLetters}
          attempts={attempts}
          correctWords={correctWords}
          feedbackType={feedbackType}
          feedbackMessage={feedbackMessage}
          showWordText={false}
          onComplete={handleGameComplete}
        />
      )}
    </div>
  );
}

export default App;
