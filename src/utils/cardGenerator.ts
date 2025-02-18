// カードの型定義
export interface Card {
  rank: string;
  suit: string;
}

// 全てのランクとスート
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];

// デッキを生成する関数
function generateDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

// デッキをシャッフルする関数
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ランダムな2枚のカードを取得する関数
export function getRandomHand(): Card[] {
  const deck = generateDeck();
  const shuffledDeck = shuffleDeck(deck);
  return shuffledDeck.slice(0, 2);
} 