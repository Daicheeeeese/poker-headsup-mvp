import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Card } from '../../utils/cardGenerator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// スートのシンボル変換
const suitSymbols: { [key: string]: string } = {
  'hearts': '♥',
  'diamonds': '♦',
  'clubs': '♣',
  'spades': '♠'
};

function formatHand(hand: Card[]): string {
  return hand.map(card => `${card.rank}${suitSymbols[card.suit]}`).join(' ');
}

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
  const formattedHand = formatHand(hand);

  const prompt = `
    ポーカーのヘッズアップシチュエーションについて、250字以内で解説してください。

    状況：
    - プレイヤーのポジション: ${position}
    - プレイヤーのハンド: ${formattedHand}
    - 選択したアクション: ${action}
    - 相手プレイヤーの特徴: ${bbStyle.category}（${bbStyle.type}）
    - 相手の傾向: ${bbStyle.characteristics}
    
    これは${isCorrect ? '正しい' : '間違った'}選択です。
    
    制約：
    - 必ず250字以内で解説してください
    - ポーカー用語を適切に使用してください
    - 相手の特徴を踏まえた具体的なアドバイスを含めてください
    - 結論を明確に示してください
    - 実践的な改善点を提示してください
    - カードの表記は${formattedHand}のように、数字とスートシンボル（♠♥♦♣）を使用してください
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたはポーカーのプロフェッショナルコーチです。250字以内で技術的な解説を提供してください。カードの表記には必ずスートシンボル（♠♥♦♣）を使用してください。"
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
    });

    let explanation = response.choices[0]?.message?.content || "解説を生成できませんでした。";

    // 文字数が250を超える場合は切り詰める
    if (explanation.length > 250) {
      const lastSentenceEnd = explanation.lastIndexOf('。', 250);
      if (lastSentenceEnd > 0) {
        explanation = explanation.substring(0, lastSentenceEnd + 1);
      } else {
        explanation = explanation.substring(0, 250) + '。';
      }
    }

    return explanation;
  } catch (error) {
    console.error('Error generating explanation:', error);
    return "申し訳ありません。解説の生成に失敗しました。";
  }
} 