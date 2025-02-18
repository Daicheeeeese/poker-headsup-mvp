export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
export type BBStyle = 'aggressive' | 'passive' | 'balanced';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type BBCategory = 'Turtle' | 'Caller' | 'Viking' | 'Hunter' | 'Gambler';

export interface BBStyle {
  category: BBCategory;
  type: string;
  characteristics: string;
  strategy: string;
}

export interface PokerQuestion {
  id: string;
  street: string;
  position: string;
  scenario: {
    heroHand: Card[];
    potSize: number;
    stackSize: number;
  };
  correctAnswer: string;
  bbStyles: BBStyle[];
} 