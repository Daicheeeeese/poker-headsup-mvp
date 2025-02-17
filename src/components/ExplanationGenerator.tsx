import React, { useState, useEffect } from 'react';
import { generatePokerExplanation } from '../utils/openai';

interface ExplanationGeneratorProps {
  hand: string;
  position: string;
  selectedAction: string;
  isCorrect: boolean;
}

const ExplanationGenerator: React.FC<ExplanationGeneratorProps> = ({
  hand,
  position,
  selectedAction,
  isCorrect
}) => {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getExplanation = async () => {
      setLoading(true);
      try {
        const generatedExplanation = await generatePokerExplanation(
          hand,
          position,
          selectedAction,
          isCorrect
        );
        setExplanation(generatedExplanation);
      } catch (error) {
        console.error('Error generating explanation:', error);
        setExplanation('解説の生成中にエラーが発生しました。');
      }
      setLoading(false);
    };

    if (selectedAction) {
      getExplanation();
    }
  }, [hand, position, selectedAction, isCorrect]);

  return (
    <div className="explanation-container bg-white rounded-xl p-6 shadow-sm">
      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-gray-600 font-medium">解説を生成中...</p>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-700 leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
};

export default ExplanationGenerator; 