/**
 * カードリストコンポーネント
 * 
 * 複数のカードを表示するコンポーネント
 * フィルタリングやソート機能を提供する
 */

import React, { useState } from 'react';
import { CardInfo, CardType, FruitType } from '@/types/card';
import Card from './Card';

interface CardListProps {
  /** 表示するカードのリスト */
  cards: CardInfo[];
  /** カードが選択されたときのコールバック関数 */
  onCardSelect?: (card: CardInfo) => void;
  /** 選択されているカードのID */
  selectedCardId?: string;
  /** カードがドラッグ可能かどうか */
  draggable?: boolean;
  /** ドラッグ開始時のコールバック関数 */
  onDragStart?: (e: React.DragEvent, card: CardInfo) => void;

  /** カードの種類（幼女/お菓子） */
  cardType: CardType; // カードの種類（幼女/お菓子）を指定
}

/**
 * カードリストコンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @returns カードリストコンポーネント
 */
const CardList: React.FC<CardListProps> = ({
  cards,
  onCardSelect,
  selectedCardId,
  draggable = false,
  onDragStart,
  cardType = '幼女', // カードの種類（幼女/お菓子）をデフォルトで設定
}) => {
  // フルーツのフィルタリング用の状態
  const [fruitFilter, setFruitFilter] = useState<FruitType | 'all'>('all');
  // 検索用の状態
  const [searchQuery, setSearchQuery] = useState('');

  // フィルタリングされたカードを取得
  const filteredCards = cards.filter(card => {
    // フルーツでフィルタリング
    if (fruitFilter !== 'all' && card.fruit !== fruitFilter) {
      return false;
    }  
    
    // 検索クエリでフィルタリング
    if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // カードが選択されたときの処理
  const handleCardSelect = (card: CardInfo) => {
    if (onCardSelect) {
      onCardSelect(card);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 幼女カードリスト */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-pink-600">{cardType}</h2>
        <div className="flex flex-col sm:flex-row gap-2">
        {/* フルーツのフィルター */}
        <select
            className="px-3 py-2 border rounded-md"
            value={fruitFilter}
            onChange={(e) => setFruitFilter(e.target.value as FruitType | 'all')}
        >
            <option value="all">すべてのフルーツ</option>
            <option value="いちご">いちご</option>
            <option value="ぶどう">ぶどう</option>
            <option value="めろん">めろん</option>
            <option value="おれんじ">おれんじ</option>
        </select>

        <input
          type="text"
          placeholder="カード名で検索..."
          className="px-3 py-2 border rounded-md flex-grow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
        <div className="flex grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-auto max-h-[calc(50vh-100px)]">
          {filteredCards
            .filter(card => card.type === cardType) // カードの種類でフィルタリング
            .map((card) => (
              <div key={card.id} className="flex justify-center">
                <Card
                  card={card}
                  isSelected={card.id === selectedCardId}
                  onClick={handleCardSelect}
                  draggable={draggable}
                  onDragStart={onDragStart}
                />
              </div>
            ))}
        </div>
      </div>

      {/* カードが見つからない場合のメッセージ */}
      {filteredCards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          条件に一致するカードが見つかりませんでした。
        </div>
      )}
    </div>
  );
};

export default CardList;