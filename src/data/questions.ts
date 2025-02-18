import { PokerQuestion, Suit, Rank, BBStyle } from '../types/types';

const bbStyles: BBStyle[] = [
  {
    type: 'aggressive',
    category: 'LAG',
    characteristics: 'ブラフが多く、アグレッシブなプレイスタイル'
  },
  {
    type: 'passive',
    category: 'TAG',
    characteristics: 'タイトでコントロールされたプレイスタイル'
  },
  {
    type: 'balanced',
    category: 'REG',
    characteristics: 'バランスの取れた標準的なプレイスタイル'
  }
];

// 基本の問題データを定義（BBスタイル以外の情報）
const baseQuestions = [
  {
    id: '1',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: 'A' as Rank },
        { suit: 'spades' as Suit, rank: 'K' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Raise 3BB', 'Raise 4BB', 'Limp', 'Fold'],
    correctAnswer: 'Raise 3BB',
    explanation: 'AAはプリフロップで最強のハンドです。SBからは必ずレイズすべきです。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。より大きなサイズでバリューを得るべきです。',
      'Raise 2.5BB': '2.5BBは小さすぎるサイズです。AAではより大きなサイズでプレイすべきです。',
      'Raise 4BB': '4BBは大きすぎるサイズです。相手のフォールドを誘発しすぎる可能性があります。',
      'Limp': 'AAでリンプするのは価値を逃がします。レイズしてバリューを得るべきです。',
      'Fold': 'AAをフォールドするのは明らかな間違いです。'
    }
  },
  {
    id: '2',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Caller,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: 'Q' as Rank },
        { suit: 'hearts' as Suit, rank: 'Q' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Raise 3BB', 'Raise 4BB', 'Limp', 'Fold'],
    correctAnswer: 'Raise 2.5BB',
    explanation: 'QQは非常に強いハンドです。2.5BBのレイズサイズで、BBからの3betを誘うことができます。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。QQのような強いハンドの価値を最大限に活かせません。',
      'Raise 3BB': '3BBは大きすぎるサイズです。BBの強いハンドだけが残り、価値べットの機会を失います。',
      'Raise 4BB': '4BBは明らかに大きすぎます。ハンドの強さを露呈し、アクションを得られなくなります。',
      'Limp': 'QQをリンプすることは、ハンドの価値を大きく損なうプレイです。BBに安価にフロップを見せることになります。',
      'Fold': 'QQはプレミアムハンドです。フォールドすることは、大きな価値を捨てることになります。'
    }
  },
  // スーテッドエース
  {
    id: '3',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Viking,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: 'A' as Rank },
        { suit: 'hearts' as Suit, rank: '8' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Raise 3BB', 'Limp', 'Fold'],
    correctAnswer: 'Raise 2.5BB',
    explanation: 'A8sはミドルスーテッドエースで、ナッツフラッシュの可能性があります。BTNからは標準的なレイズサイズで攻めていきます。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。BBに簡単にコールを許してしまい、ポストフロップでの駆け引きが難しくなります。',
      'Raise 3BB': '3BBは大きすぎるサイズです。BBの良いハンドだけが残り、価値べットの機会を失います。',
      'Fold': 'A8sはBTNからフォールドするには強すぎるハンドです。ナッツフラッシュの可能性があり、プレイしやすいハンドです。',
      'Limp': 'BTNからのリンプは推奨されません。ポジション優位を活かせず、ポストフロップでの選択肢が限られます。'
    }
  },
  // スーテッドコネクター
  {
    id: '4',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Hunter,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: 'T' as Rank },
        { suit: 'diamonds' as Suit, rank: 'T' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Raise 3BB', 'Limp', 'Fold'],
    correctAnswer: 'Raise 2.5BB',
    explanation: 'TTは強いペアで、BTNからは積極的にレイズします。ポストフロップでオーバーカードが出ても、相手のレンジを考慮して対応できます。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。TTのような強いハンドの価値を最大限に活かせません。',
      'Raise 3BB': '3BBは大きすぎるサイズです。BBの良いハンドだけが残り、価値べットの機会を失います。',
      'Limp': 'TTをリンプすることは、ハンドの価値を大きく損なうプレイです。BBに安価にフロップを見せることになります。',
      'Fold': 'TTはBTNからフォールドするには強すぎるハンドです。セットの可能性もあり、プレイしやすいハンドです。'
    }
  },
  // ブロードウェイ
  {
    id: '5',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Gambler,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: '7' as Rank },
        { suit: 'hearts' as Suit, rank: '6' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Limp', 'Fold'],
    correctAnswer: 'Raise 2.5BB',
    explanation: '76sはスーテッドコネクターで、ストレートやフラッシュの可能性があります。BTNからは標準的なレイズサイズで攻めていきます。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。BBに簡単にコールを許してしまい、ポストフロップでの駆け引きが難しくなります。',
      'Fold': '76sはBTNからフォールドするには強すぎるハンドです。ストレートやフラッシュの可能性があり、プレイしやすいハンドです。',
      'Limp': 'BTNからのリンプは推奨されません。ポジション優位を活かせず、ポストフロップでの選択肢が限られます。'
    }
  },
  {
    id: '6',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Turtle,
    scenario: {
      heroHand: [
        { suit: 'clubs' as Suit, rank: 'Q' as Rank },
        { suit: 'diamonds' as Suit, rank: 'T' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Limp', 'Fold'],
    correctAnswer: 'Raise 2.5BB',
    explanation: 'QToはブロードウェイで、トップペアを作る可能性があります。BTNからは標準的なレイズサイズで攻めていきます。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。BBに簡単にコールを許してしまい、ポストフロップでの駆け引きが難しくなります。',
      'Fold': 'QToはBTNからフォールドするには強すぎるハンドです。トップペアを作る可能性があり、プレイしやすいハンドです。',
      'Limp': 'BTNからのリンプは推奨されません。ポジション優位を活かせず、ポストフロップでの選択肢が限られます。'
    }
  },
  // ミドルペア
  {
    id: '7',
    street: 'preflop',
    position: 'SB',
    bbStyle: bbStyles.Hunter,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: '8' as Rank },
        { suit: 'diamonds' as Suit, rank: '8' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Fold', 'Limp'],
    correctAnswer: 'Raise 2.5BB',
    explanation: '88はBTNからレイズして問題ないハンドです。ポストフロップでセットを作る可能性もあり、オーバーカードが出ても降りやすい状況を作れます。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。BBに簡単にコールを許してしまい、ポストフロップでの駆け引きが難しくなります。',
      'Fold': '88はBTNからフォールドするには強すぎるハンドです。セットを作る可能性があり、適切なサイズでレイズすべきです。',
      'Limp': 'BTNからのリンプは推奨されません。ポジション優位を活かせず、ポストフロップでの選択肢が限られます。'
    }
  },
  // スーテッドギャップ
  {
    id: '8',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Viking,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: '9' as Rank },
        { suit: 'hearts' as Suit, rank: '7' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Fold', 'Limp'],
    correctAnswer: 'Raise 2.5BB',
    explanation: '97sはスーテッドギャップで、ストレートやフラッシュの可能性があります。BTNからはレイズして問題ありません。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。BBに簡単にコールを許してしまい、ポストフロップでの駆け引きが難しくなります。',
      'Fold': '97sはBTNからフォールドするには強すぎるハンドです。フラッシュやストレートの可能性があり、プレイしやすいハンドです。',
      'Limp': 'BTNからのリンプは推奨されません。ポジション優位を活かせず、ポストフロップでの選択肢が限られます。'
    }
  },
  // 弱いエース
  {
    id: '9',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Caller,
    scenario: {
      heroHand: [
        { suit: 'clubs' as Suit, rank: 'A' as Rank },
        { suit: 'diamonds' as Suit, rank: '2' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Fold', 'Limp'],
    correctAnswer: 'Fold',
    explanation: 'A2oは弱いエースで、ポストフロップの対戦が難しくなります。BTNでもフォールドが推奨されます。',
    wrongAnswerExplanations: {
      'Raise 2BB': 'A2oでレイズすることは推奨されません。ポストフロップでの対戦が難しく、多くの場合ドミネートされています。',
      'Raise 2.5BB': 'A2oは弱すぎるハンドです。レイズしてもポストフロップでの対戦が難しく、価値を見出すことが困難です。',
      'Limp': 'BTNからのリンプは推奨されません。特に弱いハンドの場合、ポストフロップでの対戦がさらに難しくなります。'
    }
  },
  // 弱いスーテッドコネクター
  {
    id: '10',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Gambler,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: '4' as Rank },
        { suit: 'hearts' as Suit, rank: '3' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Fold', 'Limp'],
    correctAnswer: 'Fold',
    explanation: '43sは弱いスーテッドコネクターです。ポストフロップでも強いハンドを作りにくく、BTNでもフォールドが推奨されます。',
    wrongAnswerExplanations: {
      'Raise 2BB': '43sでレイズすることは推奨されません。ポストフロップでの対戦が難しく、強いハンドを作りにくいです。',
      'Raise 2.5BB': '43sは弱すぎるハンドです。レイズしてもポストフロップでの対戦が難しく、価値を見出すことが困難です。',
      'Limp': 'BTNからのリンプは推奨されません。特に弱いハンドの場合、ポストフロップでの対戦がさらに難しくなります。'
    }
  },
  // 強いブロードウェイ
  {
    id: '11',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Hunter,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: 'K' as Rank },
        { suit: 'hearts' as Suit, rank: 'Q' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Raise 3BB', 'Raise 4BB'],
    correctAnswer: 'Raise 2.5BB',
    explanation: 'KQsは非常に強いハンドです。スーテッドで、トップペアやフラッシュの可能性もあり、BTNからは積極的にレイズします。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。KQsのような強いハンドの価値を最大限に活かせません。',
      'Raise 3BB': '3BBは大きすぎるサイズです。BBの良いハンドだけが残り、価値べットの機会を失います。',
      'Raise 4BB': '4BBは明らかに大きすぎます。ハンドの強さを露呈し、アクションを得られなくなります。'
    }
  },
  // ミドルスーテッドエース
  {
    id: '12',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Turtle,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: 'A' as Rank },
        { suit: 'hearts' as Suit, rank: '8' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Fold', 'Limp'],
    correctAnswer: 'Raise 2.5BB',
    explanation: 'A8sはミドルスーテッドエースで、ナッツフラッシュの可能性があります。BTNからは標準的なレイズサイズで攻めていきます。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。BBに簡単にコールを許してしまい、ポストフロップでの駆け引きが難しくなります。',
      'Fold': 'A8sはBTNからフォールドするには強すぎるハンドです。ナッツフラッシュの可能性があり、プレイしやすいハンドです。',
      'Limp': 'BTNからのリンプは推奨されません。ポジション優位を活かせず、ポストフロップでの選択肢が限られます。'
    }
  },
  // 弱いブロードウェイ
  {
    id: '13',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Viking,
    scenario: {
      heroHand: [
        { suit: 'clubs' as Suit, rank: 'Q' as Rank },
        { suit: 'diamonds' as Suit, rank: 'T' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Fold', 'Limp'],
    correctAnswer: 'Raise 2.5BB',
    explanation: 'QToはやや弱いブロードウェイですが、BTNからはレイズして問題ありません。ポストフロップでトップペアを作る可能性もあります。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。BBに簡単にコールを許してしまい、ポストフロップでの駆け引きが難しくなります。',
      'Fold': 'QToはBTNからフォールドするには強すぎるハンドです。トップペアを作る可能性があり、プレイしやすいハンドです。',
      'Limp': 'BTNからのリンプは推奨されません。ポジション優位を活かせず、ポストフロップでの選択肢が限られます。'
    }
  },
  // 強いペア
  {
    id: '14',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Hunter,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: 'T' as Rank },
        { suit: 'diamonds' as Suit, rank: 'T' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Raise 3BB', 'Limp'],
    correctAnswer: 'Raise 2.5BB',
    explanation: 'TTは強いペアで、BTNからは積極的にレイズします。ポストフロップでオーバーカードが出ても、相手のレンジを考慮して対応できます。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。TTのような強いハンドの価値を最大限に活かせません。',
      'Raise 3BB': '3BBは大きすぎるサイズです。BBの良いハンドだけが残り、価値べットの機会を失います。',
      'Limp': 'TTをリンプすることは、ハンドの価値を大きく損なうプレイです。BBに安価にフロップを見せることになります。'
    }
  },
  // スーテッドブロードウェイ
  {
    id: '15',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Gambler,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: 'J' as Rank },
        { suit: 'hearts' as Suit, rank: 'T' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Fold', 'Limp'],
    correctAnswer: 'Raise 2.5BB',
    explanation: 'JTsはスーテッドブロードウェイで、ストレートやフラッシュの可能性があります。BTNからは標準的なレイズサイズで攻めていきます。',
    wrongAnswerExplanations: {
      'Raise 2BB': '2BBは小さすぎるサイズです。BBに簡単にコールを許してしまい、ポストフロップでの駆け引きが難しくなります。',
      'Fold': 'JTsはBTNからフォールドするには強すぎるハンドです。ストレートやフラッシュの可能性があり、プレイしやすいハンドです。',
      'Limp': 'BTNからのリンプは推奨されません。ポジション優位を活かせず、ポストフロップでの選択肢が限られます。'
    }
  },
  // 弱いペア
  {
    id: '16',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Turtle,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: '2' as Rank },
        { suit: 'diamonds' as Suit, rank: '2' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Fold', 'Limp'],
    correctAnswer: 'Fold',
    explanation: '22は最も弱いペアで、BTNからのレイズには適していません。セットを作る確率は低く、ポストフロップの対戦が難しくなります。',
    wrongAnswerExplanations: {
      'Raise 2BB': '22でレイズすることは推奨されません。ポストフロップでの対戦が難しく、多くの場合オーバーカードに直面します。',
      'Raise 2.5BB': '22は弱すぎるハンドです。レイズしてもポストフロップでの対戦が難しく、価値を見出すことが困難です。',
      'Limp': 'BTNからのリンプは推奨されません。特に弱いハンドの場合、ポストフロップでの対戦がさらに難しくなります。'
    }
  },
  // 限界的なハンド
  {
    id: '17',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Caller,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: '4' as Rank },
        { suit: 'hearts' as Suit, rank: '3' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Limp', 'Fold'],
    correctAnswer: 'Fold',
    explanation: '43sは弱いスーテッドコネクターです。ポストフロップでも強いハンドを作りにくく、BTNでもフォールドが推奨されます。',
    wrongAnswerExplanations: {
      'Raise 2BB': '43sでレイズすることは推奨されません。ポストフロップでの対戦が難しく、強いハンドを作りにくいです。',
      'Raise 2.5BB': '43sは弱すぎるハンドです。レイズしてもポストフロップでの対戦が難しく、価値を見出すことが困難です。',
      'Limp': 'BTNからのリンプは推奨されません。特に弱いハンドの場合、ポストフロップでの対戦がさらに難しくなります。'
    }
  },
  {
    id: '18',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Gambler,
    scenario: {
      heroHand: [
        { suit: 'clubs' as Suit, rank: 'A' as Rank },
        { suit: 'diamonds' as Suit, rank: '2' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Limp', 'Fold'],
    correctAnswer: 'Fold',
    explanation: 'A2oは弱いエースで、ポストフロップの対戦が難しくなります。BTNでもフォールドが推奨されます。',
    wrongAnswerExplanations: {
      'Raise 2BB': 'A2oでレイズすることは推奨されません。ポストフロップでの対戦が難しく、多くの場合ドミネートされています。',
      'Raise 2.5BB': 'A2oは弱すぎるハンドです。レイズしてもポストフロップでの対戦が難しく、価値を見出すことが困難です。',
      'Limp': 'BTNからのリンプは推奨されません。特に弱いハンドの場合、ポストフロップでの対戦がさらに難しくなります。'
    }
  },
  {
    id: '19',
    street: 'preflop',
    anti: 0,
    position: 'SB',
    bbStyle: bbStyles.Turtle,
    scenario: {
      heroHand: [
        { suit: 'hearts' as Suit, rank: '2' as Rank },
        { suit: 'diamonds' as Suit, rank: '2' as Rank }
      ],
      potSize: 100,
      stackSize: 1000,
    },
    options: ['Raise 2BB', 'Raise 2.5BB', 'Limp', 'Fold'],
    correctAnswer: 'Fold',
    explanation: '22は最も弱いペアで、BTNからのレイズには適していません。セットを作る確率は低く、ポストフロップの対戦が難しくなります。',
    wrongAnswerExplanations: {
      'Raise 2BB': '22でレイズすることは推奨されません。ポストフロップでの対戦が難しく、多くの場合オーバーカードに直面します。',
      'Raise 2.5BB': '22は弱すぎるハンドです。レイズしてもポストフロップでの対戦が難しく、価値を見出すことが困難です。',
      'Limp': 'BTNからのリンプは推奨されません。特に弱いハンドの場合、ポストフロップでの対戦がさらに難しくなります。'
    }
  }
];

// 問題データにランダムなBBスタイルを追加して出力
export const questions: PokerQuestion[] = baseQuestions.map(q => ({
  ...q,
  bbStyles: bbStyles  // ランダム化をコンポーネント側で行うため、全てのスタイルを渡す
})); 