import React from 'react';
import { CardInfo } from '@/types/card';
import Card from '@/components/Card';

interface CardSelectionProps {
  card1: CardInfo;
  card2: CardInfo;
  onSelect: () => void;
}



const CardSelection: React.FC<CardSelectionProps> = ({ card1, card2, onSelect }) => {
    if (!card1 || !card2) {
        throw new Error('Card data is required');
      }
  return (
    <div className="grid gap-1 items-center">
        <div className="flex justify-center gap-4">
        <Card card={card1} draggable={false} />
        <Card card={card2} draggable={false} />
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
