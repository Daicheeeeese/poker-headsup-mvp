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

// アクションの型を定義
type ActionType = 'fold' | 'call' | 'raise';

// EVsの型を定義
type EVs = {
  [key in ActionType]: number;
};

// EVの計算をOpenAIに依頼する関数
async function calculateEVWithAI(
  hand: Card[],
  action: ActionType,
  position: string,
  bbStyle: any
): Promise<number> {
  try {
    const formattedHand = hand
      .map(card => `${card.rank}${suitMap[card.suit]}`)
      .join(' ');

    const prompt = `
あなたはポーカーのEV計算の専門家です。
以下の状況でのEV（期待値）をgto solverを参考にして計算してください。わからない場合は、推測してください。
数値のみを返してください。

状況：
・自分のハンド: ${formattedHand}
・ポジション: ${position}
・アクション: ${actionMap[action]}
・相手の特徴: ${bbStyle.type} - ${bbStyle.characteristics}

考慮すべき点：
1. ハンドの強さ
2. ポジションの有利不利
3. 相手のプレイスタイル
4. アクションの妥当性

返答は数値のみでお願いします。`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたはポーカーのEV計算の専門家として、EV（期待値）をgto solverを参考にして計算又は推測します。数値のみを返します。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 10,
      temperature: 0.3,
    });

    const evText = response.choices[0]?.message?.content || "0";
    const ev = parseFloat(evText.trim());
    
    // 有効な数値でない場合やレンジ外の場合はデフォルト値を返す
    if (isNaN(ev) || ev < -5 || ev > 5) {
      console.warn('Invalid EV calculated:', evText);
      return getDefaultEV(action);
    }

    return ev;

  } catch (error) {
    console.error('EV calculation error:', error);
    return getDefaultEV(action);
  }
}

