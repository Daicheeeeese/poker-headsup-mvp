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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-center mb-12">
          ポーカーヘッズアップトレーナー
        </h1>
        
        {currentQuestion && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-indigo-50">
            {/* ゲーム情報 */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-5 text-white">
                <p className="text-sm opacity-80">ストリート</p>
                <p className="font-medium text-lg">{currentQuestion.street}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-5 text-white">
                <p className="text-sm opacity-80">アンティ</p>
                <p className="font-medium text-lg">{currentQuestion.anti}BB</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-5 text-white">
                <p className="text-sm opacity-80">ポジション</p>
                <p className="font-medium text-lg">{currentQuestion.position}</p>
              </div>
            </div>

            {/* シナリオ情報 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-indigo-900 mb-4">シナリオ</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-indigo-600 font-medium">スタック</p>
                  <p className="text-2xl font-bold text-gray-800">{currentQuestion.scenario.stackSize}BB</p>
                </div>
                <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-indigo-600 font-medium">ポットサイズ</p>
                  <p className="text-2xl font-bold text-gray-800">{currentQuestion.scenario.potSize}BB</p>
                </div>
              </div>
            </div>

            {/* 選択肢 */}
            <div className="space-y-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                  className={`w-full py-4 px-6 rounded-xl text-lg font-medium transition-all transform hover:scale-[1.02] ${
                    selectedAnswer === option
                      ? selectedAnswer === currentQuestion.correctAnswer
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                      : selectedAnswer
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                  } shadow-md`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BBスタイル情報 */}
        {bbStyle && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-indigo-50">
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
              相手プレイヤー情報
            </h2>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
              <p className="text-lg font-medium text-indigo-900">
                {bbStyle.category}（{bbStyle.type}）
              </p>
              <p className="text-gray-700 mt-3">
                {bbStyle.characteristics}
              </p>
            </div>
          </div>
        )}

        {/* 説明生成部分 */}
        {selectedAnswer && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-indigo-50">
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