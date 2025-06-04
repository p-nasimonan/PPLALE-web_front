/**
 * プレイアブルカードプレビューコンポーネント
 * 
 * プレイアブルカードの選択肢を表示し、カードをクリックして選択、または次の画面へ進む機能を提供します。
 * カードは初期表示時は裏向きで、アニメーションで表向きになります。
 * 
 * @packageDocumentation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CardInfo } from '@/types/card';
import Card from '@/components/Card';

/**
 * プレイアブルカードプレビューコンポーネントのProps
 * 
 * @interface
 * @property {CardInfo[]} playableChoices - 表示するプレイアブルカードの選択肢
 * @property {(card: CardInfo) => void} onCardClick - カードがクリックされたときのコールバック関数
 * @property {() => void} onSubmit - 「次へ」ボタンがクリックされたときのコールバック関数
 */
interface PlayableCardPreviewProps {
  /** 表示するプレイアブルカードの選択肢 */
  playableChoices: CardInfo[];
  /** カードがクリックされたときのコールバック関数 */
  onCardClick: (card: CardInfo) => void;
  /** 「次へ」ボタンがクリックされたときのコールバック関数 */
  onSubmit: () => void;
}

/**
 * プレイアブルカードプレビューコンポーネント
 * 
 * @param {PlayableCardPreviewProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} プレイアブルカードのプレビュー画面
 */
const PlayableCardPreview: React.FC<PlayableCardPreviewProps> = ({
  playableChoices,
  onCardClick,
  onSubmit,
}) => {
  /** 各カードが表向きかどうかの状態 */
  const [cardsFaceUp, setCardsFaceUp] = useState<boolean[]>([]);

  useEffect(() => {
    // 初期表示時はすべて裏向き
    setCardsFaceUp(new Array(playableChoices.length).fill(false));

    // 少し遅れてすべて表向きにする
    const timer = setTimeout(() => {
      setCardsFaceUp(new Array(playableChoices.length).fill(true));
    }, 500); // 0.5秒後に表向きにする (アニメーションのため)

    return () => clearTimeout(timer);
  }, [playableChoices]); // playableChoicesが変更された時にも再実行

  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-xl font-bold mb-4">プレイアブルカードを確認してください</h2>
      <div className="grid grid-cols-3 gap-4 w-full max-w-6xl mx-auto place-items-center">
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
          />
        ))}
      </div>
      <button onClick={onSubmit} className="btn-primary mt-4">
        次へ
      </button>
    </div>
  );
};

export default PlayableCardPreview;