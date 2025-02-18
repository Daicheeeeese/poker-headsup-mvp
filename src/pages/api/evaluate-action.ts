import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Card } from '../../utils/cardGenerator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { hand, action, position, bbStyle } = req.body;

    // ハンドの強さを評価
    const handStrength = evaluateHandStrength(hand);
    
    // アクションの適切性を評価
    const isCorrect = evaluateAction(handStrength, action, position);

    // OpenAIによる解説生成
    const explanation = await generateExplanation(hand, action, isCorrect, position, bbStyle);

    res.status(200).json({
      isCorrect,
      explanation
    });

  } catch (error) {
    console.error('Error in action evaluation:', error);
    res.status(500).json({ error: 'Action evaluation failed' });
  }
}

function evaluateHandStrength(hand: Card[]): number {
  // ハンドの強さを0-1の範囲で評価
  const rankValues: { [key: string]: number } = {
    'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10,
    '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
  };

  const [card1, card2] = hand;
  const isPaired = card1.rank === card2.rank;
  const isSuited = card1.suit === card2.suit;
  const highCard = Math.max(rankValues[card1.rank], rankValues[card2.rank]);
  const lowCard = Math.min(rankValues[card1.rank], rankValues[card2.rank]);

  let strength = 0;
  if (isPaired) strength = 0.5 + (rankValues[card1.rank] / 14) * 0.5;
  else if (isSuited) strength = 0.3 + (highCard / 14) * 0.4 + (lowCard / 14) * 0.3;
  else strength = 0.2 + (highCard / 14) * 0.4 + (lowCard / 14) * 0.2;

  return Math.min(1, strength);
}

function evaluateAction(handStrength: number, action: string, position: string): boolean {
  // ポジションとハンドの強さに基づいてアクションを評価
  if (handStrength > 0.8) {
    return action === 'Raise 3BB';
  } else if (handStrength > 0.5) {
    return action === 'Call';
  } else {
    return action === 'Fold';
  }
}

async function generateExplanation(
  hand: Card[],
  action: string,
  isCorrect: boolean,
  position: string,
  bbStyle: any
): Promise<string> {
  const prompt = `
    ポーカーのヘッズアップで、${position}ポジションで${hand[0].rank}${hand[0].suit} ${hand[1].rank}${hand[1].suit}を持っているプレイヤーが${action}を選択しました。
    これは${isCorrect ? '正しい' : '間違った'}選択です。
    相手プレイヤーは${bbStyle.characteristics}です。
    150〜200字で具体的なアドバイスを含めて解説してください。
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "あなたはポーカーのプロフェッショナルコーチです。技術的な解説を提供してください。"
      },
      { role: "user", content: prompt }
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "解説を生成できませんでした。";
} 