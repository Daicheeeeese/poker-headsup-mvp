import OpenAI from 'openai';
import { Card } from '../types/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10000,
});

export async function generateExplanation(
  hand: Card[],
  action: string,
  isCorrect: boolean,
  position: string,
  bbStyle: any
): Promise<string> {
  const prompt = `
    ポーカーのヘッズアップで、${position}ポジションで${hand}を持っているプレイヤーが${action}を選択しました。
    これは${isCorrect ? '正しい' : '間違った'}選択です。
    150字以内で簡潔に解説してください。
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 100,
    temperature: 0.7,
  });

  return response.choices[0].message.content || "解説を生成できませんでした。";
}

// 必要に応じて他の関数をエクスポート 