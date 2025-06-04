/**
 * カード選択コンポーネント
 * 
 * 2Pick中のカード選択ペア（2枚一組）を表示するコンポーネント。
 * クリックするとそのペアが選択されます。
 * カードが表向きになった後、少し時間を置いてから選択ボタンがアニメーションで表示されます。
 * 
 * @packageDocumentation
 */

'use client';

import React from 'react';
import Card from '@/components/Card';
import { CardInfo } from '@/types/card';

/**
 * カード選択コンポーネントのProps
 * 
 * @interface
 * @property {(CardInfo & { isFaceUp?: boolean })[]} cards - 表示するカードのペア (2枚)
 * @property {() => void} onSelect - このペアが選択されたときのコールバック関数
 */
interface CardSelectionProps {
  /** 表示するカードのペア (2枚) */
  cards: (CardInfo & { isFaceUp?: boolean })[];
  /** このペアが選択されたときのコールバック関数 */
  onSelect: () => void;
}

/**
 * カード選択コンポーネント
 * 
 * @param {CardSelectionProps} cards - 表示するカードのペア (2枚)
 * @param {() => void} onSelect - このペアが選択されたときのコールバック関数
 * @returns {JSX.Element} カード選択UI
 */
const CardSelection: React.FC<CardSelectionProps> = ({ cards, onSelect }) => {

  if (cards.length < 2) return null;
  return (
    <div className="grid gap-1 items-center">
      <div className="flex justify-center gap-4">
        {cards.map(card => (
          <Card
            key={card.id} 
            card={card}
            isFaceUp={card.isFaceUp}
            sizes={{
              base: { width: 100, height: 151 },
              sm: { width: 140, height: 210 },
              md: { width: 190, height: 280 },
              lg: { width: 280, height: 420 }
            }}
            canShowDetail={true}
          />
        ))}
      </div>
      {cards.every(card => card.isFaceUp) && (
        <button
          className="btn-export mt-4 animate-fadeIn"
          onClick={onSelect}
        >
          選択
        </button>
      )}

      {/* アニメーションのためのスタイル */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CardSelection;
