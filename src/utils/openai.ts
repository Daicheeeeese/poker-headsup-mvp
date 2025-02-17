import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export async function generatePokerExplanation(
  hand: string,
  position: string,
  action: string,
  isCorrect: boolean
): Promise<string> {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    console.error('OpenAI API key is not set');
    return "APIキーが設定されていないため、解説を生成できません。";
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたはポーカーのプロプレイヤーです。100文字程度で簡潔な解説を提供してください。必ず文章を完結させてください。"
        },
        {
          role: "user",
          content: `
            以下の状況について、100文字程度で簡潔に解説してください。
            必ず文章を完結させ、途中で終わらないようにしてください。

            - ハンド: ${hand}
            - ポジション: ${position}
            - アクション: ${action}
            - 正解/不正解: ${isCorrect}

            ポイント（簡潔に）：
            1. ハンドの特徴
            2. ポジションでの適切な戦略
            3. 選択したアクションの評価
          `
        }
      ],
      temperature: 0.7,
      max_tokens: 200, // 余裕を持って設定
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
    });

    let response = completion.choices[0].message.content || "解説を生成できませんでした。";
    
    // 最後の文が途中で切れている場合は、最後の完全な文までを取得
    const sentences = response.match(/[^。！？]+[。！？]/g) || [];
    if (sentences.length > 0) {
      response = sentences.join('');
    }

    // 文字数制限（ただし、文章の途中で切らない）
    if (response.length > 130) {
      const truncatedSentences = [];
      let totalLength = 0;
      
      for (const sentence of sentences) {
        if (totalLength + sentence.length <= 130) {
          truncatedSentences.push(sentence);
          totalLength += sentence.length;
        } else {
          break;
        }
      }
      
      response = truncatedSentences.join('');
    }

    return response;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return "解説の生成中にエラーが発生しました。";
  }
} 