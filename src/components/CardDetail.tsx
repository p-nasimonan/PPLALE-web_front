import React from 'react';
import { CardInfo } from '@/types/card';
import Card from './Card';

interface CardDetailProps {
  card: CardInfo;
  onClose: () => void;
  canAddToDeck?: (card: CardInfo) => boolean;
  onAddToDeck?: (card: CardInfo) => void;
}
    
const CardDetail: React.FC<CardDetailProps> = ({ card, onClose, canAddToDeck, onAddToDeck }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center w-full h-full z-50 backdrop-blur-sm" onClick={onClose}>
      <article className="relative rounded-lg shadow-lg p-4 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          <Card card={card} width={300} height={450} showDetail = {false} />
          <div className="mt-4">
            {card.type === 'プレイアブル' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold">種類:</span> {card.type}
                </div>
                <div>
                  <span className="font-bold">バージョン:</span> {card.version}
                </div>
                {card.effect && (
                  <div className="col-span-2">
                    <span className="font-bold">効果:</span>
                    <p className="text-sm mt-1">{card.effect}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold">種類:</span> {card.type}
                </div>
                <div>
                  <span className="font-bold">フルーツ:</span> {card.fruit}
                </div>
                {card.role && (
                  <div>
                    <span className="font-bold">役職:</span> {card.role}
                  </div>
                )}
                {card.sweetType && (
                  <div>
                    <span className="font-bold">お菓子タイプ:</span> {card.sweetType}
                  </div>
                )}
                {card.effect && (
                  <div className="col-span-2">
                    <span className="font-bold">効果:</span>
                    <p className="text-sm mt-1">{card.effect}</p>
                  </div>
                )}
              </div>
            )}
            {/* デッキに追加ボタン */}
            {canAddToDeck && onAddToDeck && (
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => onAddToDeck(card)}
                disabled={!canAddToDeck(card)}
              >
                デッキに追加
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default CardDetail;
