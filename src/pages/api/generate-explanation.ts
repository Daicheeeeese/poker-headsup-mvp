import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

interface Card {
  rank: string;
  suit: string;
}

interface BBStyle {
  category: string;
  type: string;
  characteristics: string;
}

// APIキーの検証
function isValidApiKey(apiKey: string | undefined): boolean {
  return typeof apiKey === 'string' && apiKey.startsWith('sk-') && apiKey.length > 20;
}

// 入力データの検証
function validateInput(data: any): { isValid: boolean; message: string } {
  if (!data.hand || !Array.isArray(data.hand) || data.hand.length !== 2) {
    return { isValid: false, message: 'Invalid hand data' };
  }
  if (!data.action) {
    return { isValid: false, message: 'Missing action' };
  }
  if (!data.position) {
    return { isValid: false, message: 'Missing position' };
  }
  if (!data.bbStyle || !data.bbStyle.category || !data.bbStyle.type) {
    return { isValid: false, message: 'Invalid bbStyle data' };
  }
  return { isValid: true, message: 'Valid input' };
}

function formatHand(hand: Card[]): string {
  try {
    const suitSymbols: { [key: string]: string } = {
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣',
      'spades': '♠'
    };

    return Array.isArray(hand) 
      ? hand.map(card => `${card.rank}${suitSymbols[card.suit]}`).join(' ')
      : 'Unknown Hand';
  } catch (error) {
    console.error('Hand formatting error:', error);
    return 'Unknown Hand';
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10000, // タイムアウトはここで設定
});

// バックアップの解説生成関数
async function generateBackupExplanation(data: any): Promise<string> {
  const { position, action, isCorrect } = data;
  const baseExplanation = `${position}ポジションからの${action}は、`;
  const correctnessText = isCorrect ? '正しい選択です。' : '最適ではありません。';
  const advice = isCorrect 
    ? 'このような積極的なプレイを継続しましょう。'
    : 'より慎重なアプローチを検討してください。';
  
  return `${baseExplanation}${correctnessText}${advice}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // APIキーの検証
  if (!isValidApiKey(process.env.OPENAI_API_KEY)) {
    console.error('Invalid API key configuration');
    const backupExplanation = await generateBackupExplanation(req.body);
    return res.status(200).json({ explanation: backupExplanation });
  }

  // 入力データの検証
  const validation = validateInput(req.body);
  if (!validation.isValid) {
    console.error('Input validation failed:', validation.message);
    const backupExplanation = await generateBackupExplanation(req.body);
    return res.status(200).json({ explanation: backupExplanation });
  }

  // 最大3回まで再試行する関数
  const generateExplanationWithRetry = async (prompt: string, retryCount = 0): Promise<string> => {
    try {
      console.log(`Attempting explanation generation (attempt ${retryCount + 1})`);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "あなたはポーカーのプロフェッショナルコーチです。技術的な解説を150〜200字の範囲で提供してください。必ず具体的なアドバイスを含めてください。"
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.5,
      });

      const explanation = response.choices[0]?.message?.content;
      
      if (!explanation || explanation.length < 150 || explanation.length > 200) {
        console.log(`Generated explanation length: ${explanation?.length || 0} chars`);
        if (retryCount < 2) {
          return generateExplanationWithRetry(prompt, retryCount + 1);
        }
      }

      return explanation || await generateBackupExplanation(req.body);
    } catch (error) {
      console.error(`Error in attempt ${retryCount + 1}:`, error);
      if (retryCount < 2) {
        return generateExplanationWithRetry(prompt, retryCount + 1);
      }
      throw error;
    }
  };

  try {
    const { hand, action, isCorrect, position, bbStyle } = req.body;
    const formattedHand = formatHand(hand);

    const prompt = `
      ポーカーのヘッズアップシチュエーションについて、150〜200字で解説してください。

      状況：
      - プレイヤーのポジション: ${position}
      - プレイヤーのハンド: ${formattedHand}
      - 選択したアクション: ${action}
      - 相手プレイヤーの特徴: ${bbStyle.category}（${bbStyle.type}）
      - 相手の傾向: ${bbStyle.characteristics}
      
      これは${isCorrect ? '正しい' : '間違った'}選択です。
      
      制約：
      - 必ず150字以上、200字以内で解説してください
      - ポーカー用語を適切に使用してください
      - 相手の特徴を踏まえた具体的なアドバイスを含めてください
      - 結論を明確に示してください
      - 実践的で具体的な改善点を提示してください
    `;

    const explanation = await generateExplanationWithRetry(prompt);
    return res.status(200).json({ explanation });

  } catch (error) {
    console.error('Final error in explanation generation:', error);
    const backupExplanation = await generateBackupExplanation(req.body);
    return res.status(200).json({ explanation: backupExplanation });
  }
} 