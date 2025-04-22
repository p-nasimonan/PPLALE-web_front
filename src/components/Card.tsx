/**
 * カードコンポーネント
 * 
 * カードの表示と操作を行うコンポーネント
 * カードの種類（幼女/お菓子）に応じて表示を変更する
 */

import React from 'react';
import Image from 'next/image';
import { Card as CardType } from '@/types/card';

interface CardProps {
  /** 表示するカードのデータ */
  card: CardType;
  /** カードが選択されているかどうか */
  isSelected?: boolean;
  /** カードがクリックされたときのコールバック関数 */
  onClick?: (card: CardType) => void;
  /** カードがドラッグ可能かどうか */
  draggable?: boolean;
  /** ドラッグ開始時のコールバック関数 */
  onDragStart?: (e: React.DragEvent, card: CardType) => void;
}

/**
 * カードコンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @returns カードコンポーネント
 */
const Card: React.FC<CardProps> = ({
  card,
  isSelected = false,
  onClick,
  draggable = false,
  onDragStart,
}) => {
  // カードの種類に応じた背景色を設定
  const getCardColor = () => {
    return card.type === '幼女' ? 'bg-pink-100' : 'bg-yellow-100';
  };

  // カードの種類に応じたボーダー色を設定
  const getBorderColor = () => {
    return card.type === '幼女' ? 'border-pink-300' : 'border-yellow-300';
  };


  // カードがクリックされたときの処理
  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  // ドラッグ開始時の処理
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, card);
    }
  };

  return (
    <div
      className={`
        relative w-40 h-56 rounded-lg shadow-md overflow-hidden
        ${getCardColor()} ${getBorderColor()} border-2
        ${isSelected ? 'ring-4 ring-blue-500' : ''}
        transition-all duration-200 hover:shadow-lg
        cursor-pointer
        flex-shrink-0
      `}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
    >

      {/* カードの画像 */}
      <div className="w-full h-32 relative">
        <Image
          src={card.imageUrl}
          alt={card.name}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default Card; 