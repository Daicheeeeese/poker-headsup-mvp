import React, { useState, useEffect } from 'react';
import { generateExplanation } from '../utils/openai';
import { Card } from '../types/types';

// カードの配列を文字列に変換する関数を追加
const formatHand = (hand: Card[]): string => {
  return hand.map(card => `${card.rank}${card.suit.charAt(0).toUpperCase()}`).join(' ');
};

interface ExplanationGeneratorProps {
  hand: Card[];
  position: string;
  selectedAction: string;
  isCorrect: boolean;
  bbStyle: {
    category: string;
    type: string;
    characteristics: string;
  };
}

const ExplanationGenerator: React.FC<ExplanationGeneratorProps> = ({
  hand,
  position,
  selectedAction,
  isCorrect,
  bbStyle
}) => {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateNewExplanation = async () => {
      setError(null);
      setLoading(true);
      try {
        const generatedExplanation = await generateExplanation(
          hand,
          selectedAction,
          isCorrect,
          position,
          bbStyle
        );
        setExplanation(generatedExplanation);
      } catch (err) {
        setError('説明の生成中にエラーが発生しました。');
        console.error('Explanation generation error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedAction) {
      generateNewExplanation();
    }
  }, [hand, position, selectedAction, isCorrect, bbStyle]);

  if (loading) {
    return <div>生成中...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      {explanation && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-white">{explanation}</p>
        </div>
      )}
    </div>
  );
};

export default ExplanationGenerator; 