import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header>
        <h1>MotorKeys</h1>
        <p>Motor-Plan Literacy Game</p>
      </header>
      <main>
        <p>Hello, MotorKeys! 🚀</p>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>Project setup complete. Ready to build!</p>
      </main>
    </div>
  );
}

export default App;
