import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Card } from '../../types/types';

// OpenAIの設定をより堅牢に
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // 空文字をフォールバックとして設定
  timeout: 30000, // タイムアウトを30秒に延長
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

// レスポンスの型定義
type ApiResponse = {
  isCorrect?: boolean;
  explanation?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key is not configured' });
  }

  try {
    const { hand, action, position, bbStyle } = req.body;

    // 入力バリデーション
    if (!hand || !action || !position || !bbStyle) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // ハンドの強さを評価
    const handStrength = evaluateHandStrength(hand);
    
    // アクションの適切性を評価
    const isCorrect = evaluateAction(handStrength, action, position);

    try {
      // OpenAIによる解説生成
      const explanation = await generateExplanation(hand, action, isCorrect, position, bbStyle);
      
      res.status(200).json({
        isCorrect,
        explanation
      });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      res.status(500).json({
        isCorrect,
        explanation: '申し訳ありません。解説の生成中にエラーが発生しました。しばらく待ってから再度お試しください。'
      });
    }

  } catch (error) {
    console.error('General Error:', error);
    res.status(500).json({ error: 'Internal server error occurred' });
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

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたはポーカーのプロフェッショナルコーチです。250字以内で技術的な解説を提供してください。カードの表記には必ずスートシンボル（♠♥♦♣）を使用してください。"
        },
        {
          role: "user",
          content: `
            ポーカーのヘッズアップシチュエーションについて、250字以内で解説してください。

            状況：
            - プレイヤーのポジション: ${position}
            - プレイヤーのハンド: ${formattedHand}
            - 選択したアクション: ${action}
            - 相手プレイヤーの特徴: ${bbStyle.category}（${bbStyle.type}）
            - 相手の傾向: ${bbStyle.characteristics}
            
            これは${isCorrect ? '正しい' : '間違った'}選択です。
          `
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
    });

    let explanation = response.choices[0]?.message?.content || "解説を生成できませんでした。";

    if (explanation.length > 250) {
      const lastSentenceEnd = explanation.lastIndexOf('。', 250);
      explanation = lastSentenceEnd > 0 
        ? explanation.substring(0, lastSentenceEnd + 1)
        : explanation.substring(0, 250) + '。';
    }

    return explanation;

  } catch (error) {
    console.error('OpenAI API Error details:', error);
    throw new Error('Failed to generate explanation');
  }
} 