/**
 * プレイアブルカード最終選択コンポーネント
 * 
 * 2pickの最後にプレイアブルカードを選択する画面を提供します。
 * カードを選ぶと詳細表示され、確定することができます。
 * 
 * @packageDocumentation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CardInfo } from '@/types/card';
import Card from '@/components/Card';

/**
 * プレイアブルカード最終選択コンポーネントのProps
 * 
 * @interface
 * @property {CardInfo[]} playableChoices - 表示するプレイアブルカードの選択肢
 * @property {CardInfo | null} selectedPlayableCard - 選択されたプレイアブルカード
 * @property {(card: CardInfo) => void} onCardClick - カードがクリックされたときのコールバック関数
 * @property {boolean} isCardDisappearing - カードが消えるアニメーション中かどうか
 * @property {() => void} onConfirm - 選択確定ボタンがクリックされたときのコールバック関数
 * @property {() => void} onBack - 戻るボタンがクリックされたときのコールバック関数
 */
interface PlayableCardFinalSelectionProps {
  /** 表示するプレイアブルカードの選択肢 */
  playableChoices: CardInfo[];
  /** 選択されたプレイアブルカード */
  selectedPlayableCard: CardInfo | null;
  /** カードがクリックされたときのコールバック関数 */
  onCardClick: (card: CardInfo) => void;
  /** カードが消えるアニメーション中かどうか */
  isCardDisappearing: boolean;
  /** 選択確定ボタンがクリックされたときのコールバック関数 */
  onConfirm: () => void;
  /** 戻るボタンがクリックされたときのコールバック関数 */
  onBack: () => void;
}

/**
 * プレイアブルカード最終選択コンポーネント
 * 
 * @param {PlayableCardFinalSelectionProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} プレイアブルカード最終選択画面
 */
const PlayableCardFinalSelection: React.FC<PlayableCardFinalSelectionProps> = ({
  playableChoices,
  selectedPlayableCard,
  onCardClick,
  isCardDisappearing,
  onConfirm,
  onBack,
}) => {
  // カードの表示状態管理
  const [cardsFaceUp, setCardsFaceUp] = useState<boolean[]>([]);

  useEffect(() => {
    if (!selectedPlayableCard) {
      // 初期表示時はすべて裏向き
      setCardsFaceUp(new Array(playableChoices.length).fill(false));

      // 少し遅れてすべて表向きにする
      const timer = setTimeout(() => {
        setCardsFaceUp(new Array(playableChoices.length).fill(true));
      }, 500); // 0.5秒後に表向きにする

      return () => clearTimeout(timer);
    }
  }, [playableChoices, selectedPlayableCard]);

  return (
    <div className="mt-4 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-center">プレイアブルカードを選択してください</h2>
      {!selectedPlayableCard && (
        <div>
          <div className="flex gap-4">
            {playableChoices.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                onClick={() => onCardClick(card)}
                isFaceUp={cardsFaceUp[index] ?? false}
                sizes={{
                  base: { width: 140, height: 210 },
                  sm: { width: 200, height: 300 },
                  md: { width: 280, height: 420 },
                  lg: { width: 300, height: 450 }
                }}
                canShowDetail={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* スライド表示されたカード */}
      {selectedPlayableCard && (
        <div className="relative w-full max-w-4xl mx-auto p-4">
          <div className={`flex flex-col items-center justify-center gap-6 w-full transform-slide ${
            isCardDisappearing ? 'animate-disappear' : ''
          }`}>
            <div className="w-full lg:w-1/2 flex justify-center">
              <Card
                card={selectedPlayableCard}
                sizes={{
                  base: { width: 200, height: 300 },
                  sm: { width: 250, height: 375 },
                  md: { width: 300, height: 450 },
                  lg: { width: 500, height: 750 }
                }}
                canShowDetail={false}
                isFaceUp={true}
              />
            </div>
            <div className="w-full h-auto overflow-auto p-4 rounded-lg">
              {selectedPlayableCard.description && (
                <div className="mt-4">
                  <p className="text-lg font-semibold mt-1 whitespace-pre-line">{selectedPlayableCard.description}</p>
                </div>
              )}
            </div>
          </div>
          <button
            className="btn-select absolute bottom-40 right-0"
            onClick={onConfirm}
          >
            選択
          </button>
          <button
            className="btn-secondary absolute top-0 left-0"
            onClick={onBack}
          >
            ◀︎戻る
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayableCardFinalSelection;