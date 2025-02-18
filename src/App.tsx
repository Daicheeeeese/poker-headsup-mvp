import React from 'react';
import QuizGame from './components/QuizGame';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">

      <main>
        <QuizGame />
      </main>
    </div>
  );
};

export default App; 