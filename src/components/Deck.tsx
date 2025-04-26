/**
 * デッキコンポーネント
 * 
 * デッキの表示と操作を行うコンポーネント
 * カードの追加・削除・並べ替えなどの機能を提供する
 */

import React, { useState } from 'react';
import { CardInfo, CardType } from '@/types/card';
import Card from './Card';

interface DeckProps {
  /** デッキに含まれるカードのリスト */
  cards: CardInfo[];
  /** カードが削除されたときのコールバック関数 */
  onCardRemove?: (card: CardInfo) => void;
  /** カードが並べ替えられたときのコールバック関数 */
  onCardsReorder?: (cards: CardInfo[]) => void;
  /** デッキの種類（幼女またはお菓子） */
  type: CardType;
  /**カードを消せるか */
  removeable?: boolean;
}

/**
 * デッキコンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @returns デッキコンポーネント
 */
const Deck: React.FC<DeckProps> = ({
  cards,
  onCardRemove,
  onCardsReorder,
  type,
  removeable = true,
}) => {
  // ドラッグ中のカードのインデックス
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // デッキの最大枚数
  const maxCards = 
        type === '幼女' 
        ? 20 
        : type === 'お菓子'
        ? 10
        : 0;

  // カードの重複数を計算する関数
  const getCardCount = (card: CardInfo) => {
    return cards.filter(c => c.id === card.id).length;
  };

  // 重複を除いたカードリストを作成
  const uniqueCards = cards.filter((card, index, self) => 
    index === self.findIndex(c => c.id === card.id)
  );

  // カードがドラッグ開始されたときの処理
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // カードがドラッグオーバーされたときの処理
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // カードの並べ替え
    const newCards = [...cards];
    const draggedCard = newCards[draggedIndex];
    newCards.splice(draggedIndex, 1);
    newCards.splice(index, 0, draggedCard);
    
    if (onCardsReorder) {
      onCardsReorder(newCards);
    }
    
    setDraggedIndex(index);
  };

  // カードがドロップされたときの処理
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedIndex(null);
  };

  // カードがドラッグ終了したときの処理
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // カードが削除されたときの処理
  const handleCardRemove = (card: CardInfo) => {
    if (onCardRemove) {
      onCardRemove(card);
    }
  };

  // デッキの種類に応じた背景色を設定
  const getDeckColor = () => {
    return type === '幼女' ? 'bg-pink-50' : 'bg-yellow-50';
  };

  // デッキの種類に応じたボーダー色を設定
  const getBorderColor = () => {
    return type === '幼女' ? 'border-pink-200' : 'border-yellow-200';
  };

  // デッキの種類に応じたテキスト色を設定
  const getTextColor = () => {
    return type === '幼女' ? 'text-pink-800' : 'text-yellow-800';
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getDeckColor()} ${getBorderColor()}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${getTextColor()}`}>
          {type}デッキ ({cards.length}/{maxCards})
        </h2>
        {cards.length > maxCards && (
          <div className="text-red-500 text-sm">
            デッキが最大枚数を超えています
          </div>
        )}
      </div>

      {/* デッキのカードリスト */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 overflow-auto max-h-[calc(70vh-50px)]">
        {uniqueCards.map((card, index) => (
          <div
            key={card.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={`relative ${draggedIndex === index ? 'opacity-50' : ''}`}
          >
            <Card
              card={card}
              draggable={false}
              count={getCardCount(card)}
              onRemove={removeable ? handleCardRemove : undefined}
              showRemoveButton={removeable}
            />
          </div>
        ))}
      </div>

      {/* デッキが空の場合のメッセージ */}
      {cards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          デッキにカードがありません
        </div>
      )}
    </div>
  );
};

export default Deck;