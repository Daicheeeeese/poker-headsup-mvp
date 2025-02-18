interface PokerCardProps {
  suit: string;
  rank: string;
}

const PokerCard: React.FC<PokerCardProps> = ({ suit, rank }) => {
  const getSuitColor = () => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-gray-900';
  };

  const getSuitSymbol = () => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  return (
    <div className="w-20 h-28 bg-white rounded-lg shadow-lg relative overflow-hidden transform transition-transform hover:scale-105">
      <div className={`absolute top-2 left-2 ${getSuitColor()}`}>
        <span className="text-2xl font-bold">{rank}</span>
      </div>
      <div className={`absolute bottom-2 right-2 ${getSuitColor()} rotate-180`}>
        <span className="text-2xl font-bold">{rank}</span>
      </div>
      <div className={`absolute inset-0 flex items-center justify-center ${getSuitColor()}`}>
        <span className="text-4xl">{getSuitSymbol()}</span>
      </div>
    </div>
  );
};

export default PokerCard; 