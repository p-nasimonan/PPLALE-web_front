import React from 'react';
import { CardInfo } from '@/types/card';
import Card from './Card';

interface CardDetailProps {
  card: CardInfo;
  onClose: () => void;
  canAddToDeck?: (card: CardInfo) => boolean;
  onAddToDeck?: (card: CardInfo) => void;
  handleCardRemove?: (card: CardInfo) => void;
  isInDeck: boolean;
}
    
const CardDetail: React.FC<CardDetailProps> = ({ card, onClose, canAddToDeck, onAddToDeck, isInDeck , handleCardRemove}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center w-full h-full z-50 backdrop-blur-sm" onClick={onClose}>
      <article className="relative rounded-lg shadow-lg p-2 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-2 right-2 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          <Card 
            card={card} 
            sizes={{
              base: { width: 200, height: 300 },
              sm: { width: 250, height: 375 },
              md: { width: 300, height: 450 },
              lg: { width: 500, height: 750 }
            }}
            canShowDetail={false} 
          />
          <div className="mt-4">
            {/* デッキに追加ボタン */}
            {canAddToDeck && onAddToDeck ? (
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => onAddToDeck(card)}
                disabled={!canAddToDeck(card)}
              >
                {card.type === 'プレイアブル' ? '選択する' : 'デッキに追加'}
              </button>
            ) : isInDeck ? (
              <button
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleCardRemove?.(card)}
              >
                デッキから外す
              </button>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
};

export default CardDetail;
