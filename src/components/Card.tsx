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
}) => {
  if (!card) {
    throw new Error('Card data is required');
  }
    
  // 画像のパスを修正
  const imagePath = card.imageUrl.startsWith('/') 
    ? `/PPLALE-web_front${card.imageUrl}`
    : `/PPLALE-web_front/${card.imageUrl}`;

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
        relative w-32 h-44 rounded-lg shadow-md overflow-hidden
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
      <div className="w-full h-full relative">
        <Image
          src={imagePath}
          alt={card.name}
          width={128}
          height={256}
          className="rounded-lg"
          priority={true}
          loading="eager"
          quality={90}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCD/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
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