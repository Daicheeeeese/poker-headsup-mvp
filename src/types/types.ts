export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
export type BBStyleType = 'aggressive' | 'passive' | 'balanced';

export interface Card {
  rank: string;
  suit: string;
}

export type BBCategory = 'Turtle' | 'Caller' | 'Viking' | 'Hunter' | 'Gambler';

export interface BBStyle {
  type: BBStyleType;
  category: string;
  characteristics: string;
}

export interface PokerQuestion {
  id: string;
  street: string;
  position: string;
  anti: number;
  scenario: {
    heroHand: Card[];
    potSize: number;
    stackSize: number;
  };
  correctAnswer: string;
  bbStyles: BBStyle[];
  options: string[];
} 