import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Card } from '../../types/types';

// OpenAIの設定をより堅牢に
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // 空文字をフォールバックとして設定
  timeout: 60000, // タイムアウトをさらに延長
});

// スートの変換マップ
const suitMap: { [key: string]: string } = {
  'hearts': '♥',
  'diamonds': '♦',
  'clubs': '♣',
  'spades': '♠'
};

function formatHand(hand: Card[]): string {
  return hand.map(card => `${card.rank}${suitMap[card.suit]}`).join(' ');
}

// レスポンスの型定義を修正
type ApiResponse = {
  isCorrect?: boolean;
  explanation?: string;
  error?: string;
  details?: string; // details プロパティを追加
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  console.log('API Handler: Started'); // デバッグログ

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('API Key is missing'); // デバッグログ
    return res.status(500).json({ error: 'OpenAI API key is not configured' });
  }

  try {
    console.log('Request body:', JSON.stringify(req.body)); // デバッグログ
    const { hand, action, position, bbStyle } = req.body;

    // 入力バリデーション
    if (!hand || !action || !position || !bbStyle) {
      console.error('Missing parameters:', { hand, action, position, bbStyle }); // デバッグログ
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // ハンドの強さを評価
    const handStrength = evaluateHandStrength(hand);
    
    // アクションの適切性を評価
    const isCorrect = evaluateAction(handStrength, action, position);

    console.log('Generating explanation...'); // デバッグログ
    const explanation = await generateExplanation(hand, action, isCorrect, position, bbStyle);
    console.log('Explanation generated successfully'); // デバッグログ

    return res.status(200).json({
      isCorrect,
      explanation
    });

  } catch (error: unknown) {
    console.error('Detailed error:', error); // デバッグログ
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      error: 'Internal server error occurred',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
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
  try {
    // ハンドを読みやすい形式に変換
    const formattedHand = hand.map(card => 
      `${card.rank}${suitMap[card.suit]}`
    ).join(' ');

    // アクションの日本語表記
    const actionMap: { [key: string]: string } = {
      'fold': 'フォールド',
      'call': 'コール',
      'raise': 'レイズ'
    };
    const actionJP = actionMap[action] || action;

    // シンプルで明確なプロンプト
    const prompt = `
以下のポーカーの状況について、100文字程度で簡潔に解説してください：

状況：
・あなたの位置：${position}
・ハンド：${formattedHand}
・選択：${actionJP}
・相手タイプ：${bbStyle.type}
・相手の特徴：${bbStyle.characteristics}

この選択は${isCorrect ? '適切' : '不適切'}です。その理由と、より良いプレイについて説明してください。
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたはポーカーのプロコーチです。簡潔で実践的なアドバイスを提供してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    let explanation = response.choices[0]?.message?.content;

    if (!explanation) {
      return "申し訳ありません。解説を生成できませんでした。もう一度お試しください。";
    }

    // 文字数制限（必要な場合のみ）
    if (explanation.length > 150) {
      const lastSentenceEnd = explanation.lastIndexOf('。', 150);
      if (lastSentenceEnd > 0) {
        explanation = explanation.substring(0, lastSentenceEnd + 1);
      }
    }

    return explanation;

  } catch (error: unknown) {
    console.error('OpenAI API Error:', error);
    
    if (error instanceof Error) {
      const openAIError = error as any;
      if (openAIError.code === 'insufficient_quota') {
        return "API制限に達しました。しばらく待ってから再度お試しください。";
      }
      if (openAIError.code === 'rate_limit_exceeded') {
        return "リクエストが集中しています。少し待ってから再度お試しください。";
      }
    }
    
    return "解説の生成に失敗しました。もう一度お試しください。";
  }
} 