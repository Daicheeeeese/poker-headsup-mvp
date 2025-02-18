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
    <div className="min-h-screen bg-dark-bg">
      {/* ヘッダー */}
      <header className="bg-navy shadow-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-gold text-3xl font-poppins font-bold">♠️ Poker Trainer</span>
          </div>
          <nav className="flex space-x-6">
            <button className="text-gold hover:text-gold-light transition-colors">
              <FaHome className="text-xl" />
            </button>
            <button className="text-gold hover:text-gold-light transition-colors">
              <FaChartBar className="text-xl" />
            </button>
            <button className="text-gold hover:text-gold-light transition-colors">
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
            <div className="bg-dark-card rounded-xl shadow-card p-8 mb-8 card-hover">
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-navy rounded-lg p-5">
                  <p className="text-gold text-sm font-medium">ストリート</p>
                  <p className="text-white text-lg">{currentQuestion.street}</p>
                </div>
                <div className="bg-navy rounded-lg p-5">
                  <p className="text-gold text-sm font-medium">アンティ</p>
                  <p className="text-white text-lg">{currentQuestion.anti}BB</p>
                </div>
                <div className="bg-navy rounded-lg p-5">
                  <p className="text-gold text-sm font-medium">ポジション</p>
                  <p className="text-white text-lg">{currentQuestion.position}</p>
                </div>
              </div>

              {/* シナリオ情報 */}
              <div className="bg-navy rounded-lg p-6 mb-8">
                <h2 className="text-xl font-poppins font-semibold text-gold mb-4">シナリオ</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-card rounded-lg p-4">
                    <p className="text-gold text-sm font-medium">スタック</p>
                    <p className="text-white text-2xl font-bold">
                      {currentQuestion.scenario.stackSize}BB
                    </p>
                  </div>
                  <div className="bg-dark-card rounded-lg p-4">
                    <p className="text-gold text-sm font-medium">ポットサイズ</p>
                    <p className="text-white text-2xl font-bold">
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
                    className={`w-full py-4 px-6 rounded-lg text-lg transition-all shadow-card
                      ${
                        selectedAnswer === option
                          ? selectedAnswer === currentQuestion.correctAnswer
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                          : selectedAnswer
                          ? 'bg-dark-hover text-gray-400'
                          : 'btn-primary'
                      }`}
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