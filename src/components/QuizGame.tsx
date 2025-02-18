import React, { useState, useEffect } from 'react';
import { PokerQuestion, Card, BBStyle, Suit, Rank } from '../types/types';
import { questions } from '../data/questions';
import ExplanationGenerator from './ExplanationGenerator';

interface Question {
  scenario: {
    heroHand: {
      suit: Suit;
      rank: Rank;
    }[];
  };
  position: string;
  correctAnswer: string;
}

const getHandString = (hand: Card[]): Card[] => {
  return hand.map(card => ({
    suit: card.suit,
    rank: card.rank
  }));
};

const QuizGame: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bbStyle, setBBStyle] = useState<BBStyle | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<PokerQuestion | null>(null);

  useEffect(() => {
    if (currentQuestionIndex < questions.length) {
      const currentBBStyles = questions[currentQuestionIndex].bbStyles;
      const randomIndex = Math.floor(Math.random() * currentBBStyles.length);
      setBBStyle(currentBBStyles[randomIndex]);
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    setCurrentQuestion(questions[currentQuestionIndex] as PokerQuestion);
  }, [currentQuestionIndex]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          ポーカーヘッズアップトレーナー
        </h1>
        
        {currentQuestion && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            {/* ゲーム情報 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">ストリート</p>
                <p className="font-medium text-gray-800">{currentQuestion.street}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">アンティ</p>
                <p className="font-medium text-gray-800">{currentQuestion.anti}BB</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">ポジション</p>
                <p className="font-medium text-gray-800">{currentQuestion.position}</p>
              </div>
            </div>

            {/* シナリオ情報 */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">シナリオ</h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  スタック: {currentQuestion.scenario.stackSize}BB
                </p>
                <p className="text-gray-700">
                  ポットサイズ: {currentQuestion.scenario.potSize}BB
                </p>
              </div>
            </div>

            {/* 選択肢 */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                  className={`w-full py-3 px-6 rounded-lg transition-colors ${
                    selectedAnswer === option
                      ? selectedAnswer === currentQuestion.correctAnswer
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : selectedAnswer
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BBスタイル情報 */}
        {bbStyle && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">相手プレイヤー情報</h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="font-medium text-gray-800">
                {bbStyle.category}（{bbStyle.type}）
              </p>
              <p className="text-gray-600 mt-2">
                {bbStyle.characteristics}
              </p>
            </div>
          </div>
        )}

        {/* 説明生成部分 */}
        {selectedAnswer && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <ExplanationGenerator
              hand={getHandString(currentQuestion.scenario.heroHand)}
              position={currentQuestion.position}
              selectedAction={selectedAnswer}
              isCorrect={selectedAnswer === currentQuestion.correctAnswer}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGame; 