import React, { useState, useEffect } from 'react';
import { PokerQuestion, Card, BBStyle, Suit, Rank } from '../types/types';
import { questions } from '../data/questions';
import ExplanationGenerator from './ExplanationGenerator';
import { motion } from 'framer-motion';
import { FaHome, FaChartBar, FaCog } from 'react-icons/fa';
import '@fontsource/inter';

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
    <div className="min-h-screen bg-[#F8F9FA] font-['Inter']">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-[#1E2A38] text-2xl font-bold">🎲 Poker Trainer</span>
          </div>
          <nav className="flex space-x-6">
            <button className="text-[#2C3E50] hover:text-[#F4B400] transition-colors">
              <FaHome className="text-xl" />
            </button>
            <button className="text-[#2C3E50] hover:text-[#F4B400] transition-colors">
              <FaChartBar className="text-xl" />
            </button>
            <button className="text-[#2C3E50] hover:text-[#F4B400] transition-colors">
              <FaCog className="text-xl" />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* ゲーム情報カード */}
            <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] p-8 mb-8">
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1E2A38] rounded-lg p-5 text-white">
                  <p className="text-sm text-[#F4B400]">ストリート</p>
                  <p className="font-medium text-lg">{currentQuestion.street}</p>
                </div>
                <div className="bg-[#1E2A38] rounded-lg p-5 text-white">
                  <p className="text-sm text-[#F4B400]">アンティ</p>
                  <p className="font-medium text-lg">{currentQuestion.anti}BB</p>
                </div>
                <div className="bg-[#1E2A38] rounded-lg p-5 text-white">
                  <p className="text-sm text-[#F4B400]">ポジション</p>
                  <p className="font-medium text-lg">{currentQuestion.position}</p>
                </div>
              </div>

              {/* シナリオ情報 */}
              <div className="bg-[#F8F9FA] rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-[#1E2A38] mb-4">シナリオ</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-[#F4B400] font-medium">スタック</p>
                    <p className="text-2xl font-bold text-[#2C3E50]">
                      {currentQuestion.scenario.stackSize}BB
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-[#F4B400] font-medium">ポットサイズ</p>
                    <p className="text-2xl font-bold text-[#2C3E50]">
                      {currentQuestion.scenario.potSize}BB
                    </p>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="space-y-4">
                {currentQuestion.options.map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedAnswer}
                    className={`w-full py-4 px-6 rounded-lg text-lg font-medium transition-all
                      ${
                        selectedAnswer === option
                          ? selectedAnswer === currentQuestion.correctAnswer
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : selectedAnswer
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-[#1E2A38] text-white hover:bg-[#F4B400] hover:text-[#1E2A38]'
                      }
                      shadow-[0px_4px_12px_rgba(0,0,0,0.1)]`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* BBスタイル情報 */}
            {bbStyle && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] p-8 mb-8"
              >
                <h2 className="text-xl font-semibold text-[#1E2A38] mb-6">
                  相手プレイヤー情報
                </h2>
                <div className="bg-[#F8F9FA] rounded-lg p-6">
                  <p className="text-lg font-medium text-[#2C3E50]">
                    {bbStyle.category}（{bbStyle.type}）
                  </p>
                  <p className="text-gray-700 mt-3">{bbStyle.characteristics}</p>
                </div>
              </motion.div>
            )}

            {/* 説明生成部分 */}
            {selectedAnswer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.1)] p-8"
              >
                <ExplanationGenerator
                  hand={getHandString(currentQuestion.scenario.heroHand)}
                  position={currentQuestion.position}
                  selectedAction={selectedAnswer}
                  isCorrect={selectedAnswer === currentQuestion.correctAnswer}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default QuizGame; 