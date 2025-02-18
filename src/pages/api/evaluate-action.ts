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
    const selectedAction = action.toLowerCase() as ActionType;
    const selectedEV = evs[selectedAction];
    
    // 選択されたアクションが最大EVのアクションと一致するか確認
    const isCorrect = Math.abs(selectedEV - maxEV) < 0.0001;

    console.log('Decision details:', {  // デバッグ用
      selectedAction,
      selectedEV,
      bestAction,
      maxEV,
      isCorrect
    });

    const { explanation, evAnalysis } = await generateExplanationAndAnalysis({
      hand,
      action: selectedAction,
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
      selectedAction,
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
    console.log('Generating explanation for action:', {
      action,
      evs,
      bestAction,
      isCorrect
    });

    const formattedHand = hand
      .map(card => `${card.rank}${suitMap[card.suit]}`)
      .join(' ');

    const actionJP = actionMap[action.toLowerCase()] || action;
    const bestActionJP = actionMap[bestAction] || bestAction;

    // EVの差を計算
    const evDifference = Math.abs(evs[bestAction] - ev);

    console.log('Prompt parameters:', {
      formattedHand,
      actionJP,
      bestActionJP,
      ev,
      evDifference
    });

    const prompt = `
ポーカーのヘッズアップ状況の分析:
ハンド: ${formattedHand}
ポジション: ${position}
選択: ${actionJP} (EV: ${ev.toFixed(2)})
相手: ${bbStyle.type} - ${bbStyle.characteristics}

各アクションのEV:
${Object.entries(evs)
  .map(([act, val]) => `${actionMap[act]}: ${val.toFixed(2)}`)
  .join(', ')}

最適なアクション: ${bestActionJP} (EV: ${evs[bestAction].toFixed(2)})

以下の点を考慮して、150文字以内で一貫性のある解説を生成してください：
1. 選択されたアクションの評価
2. ハンドの強さ
3. ポジションの影響
4. 相手のプレイスタイル
5. EVの結果との整合性

解説は必ず、選択されたアクションが${isCorrect ? '最適である' : 'より良い選択が存在する'}という結論と一致するようにしてください。`;

    console.log('Sending prompt to OpenAI:', prompt);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたはポーカーのプロコーチです。EVの計算結果と一貫性のある解説を提供してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    console.log('OpenAI response:', response.choices[0]?.message);

    let explanation = response.choices[0]?.message?.content;

    if (!explanation) {
      console.warn('No explanation generated from OpenAI');
      explanation = getDefaultExplanation(isCorrect, action, bestAction);
    }

    // 文章が完結していない場合の処理
    if (!explanation.endsWith('。')) {
      explanation += '。';
    }

    // EV分析の文字列を生成
    const evAnalysis = formatEVAnalysis(evs, action, bestAction);

    return {
      explanation,
      evAnalysis
    };

  } catch (error) {
    console.error('Detailed explanation generation error:', {
      error,
      params: {
        action,
        isCorrect,
        ev,
        evs,
        bestAction
      }
    });
    
    return {
      explanation: getDefaultExplanation(isCorrect, action, bestAction),
      evAnalysis: formatEVAnalysis(evs, action, bestAction)
    };
  }
}

// デフォルトの説明を生成する関数を修正
function getDefaultExplanation(
  isCorrect: boolean,
  action: string,
  bestAction: string
): string {
  const actionJP = actionMap[action.toLowerCase()] || action;
  const bestActionJP = actionMap[bestAction] || bestAction;

  if (isCorrect) {
    return `${actionJP}は状況に応じた最適な選択です。期待値の計算からも、このアクションが最も有利であることが分かります。`;
  } else {
    return `${actionJP}よりも${bestActionJP}の方が期待値が高く、より良い選択となります。状況を考慮すると、${bestActionJP}が最適な判断です。`;
  }
}

// EVの分析表示を整形する関数
function formatEVAnalysis(
  evs: EVs,
  selectedAction: ActionType,
  bestAction: ActionType
): string {
  const sortedActions = Object.entries(evs)
    .sort(([, a], [, b]) => b - a)
    .map(([action, ev]) => {
      const actionJP = actionMap[action];
      const evFormatted = ev.toFixed(2);
      const markers = [
        action === bestAction ? '👑' : '',
        action === selectedAction.toLowerCase() ? '➡️' : '',
      ].filter(Boolean).join(' ');
      
      return `${markers ? `${markers} ` : ''}${actionJP}: ${evFormatted}BB`;
    });

  return sortedActions.join('\n');
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