// デフォルトのEV値を返す関数
function getDefaultEV(action: ActionType): number {
  switch (action) {
    case 'fold': return 0;
    case 'call': return 1;
    case 'raise': return 1.5;
    default: return 0;
  }
}

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

    // アクションを正規化（"raise 3bb" → "raise"）
    const normalizedAction = action.toLowerCase().split(' ')[0] as ActionType;

    // 全てのアクションのEVを計算
    const evs: EVs = {
      fold: await calculateEVWithAI(hand, 'fold', position, bbStyle),
      call: await calculateEVWithAI(hand, 'call', position, bbStyle),
      raise: await calculateEVWithAI(hand, 'raise', position, bbStyle)
    };

    console.log('Calculated EVs:', evs); // デバッグ用

    // 最大EVを持つアクションを特定
    const maxEV = Math.max(...Object.values(evs));
    const bestAction = Object.entries(evs)
      .find(([_, ev]) => Math.abs(ev - maxEV) < 0.0001)?.[0] as ActionType || 'fold';

    // 選択されたアクションのEV
    const selectedEV = evs[normalizedAction];
    
    // 選択されたアクションが最大EVのアクションと一致するか確認
    const isCorrect = Math.abs(selectedEV - maxEV) < 0.0001;

    console.log('Decision details:', {  // デバッグ用
      selectedAction: normalizedAction,
      selectedEV,
      bestAction,
      maxEV,
      isCorrect
    });

    const { explanation, evAnalysis } = await generateExplanationAndAnalysis({
      hand,
      action: normalizedAction,
      isCorrect,
      position,
      bbStyle,
      ev: selectedEV,
      evs,
      bestAction
    });

    // EVの差を計算
    const evDifference = maxEV - selectedEV;

    // より詳細な説明を生成
    let detailedExplanation = await generateDetailedExplanation({
      selectedAction: normalizedAction,
      bestAction,
      evs,
      evDifference,
      isCorrect
    });

    return res.status(200).json({
      isCorrect,
      explanation: `${explanation}\n\n${detailedExplanation}`,
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

// ExplanationParamsの型も更新
type ExplanationParams = {
  hand: Card[];
  action: ActionType;
  isCorrect: boolean;
  position: string;
  bbStyle: {
    type: string;
    characteristics: string;
  };
  ev: number;
  evs: EVs;
  bestAction: ActionType;
};

async function generateExplanationAndAnalysis(
  params: ExplanationParams
): Promise<{ explanation: string; evAnalysis: string }> {
  const { hand, action, isCorrect, position, bbStyle, ev, evs, bestAction } = params;

  try {
    const safeEV = ev ?? evs[action] ?? 0;
    
    const formattedHand = hand
      .map(card => `${card.rank}${suitMap[card.suit]}`)
      .join(' ');

    const actionJP = actionMap[action] || action;
    const bestActionJP = actionMap[bestAction] || bestAction;

    // EVの分析文字列を生成
    const evAnalysisText = Object.entries(evs)
      .map(([act, val]) => `${actionMap[act]}: ${val.toFixed(2)}BB`)
      .join('\n');

    const prompt = `
ポーカーの状況分析:

■ 基本情報
・ストリート: プリフロップ
・あなたの位置: ${position}
・相手の位置: BB
・あなたのハンド: ${formattedHand}

■ アクション情報
・選択したアクション: ${actionJP}
・相手(BB)のタイプ: ${bbStyle.type}
・相手の特徴: ${bbStyle.characteristics}

■ 期待値分析
${evAnalysisText}

選択した${actionJP}は${isCorrect ? '最適な選択です' : '最適ではありません'}。
プリフロップの${position} vs BB の状況で、相手の特徴を考慮した150文字以内の解説を提供してください。`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "ポーカーのプロコーチとして、プリフロップのヘッズアップ状況（特に${position} vs BB）に特化した具体的なアドバイスを提供してください。EVの計算結果と一貫性のある解説を心がけてください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    });

    let explanation = response.choices[0]?.message?.content;

    if (!explanation) {
      explanation = generateFallbackExplanation(
        isCorrect,
        actionJP,
        bestActionJP,
        hand,
        position,
        bbStyle,
        safeEV,
        evs[bestAction]
      );
    }

    if (!explanation.endsWith('。')) {
      explanation += '。';
    }

    // EV分析の表示形式を改善
    const evAnalysis = formatEVAnalysis(evs, action, bestAction, position);

    return {
      explanation,
      evAnalysis
    };

  } catch (error) {
    console.error('Explanation generation error:', error);
    const actionJP = actionMap[action] || action;
    const bestActionJP = actionMap[bestAction] || bestAction;
    
    return {
      explanation: generateFallbackExplanation(
        isCorrect,
        actionJP,
        bestActionJP,
        hand,
        position,
        bbStyle,
        ev ?? 0,
        evs[bestAction]
      ),
      evAnalysis: formatEVAnalysis(evs, action, bestAction, position)
    };
  }
}

function generateFallbackExplanation(
  isCorrect: boolean,
  actionJP: string,
  bestActionJP: string,
  hand: Card[],
  position: string,
  bbStyle: any,
  ev: number,
  bestEV: number
): string {
  const formattedHand = hand
    .map(card => `${card.rank}${suitMap[card.suit]}`)
    .join(' ');

  if (isCorrect) {
    return `プリフロップの${position} vs BB の状況で、${formattedHand}のハンドを持ち、BBポジションの${bbStyle.type}タイプの相手に対して${actionJP}を選択したのは適切です。期待値${ev.toFixed(2)}BBは最も高い選択肢となっています。`;
  } else {
    return `プリフロップの${position} vs BB の状況で、${formattedHand}のハンドを持ち、BBポジションの${bbStyle.type}タイプの相手に対しては${bestActionJP}の方が良い選択です。期待値は${bestActionJP}が${bestEV.toFixed(2)}BBで、${actionJP}の${ev.toFixed(2)}BBより高くなります。`;
  }
}

// EVの分析表示を整形する関数を更新
function formatEVAnalysis(
  evs: EVs,
  selectedAction: ActionType,
  bestAction: ActionType,
  position: string
): string {
  // ヘッダー部分を修正してストリート情報を追加
  const header = `■ ストリート: プリフロップ\n■ ポジション情報\n・あなたの位置: ${position}\n・相手の位置: BB\n\n■ 期待値分析:\n`;
  
  const sortedActions = Object.entries(evs)
    .sort(([, a], [, b]) => b - a)
    .map(([action, ev]) => {
      const actionJP = actionMap[action];
      const evFormatted = ev.toFixed(2);
      const markers = [
        action === bestAction ? '👑 最適' : '',
        action === selectedAction.toLowerCase() ? '➡️ 選択' : '',
      ].filter(Boolean).join(' ');
      
      return `${markers ? `${markers}: ` : ''}${actionJP}: ${evFormatted}BB`;
    });

  return header + sortedActions.join('\n');
}

// 詳細な説明を生成する関数を追加
async function generateDetailedExplanation({
  selectedAction,
  bestAction,
  evs,
  evDifference,
  isCorrect
}: {
  selectedAction: ActionType;
  bestAction: ActionType;
  evs: EVs;
  evDifference: number;
  isCorrect: boolean;
}): Promise<string> {
  if (isCorrect) {
    return `${actionMap[selectedAction]}は最適な選択です。期待値(${evs[selectedAction].toFixed(2)})が最も高いアクションを選択できました。`;
  } else {
    return `${actionMap[selectedAction]}の期待値は${evs[selectedAction].toFixed(2)}ですが、${actionMap[bestAction]}の期待値(${evs[bestAction].toFixed(2)})の方が${evDifference.toFixed(2)}高くなります。より良い選択肢が存在します。`;
  }
} 