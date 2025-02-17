import React, { useState, useEffect } from 'react';
import { PokerQuestion, Card, BBStyle } from '../types/types';
import { questions } from '../data/questions';
import ExplanationGenerator from './ExplanationGenerator';

const QuizGame: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bbStyle, setBBStyle] = useState<BBStyle | null>(null);

  useEffect(() => {
    // コンポーネントマウント時とクイズが変わるたびにBBスタイルを設定
    const styles = Object.values(questions[currentQuestionIndex].bbStyles);
    const randomIndex = Math.floor(Math.random() * styles.length);
    setBBStyle(styles[randomIndex]);
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion || !bbStyle) {
    return <div>Loading...</div>;
  }

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(prev => 
      prev < questions.length - 1 ? prev + 1 : 0
    );
  };

  const getHandString = (hand: Card[]): string => {
    return hand.map(card => `${card.rank}${card.suit === 'hearts' ? '♥' : 
      card.suit === 'diamonds' ? '♦' : 
      card.suit === 'clubs' ? '♣' : '♠'}`).join('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-800 mb-8">
                  ポーカークイズ
                </h2>
                
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600 font-medium">ストリート: {currentQuestion.street}</p>
                    <p className="text-gray-600 font-medium">アンティ: {currentQuestion.anti}BB</p>
                    <p className="text-gray-600 font-medium">ポジション: {currentQuestion.position}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700 font-medium">
                      相手タイプ: {bbStyle.category}（{bbStyle.type}）
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      特徴: {bbStyle.characteristics}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">あなたのハンド:</h3>
                  <div className="flex gap-4 justify-center">
                    {currentQuestion.scenario.heroHand.map((card, index) => (
                      <div key={index} 
                        className={`
                          px-6 py-4 rounded-xl shadow-md border-2 border-gray-200
                          ${card.suit === 'hearts' || card.suit === 'diamonds' 
                            ? 'text-red-500' 
                            : 'text-gray-900'
                          }
                          text-2xl font-bold bg-white
                          transform hover:scale-110 transition-transform duration-200
                        `}
                      >
                        {card.rank}
                        {card.suit === 'hearts' ? '♥' : 
                         card.suit === 'diamonds' ? '♦' : 
                         card.suit === 'clubs' ? '♣' : '♠'}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {currentQuestion.options.map((option, index) => (
                    <button 
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={showAnswer}
                      className={`
                        px-6 py-3 rounded-xl text-sm font-semibold
                        transform transition-all duration-200
                        ${showAnswer 
                          ? option === currentQuestion.correctAnswer 
                            ? 'bg-green-500 text-white'
                            : option === selectedAnswer 
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-400'
                          : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
                        }
                        ${showAnswer ? 'cursor-not-allowed' : 'hover:shadow-lg'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                      `}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {showAnswer && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-xl shadow-inner">
                    <div className="space-y-4">
                      <p className="font-medium text-gray-600">
                        あなたの選択: <span className="text-blue-600">{selectedAnswer}</span>
                      </p>
                      <p className="font-medium text-gray-600">
                        正解: <span className="text-green-600">{currentQuestion.correctAnswer}</span>
                      </p>
                      <div className="mt-6">
                        <ExplanationGenerator
                          hand={getHandString(currentQuestion.scenario.heroHand)}
                          position={currentQuestion.position}
                          selectedAction={selectedAnswer || ''}
                          isCorrect={selectedAnswer === currentQuestion.correctAnswer}
                        />
                      </div>
                      <button 
                        onClick={handleNext}
                        className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 
                          text-white py-3 px-6 rounded-xl
                          font-semibold transform transition-all duration-200
                          hover:from-blue-600 hover:to-blue-700 hover:scale-105
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        次の問題へ
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <p className="text-xl font-bold text-gray-800">
                    スコア: <span className="text-blue-600">{score}</span> / <span className="text-gray-600">{questions.length}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGame; 