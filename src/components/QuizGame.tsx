import React, { useState, useEffect } from 'react';
import { PokerQuestion, Card, BBStyle, Suit, Rank } from '../types/types';
import { questions } from '../data/questions';
import ExplanationGenerator from './ExplanationGenerator';
import { motion } from 'framer-motion';
import { FaHome, FaChartBar, FaCog, FaInfoCircle, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import { GiWitchFlight, GiArtificialIntelligence } from 'react-icons/gi';
import '@fontsource/inter';
import PokerCard from './PokerCard';
import { generateExplanation } from '../utils/openai';
import { getRandomHand } from '../utils/cardGenerator';
import { ImSpinner8 } from 'react-icons/im';

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

interface ActionResponse {
  isCorrect: boolean;
  explanation: string;
}

// プレイヤータイプの定義
const PLAYER_TYPES = [
  {
    category: 'Nit',
    type: 'タートル',
    characteristics: '超タイトで慎重。強いハンドしかプレイしない。プリフロップでのフォールド率が高く、3ベットは超強いハンドのみ。',
    icon: '🛡️'
  },
  {
    category: 'Loose Passive',
    type: 'コーラー',
    characteristics: 'ほぼ何でもコールするが、自分からは攻めない。コール中心で、ベットやレイズが少ない。',
    icon: '🏕️'
  },
  {
    category: 'LAG',
    type: 'バイキング',
    characteristics: '広いレンジで攻撃的にプレイ。3ベット・ブラフが多い。常にアクションを起こし、相手を圧倒する。',
    icon: '🔥'
  },
  {
    category: 'TAG',
    type: 'ハンター',
    characteristics: 'GTOに近いバランスの取れたプレイ。適切なハンドで積極的にプレイし、ポストフロップでもバランスが良い。',
    icon: '🦊'
  },
  {
    category: 'Maniac',
    type: 'ギャンブラー',
    characteristics: 'どんなハンドでも積極的にプレイし、リスクを恐れない。極端にアグレッシブで、オールインや4ベットが多い。',
    icon: '🎭'
  }
];

const QuizGame: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [bbStyle, setBBStyle] = useState<BBStyle | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<PokerQuestion | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [currentHand, setCurrentHand] = useState<Card[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [opponentStyle, setOpponentStyle] = useState(PLAYER_TYPES[0]);

  const DEFAULT_EXPLANATION = "このシチュエーションでは、ポジションとハンドの強さを考慮した判断が重要です。相手の特徴を活かしたプレイを心がけましょう。";

  const isDefaultExplanation = explanation === DEFAULT_EXPLANATION;

  const position = 'SB';

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

  useEffect(() => {
    generateNewHand();
  }, []);

  const generateNewHand = () => {
    const newHand = getRandomHand();
    const newOpponentStyle = PLAYER_TYPES[Math.floor(Math.random() * PLAYER_TYPES.length)];
    setCurrentHand(newHand);
    setOpponentStyle(newOpponentStyle);
    setCurrentQuestion(questions[currentQuestionIndex] as PokerQuestion);
    setExplanation("");
    setSelectedAnswer("");
    setIsCorrect(null);
  };

  const handleActionSelect = async (action: string) => {
    setSelectedAnswer(action);
    setIsGenerating(true);
    setExplanation("");
    
    try {
      const response = await fetch('/api/evaluate-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hand: currentHand,
          action: action,
          position: 'SB',
          bbStyle: opponentStyle
        }),
      });

      const data = await response.json();
      setIsCorrect(data.isCorrect);
      setExplanation(data.explanation);
    } catch (error) {
      console.error('Action evaluation failed:', error);
      setExplanation("申し訳ありません。解説の生成に失敗しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentQuestion || !bbStyle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-dark-bg bg-poker-pattern bg-opacity-95">
      <header className="bg-navy/95 backdrop-blur-sm shadow-lg border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GiWitchFlight className="text-gold text-3xl" />
            <span className="text-gold text-3xl font-poppins font-bold">GTOwitch</span>
          </div>
          <nav className="flex space-x-6">
            <button className="text-gold hover:text-gold-light transition-all duration-300 hover:scale-110">
              <FaHome className="text-xl" />
            </button>
            <button className="text-gold hover:text-gold-light transition-all duration-300 hover:scale-110">
              <FaChartBar className="text-xl" />
            </button>
            <button className="text-gold hover:text-gold-light transition-all duration-300 hover:scale-110">
              <FaCog className="text-xl" />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-dark-card/90 backdrop-blur-sm rounded-xl shadow-card p-4 border border-gold/10">
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-gold text-xl" />
              <div>
                <h3 className="text-gold font-medium">あなたのポジション</h3>
                <p className="text-white/90 text-lg font-semibold">SB</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-card/90 backdrop-blur-sm rounded-xl shadow-card p-4 border border-gold/10">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{opponentStyle.icon}</div>
              <div>
                <h3 className="text-gold font-medium">相手プレイヤーの特徴</h3>
                <p className="text-white/90">
                  {opponentStyle.category} ({opponentStyle.type})
                </p>
                <p className="text-white/80 text-sm mt-1">
                  {opponentStyle.characteristics}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-card/90 backdrop-blur-sm rounded-xl shadow-card p-8 mb-8 border border-gold/10">
          <h2 className="text-xl font-poppins font-semibold text-gold mb-4">あなたのハンド</h2>
          <div className="flex justify-center space-x-4">
            {currentHand.map((card, index) => (
              <motion.div
                key={`${card.rank}${card.suit}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <PokerCard 
                  suit={card.suit} 
                  rank={card.rank} 
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          {['Fold', 'Call', 'Raise 3BB'].map((action) => (
            <button
              key={action}
              onClick={() => handleActionSelect(action)}
              disabled={isGenerating}
              className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                selectedAnswer === action
                  ? 'bg-gold text-navy'
                  : 'bg-gold/20 hover:bg-gold/30 text-gold'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {action}
            </button>
          ))}
        </div>

        {selectedAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-card/90 backdrop-blur-sm rounded-xl shadow-card p-8 border border-gold/10"
          >
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center p-8">
                <ImSpinner8 className="text-gold text-3xl animate-spin mb-4" />
                <p className="text-gold text-lg">AIコーチが解説を生成中です...</p>
              </div>
            ) : (
              <div className={`mb-6 p-4 rounded-lg ${
                isCorrect
                  ? 'bg-green-500/20 border border-green-500'
                  : 'bg-red-500/20 border border-red-500'
              }`}>
                <h3 className={`text-xl font-poppins font-semibold mb-2 ${
                  isCorrect ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isCorrect ? '正解！' : '不正解'}
                </h3>
                <div className="mt-4 bg-navy/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GiWitchFlight className="text-gold text-xl" />
                    <span className="text-gold font-medium">AIコーチからのアドバイス</span>
                  </div>
                  <p className="text-white">{explanation}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="text-center mt-4">
          <button
            onClick={generateNewHand}
            className="bg-gold/20 hover:bg-gold/30 text-gold px-6 py-2 rounded-lg transition-all duration-300"
          >
            新しいハンドを配る
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuizGame; 