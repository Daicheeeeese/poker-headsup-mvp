import React from 'react';
import QuizGame from './components/QuizGame';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ポーカークイズ</h1>
      </header>
      <main>
        <QuizGame />
      </main>
    </div>
  );
};

export default App; 