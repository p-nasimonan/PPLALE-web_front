/**
 * カードコンポーネント
 * 
 * カードの表示と操作を行うコンポーネント
 * カードの種類（幼女/お菓子）に応じて表示を変更する
 */

import React, { useState, useEffect} from 'react'; 
import Image from 'next/image';
import { CardInfo } from '@/types/card';
import CardDetail from './CardDetail';

const isGitHubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';
const basePath = isGitHubPages ? '/PPLALE-web_front' : '';

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
  width?: number ;
  /** カード画像の高さ */
  height?: number;
  /** カードが削除されたときのコールバック関数 */
  onRemove?: (card: CardInfo) => void;
  /** 削除ボタンを表示するかどうか */
  showRemoveButton?: boolean;
  /** デッキに追加するコールバック関数 */
  onAddToDeck?: (card: CardInfo) => void;
  /** デッキに追加できるかどうか */
  canAddToDeck?: (card: CardInfo) => boolean;
  /** カードの詳細を表示できるか */
  canShowDetail?: boolean;
}

/**
 * カードコンポーネント
 * 
 * @param card 表示するカードのデータ
 * @param isSelected カードが選択されているかどうか
 * @param onClick カードがクリックされたときのコールバック関数
 * @param draggable カードがドラッグ可能かどうか
 * @param onDragStart ドラッグ開始時のコールバック関数
 * @param count カードの重複数
 * @param width カード画像の幅
 * @param height カード画像の高さ
 * @param onRemove カードが削除されたときのコールバック関数
 * @param showRemoveButton 削除ボタンを表示するかどうか
 * @param onAddToDeck デッキに追加するコールバック関数
 * @param canAddToDeck デッキに追加できるかどうか
 * @param canShowDetail カードの詳細を表示できるか
 * @returns カードコンポーネント
 */
const Card: React.FC<CardProps> = ({
  card,
  isSelected = false,
  onClick,
  draggable = false,
  onDragStart,
  count = 1,
  width = 140, // デフォルト幅
  height = 210, // デフォルト高さ
  onRemove,
  showRemoveButton = false,
  onAddToDeck,
  canAddToDeck = false,
  canShowDetail = true,
}) => {
  const imagePath = `${basePath}${card.imageUrl}`;
  const loadingImagePath = `${basePath}/images/yokan.png`;

  const [isDownloading, setIsDownloading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

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
    if (onClick && !isExpanded) {
      onClick(card);
    }
    if (canShowDetail) {
      setIsExpanded(true);
    }
  };

  // ドラッグ開始時の処理
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart && !isExpanded) {
      onDragStart(e, card);
    }
  };

  // カードが削除されたときの処理
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(card);
    }
  };

  useEffect(() => {
    setIsDownloading(true);
    // 0秒後にダウンロード完了
    setTimeout(() => {
      setIsDownloading(false);
    }, 0);
  }, [card]);

  return (
    <>
      <div
      className={`
        relative rounded-lg shadow-md overflow-hidden
        ${getCardColor()} 
        transition-all duration-200 hover:shadow-lg
        cursor-pointer flex-shrink-0
        ${isExpanded ? 'pointer-events-none' : ''}
      `}
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={canShowDetail ? handleClick : undefined}
      draggable={draggable && !isExpanded}
      onDragStart={handleDragStart}
      >
      {/* カードの画像 */}
      <div className="w-full h-full flex items-center justify-center">
        <Image
        src={isDownloading ? loadingImagePath : imagePath}
        alt={isDownloading ? "ロード中..." : card.name}
        width={width}
        height={height}
        className={`rounded-lg ${isDownloading ? 'pixelated' : ''}`}
        sizes="(max-width: 800px) 100vw, (max-width: 1200px) 50vw, 25vw"
        priority={false}
        quality={60}
        unoptimized={false}
        style={{
          ...(isDownloading ? {
            imageRendering: 'pixelated',
            width: '64px',
            height: '64px',
          } : {})
        }}
        placeholder="blur"
        loading="lazy"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGwAZQAgAEkAbgBjAC4AIAAyADAAMQA2/9sAQwAUDg8SDw0UEhASFxUUTHx+Hh4eGhodJC0lICQoICQoICQoICQoICQoICQoICQoICQoICQoICQoICQoICQoICQoICQoICQoICQoIP/YAERCAAoACgMBIgACEQEDEQH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAAJ0AGZf/2Q=="
        />
        {isDownloading && (
        <h2 className='top-4 w-full h-full flex items-center justify-center'>ロード中</h2>
        )}
      </div>

      {/* 選択中のオーバーレイ */}
      {isSelected && card.type === 'プレイアブル' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <p className="text-white text-lg font-bold">選択中</p>
        </div>
      )}

      {/* 重複数の表示 */}
      {count > 1 && !isDownloading && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
        ×{count}
        </div>
      )}

      {/* 削除ボタン */}
      {showRemoveButton && !isDownloading && (
        <button
        className="absolute top-1 right-1 bg-gray-300 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-500 hover:text-white transition-colors duration-200"
        onClick={handleRemove}
        aria-label={`${card.name}を削除`}
        >
          ×
        </button>
      )}
      </div>

      {/* カードの詳細 */}
      {isExpanded && canShowDetail && (
        <CardDetail
          card={card}
          onClose={() => setIsExpanded(false)}
          onAddToDeck={(card) => {
            if (onAddToDeck) {
              onAddToDeck(card);
              setIsExpanded(false);
            }
          }}
          canAddToDeck={typeof canAddToDeck === 'function' ? (card) => canAddToDeck(card) : undefined}
        />
      )}
    </>
  );
};

export default Card;