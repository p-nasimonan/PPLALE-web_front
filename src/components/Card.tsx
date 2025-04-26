/**
 * カードコンポーネント
 * 
 * カードの表示と操作を行うコンポーネント
 * カードの種類（幼女/お菓子）に応じて表示を変更する
 */

import React, { useState, useEffect} from 'react'; 
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
  /** カードが削除されたときのコールバック関数 */
  onRemove?: (card: CardInfo) => void;
  /** 削除ボタンを表示するかどうか */
  showRemoveButton?: boolean;
  /** 幼女デッキ */
  yojoDeck?: CardInfo[];
  /** お菓子デッキ */
  sweetDeck?: CardInfo[];
  /** デッキに追加可能かどうかを判定する関数 */
  canAddToDeck?: (card: CardInfo) => boolean;
  /** カードがデッキに追加されたときのコールバック関数 */
  onAddToDeck?: (card: CardInfo) => void;
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
  onRemove,
  showRemoveButton = false,
  canAddToDeck,
  onAddToDeck,
}) => {
    
  // 環境に応じて画像のパスを切り替え
  const isProd = process.env.NODE_ENV === 'production';
  const basePath = isProd ? '/PPLALE-web_front' : '';
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
    if (onClick) {
      onClick(card);
    }
    setIsExpanded(true);
  };

  // ドラッグ開始時の処理
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
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
    // 0.002秒後にダウンロード完了
    setTimeout(() => {
      setIsDownloading(false);
    }, 2);
  }, [card]);

  return (
    <>
      <div
        className={`
          relative rounded-lg shadow-md overflow-hidden
          ${getCardColor()} 
          ${isSelected ? 'ring-4 ring-blue-500' : ''}
          transition-all duration-200 hover:shadow-lg
          cursor-pointer flex-shrink-0
        `}
        style={{ width: `${width}px`, height: `${height}px` }}
        onClick={handleClick}
        draggable={draggable}
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
            priority={true}
            quality={75}
            unoptimized={false}
            style={isDownloading ? {
              imageRendering: 'pixelated',
            } : undefined}
            placeholder="blur"
            loading="eager"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCAkKCD/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
          {isDownloading && (
            <h2 className='top-4 w-full h-full flex items-center justify-center'>ロード中</h2>
          )}
        </div>

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

      {/* 拡大表示ポップアップ */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsExpanded(false)}>
          <div className="bg-white p-4 rounded-lg max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{card.name}</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsExpanded(false)}
              >
                ×
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                <Image
                  src={imagePath}
                  alt={card.name}
                  width={width * 2}
                  height={height * 2}
                  className="rounded-lg"
                  priority={true}
                  quality={100}
                />
              </div>
              <div className="flex-grow">
                <p className="text-gray-700 mb-2">{card.description}</p>
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
                {onAddToDeck && (
                  <div className="mt-4">
                    <button
                      className="btn btn-primary w-full"
                      onClick={() => {
                        onAddToDeck(card);
                        setIsExpanded(false);
                      }}
                      disabled={!canAddToDeck?.(card)}
                    >
                      デッキに追加
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;