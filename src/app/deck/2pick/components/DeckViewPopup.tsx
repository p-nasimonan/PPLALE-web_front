/**
 * デッキ確認ポップアップコンポーネント
 * 
 * 2Pick中に現在のデッキ構成を確認するためのポップアップを提供します。
 * 幼女デッキ、お菓子デッキ、プレイアブルカードを一覧表示します。
 * 
 * @packageDocumentation
 */

'use client';

import React from 'react';
import { CardInfo } from '@/types/card';
import Deck from '@/components/Deck';

/**
 * デッキ確認ポップアップコンポーネントのProps
 * 
 * @interface
 * @property {CardInfo[]} yojoDeck - 表示する幼女デッキ
 * @property {CardInfo[]} sweetDeck - 表示するお菓子デッキ
 * @property {CardInfo | null} selectedPlayableCard - 表示するプレイアブルカード
 * @property {() => void} onClose - ポップアップを閉じるときのコールバック関数
 */
interface DeckViewPopupProps {
  /** 表示する幼女デッキ */
  yojoDeck: CardInfo[];
  /** 表示するお菓子デッキ */
  sweetDeck: CardInfo[];
  /** 表示するプレイアブルカード */
  selectedPlayableCard: CardInfo | null;
  /** ポップアップを閉じるときのコールバック関数 */
  onClose: () => void;
}

/**
 * デッキ確認ポップアップコンポーネント
 * 
 * @param {DeckViewPopupProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} デッキ確認ポップアップ
 */
const DeckViewPopup: React.FC<DeckViewPopupProps> = ({
  yojoDeck,
  sweetDeck,
  selectedPlayableCard,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-8xl max-h-[100vh] overflow-auto">
        {/* 3つのデッキを同時に表示 */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 左側：幼女デッキ */}
          <div className="w-full lg:w-1/2">
            <Deck
              cards={yojoDeck}
              type="幼女"
              readOnly={true}
              showDuplicates={false}
            />
          </div>

          {/* 右側：お菓子デッキとプレイアブルカード */}
          <div className="flex flex-col gap-4 w-full lg:w-1/2">
            <Deck
              cards={sweetDeck}
              type="お菓子"
              readOnly={true}
              showDuplicates={false}
            />

            <Deck
              cards={[selectedPlayableCard || null].filter(Boolean) as CardInfo[]}
              type="プレイアブル"
              readOnly={true}
              showDuplicates={false}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="btn-primary"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckViewPopup;