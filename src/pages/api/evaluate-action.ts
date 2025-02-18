import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Card } from '../../types/types';

// OpenAIの設定をより堅牢に
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10000,
});

// スートの変換マップ
const suitMap: { [key: string]: string } = {
  'hearts': '♥',
  'diamonds': '♦',
  'clubs': '♣',
  'spades': '♠'
};

const actionMap: { [key: string]: string } = {
  'fold': 'フォールド',
  'call': 'コール',
  'raise': 'レイズ'
};

function formatHand(hand: Card[]): string {
  return hand.map(card => `${card.rank}${suitMap[card.suit]}`).join(' ');
}

// レスポンスの型定義を修正
type ApiResponse = {
  isCorrect?: boolean;
  explanation?: string;
  evAnalysis?: string;  // EV比較用のフィールドを追加
  error?: string;
  ev?: number;
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

    if (!hand || !action || !position || !bbStyle) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const handStrength = evaluateHandStrength(hand);
    
    // 全てのアクションのEVを計算
    const evs = {
      fold: calculateEV(handStrength, 'fold', position, bbStyle),
      call: calculateEV(handStrength, 'call', position, bbStyle),
      raise: calculateEV(handStrength, 'raise', position, bbStyle)
    };

    const maxEV = Math.max(...Object.values(evs));
    const bestAction = Object.entries(evs).find(([_, ev]) => ev === maxEV)?.[0];
    const selectedEV = calculateEV(handStrength, action, position, bbStyle);
    const isCorrect = action.toLowerCase() === bestAction;

    // プレイの解説とEV分析を別々に生成
    const { explanation, evAnalysis } = await generateExplanationAndAnalysis({
      hand,
      action,
      isCorrect,
      position,
      bbStyle,
      ev: selectedEV,
      evs,
      bestAction: bestAction || ''
    });

    return res.status(200).json({
      isCorrect,
      explanation,
      evAnalysis,
      ev: selectedEV
    });

  } catch (error: unknown) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error occurred' });
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

function calculateEV(
  handStrength: number,
  action: string,
  position: string,
  bbStyle: any
): number {
  const potSize = 1.5; // BBを1とした時のポットサイズ
  const callSize = 1; // コールのサイズ（BB単位）
  const raiseSize = 3; // レイズのサイズ（BB単位）
  
  // 相手のレンジに対する勝率の推定
  const winRate = handStrength / 100;
  
  // アクションごとのEV計算
  switch (action.toLowerCase()) {
    case 'fold':
      return 0; // フォールドのEVは常に0
      
    case 'call':
      // コールのEV = 勝率 * (ポット + コールサイズ) - (1 - 勝率) * コールサイズ
      return (winRate * (potSize + callSize)) - ((1 - winRate) * callSize);
      
    case 'raise':
      // レイズのEV = 相手がフォールドする確率 * 現在のポット + 
      //            相手がコールする確率 * (勝率 * (ポット + レイズサイズ * 2) - レイズサイズ)
      const foldEquity = calculateFoldEquity(bbStyle, handStrength);
      const callEquity = 1 - foldEquity;
      return (foldEquity * potSize) + 
             (callEquity * (winRate * (potSize + raiseSize * 2) - raiseSize));
      
    default:
      return 0;
  }
}

function calculateFoldEquity(bbStyle: any, handStrength: number): number {
  // 相手のスタイルに基づいてフォールド率を調整
  let baseFoldRate = 0.4; // デフォルトのフォールド率
  
  switch (bbStyle.type.toLowerCase()) {
    case 'tight':
      baseFoldRate += 0.1;
      break;
    case 'loose':
      baseFoldRate -= 0.1;
      break;
    case 'aggressive':
      baseFoldRate -= 0.15;
      break;
    case 'passive':
      baseFoldRate += 0.15;
      break;
  }
  
  // ハンドの強さに応じて調整
  const strengthAdjustment = (100 - handStrength) / 200; // 0.0 ~ 0.5の調整値
  
  return Math.max(0, Math.min(1, baseFoldRate + strengthAdjustment));
}

type ExplanationParams = {
  hand: Card[];
  action: string;
  isCorrect: boolean;
  position: string;
  bbStyle: {
    type: string;
    characteristics: string;
  };
  ev: number;
  evs: {
    fold: number;
    call: number;
    raise: number;
  };
  bestAction: string;
};

async function generateExplanationAndAnalysis(
  params: ExplanationParams
): Promise<{ explanation: string; evAnalysis: string }> {
  const { hand, action, isCorrect, position, bbStyle, evs, bestAction } = params;
  
  // actionJPとbestActionJPをtry-catchの外で定義
  const actionJP = actionMap[action.toLowerCase()] || action;
  const bestActionJP = actionMap[bestAction] || bestAction;

  try {
    const formattedHand = hand
      .map(card => `${card.rank}${suitMap[card.suit]}`)
      .join(' ');

    // シンプルで具体的なプロンプト
    const prompt = `
ハンド: ${formattedHand}
ポジション: ${position}
選択したアクション: ${actionJP}
相手のタイプ: ${bbStyle.type}
相手の特徴: ${bbStyle.characteristics}

このプレイは${isCorrect ? '最適な選択です' : `最適ではありません。最適な選択は${bestActionJP}です`}。
100文字程度で、このプレイの評価と理由を説明してください。`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "ポーカーのプロコーチとして、簡潔で具体的なアドバイスを提供してください。専門用語は避け、分かりやすい日本語で説明してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.5,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 0.8,
    });

    let explanation = response.choices[0]?.message?.content;

    // 応答がない場合のフォールバック
    if (!explanation) {
      if (isCorrect) {
        explanation = `${actionJP}は適切な判断です。${formattedHand}のハンドは${position}のポジションで${bbStyle.type}タイプの相手に対して良い選択肢となります。`;
      } else {
        explanation = `${actionJP}よりも${bestActionJP}の方が良い選択です。${formattedHand}のハンドは${position}のポジションで${bbStyle.type}タイプの相手に対しては${bestActionJP}が最適です。`;
      }
    }

    // 文章が完結していない場合の処理
    if (!explanation.endsWith('。')) {
      explanation += '。';
    }

    // EV分析の作成
    const evAnalysis = formatEVAnalysis(evs, action, bestAction);

    return {
      explanation,
      evAnalysis
    };

  } catch (error) {
    console.error('Generation error:', error);
    
    // エラー時のフォールバックメッセージ
    const fallbackExplanation = isCorrect
      ? `${actionJP}は適切な判断です。期待値計算からも最適な選択であることが分かります。`
      : `${actionJP}よりも${bestActionJP}の方が期待値が高く、より良い選択となります。`;

    return {
      explanation: fallbackExplanation,
      evAnalysis: formatEVAnalysis(evs, action, bestAction)
    };
  }
}

// EV分析のフォーマットをより見やすく改善
function formatEVAnalysis(
  evs: { [key: string]: number },
  selectedAction: string,
  bestAction: string
): string {
  const sortedActions = Object.entries(evs)
    .sort(([, a], [, b]) => b - a) // EVの高い順にソート
    .map(([action, ev]) => {
      const actionJP = actionMap[action];
      const evFormatted = ev.toFixed(2);
      const markers = [
        action === bestAction ? '👑' : '',
        action === selectedAction.toLowerCase() ? '➡️' : '',
      ].filter(Boolean).join(' ');
      
      return `${markers ? markers + ' ' : ''}${actionJP}: ${evFormatted}BB`;
    });

  return sortedActions.join('\n');
} 