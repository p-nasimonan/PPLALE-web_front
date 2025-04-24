/**
 * カードコンポーネント
 * 
 * カードの表示と操作を行うコンポーネント
 * カードの種類（幼女/お菓子）に応じて表示を変更する
 */

import React from 'react';
import Image from 'next/image';
import { CardInfo } from '@/types/card';

interface CardProps {
  /** 表示するカードのデータ */
  card: CardInfo;
  /** カードが選択されているかどうか */
  isSelected?: boolean;
  /** カードがクリックされたときのコールバック関数 */
  onClick?: (card: CardInfo) => void;
  /** カードがドラッグ可能かどうか */
  draggable?: boolean;
  /** ドラッグ開始時のコールバック関数 */
  onDragStart?: (e: React.DragEvent, card: CardInfo) => void;
  /** カードの重複数 */
  count?: number;
  /** カード画像の幅 */
  width?: number;
  /** カード画像の高さ */
  height?: number;
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
  count = 1,
  width = 128, // デフォルト幅
  height = 190, // デフォルト高さ
}) => {
  if (!card) {
    throw new Error('Card data is required');
  }
    
  // 環境に応じて画像のパスを切り替え
  const isProd = process.env.NODE_ENV === 'production';
  const imagePath = isProd
    ? `/PPLALE-web_front${card.imageUrl}`
    : card.imageUrl;

  // カードの種類に応じた背景色を設定
  const getCardColor = () => {
    return card.fruit === 'いちご'
      ? 'bg-red-200'
      : card.fruit === 'ぶどう'
      ? 'bg-purple-200'
      : card.fruit === 'めろん'
      ? 'bg-green-200'
      : card.fruit === 'おれんじ'
      ? 'bg-orange-200'
      : 'bg-gray-200';
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
        relative rounded-lg shadow-md overflow-hidden
        ${getCardColor()} 
        ${isSelected ? 'ring-4 ring-blue-500' : ''}
        transition-all duration-200 hover:shadow-lg
        cursor-pointer flex-shrink-0
      `}
      style={{ width: `${width}px`, height: `${height}px` }} // インラインスタイルで幅と高さを指定
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
    >
      {/* カードの画像 */}
      <div className="w-full h-full flex items-center justify-center">
        <Image
          src={imagePath}
          alt={card.name}
          width={width}
          height={height}
          className="rounded-lg"
          priority={true}
          loading="eager"
          quality={90}
          unoptimized={!isProd} // 本番環境では最適化を有効化
        />
      </div>

      {/* 重複数の表示 */}
      {count > 1 && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
          ×{count}
        </div>
      )}
    </div>
  );
};

export default Card;