import React from 'react';
import { CardInfo } from '@/types/card';
import Card from '@/components/Card';

interface CardSelectionProps {
  cards: CardInfo[];
  onSelect: () => void;
}

const CardSelection: React.FC<CardSelectionProps> = ({ cards, onSelect }) => {
  return (
    <div className="grid gap-1 items-center">
      <div className="flex justify-center gap-4">
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            sizes={{
              base: { width: 100, height: 151 },
              sm: { width: 140, height: 210 },
              md: { width: 190, height: 280 },
              lg: { width: 280, height: 420 }
            }}
          />
        ))}
      </div>
      <button
        className="btn-export mt-4"
        onClick={onSelect}
      >
        選択
      </button>
    </div>
  );
};

export default CardSelection;
