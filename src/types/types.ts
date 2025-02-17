export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
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
  anti: number;
  position: string;
  bbStyle: BBStyle;
  scenario: {
    heroHand: Card[];
    potSize: number;
    stackSize: number;
  };
  options: string[];
  correctAnswer: string;
  explanation: string;
  wrongAnswerExplanations: {
    [key: string]: string;
  };
} 