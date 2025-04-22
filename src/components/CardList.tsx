/**
 * カードリストコンポーネント
 * 
 * 複数のカードを表示するコンポーネント
 * フィルタリングやソート機能を提供する
 */

import React, { useState } from 'react';
import { Card as CardTS, CardType, FruitType } from '@/types/card';
import Card from './Card';

interface CardListProps {
  /** 表示するカードのリスト */
  cards: CardTS[];
  /** カードが選択されたときのコールバック関数 */
  onCardSelect?: (card: CardTS) => void;
  /** 選択されているカードのID */
  selectedCardId?: string;
  /** カードがドラッグ可能かどうか */
  draggable?: boolean;
  /** ドラッグ開始時のコールバック関数 */
  onDragStart?: (e: React.DragEvent, card: CardTS) => void;
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
}) => {
  // 幼女かお菓子かをフィルタリング用の状態
  const [filter, setFilter] = useState<CardType | 'all'>('all');
  // フルーツのフィルタリング用の状態
  const [fruitFilter, setFruitFilter] = useState<FruitType | 'all'>('all');

  // 検索用の状態
  const [searchQuery, setSearchQuery] = useState('');

  // フィルタリングされたカードを取得
  const filteredCards = cards.filter(card => {
    // 種類でフィルタリング
    if (filter !== 'all' && card.type !== filter) {
      return false;
    }
  
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
  const handleCardSelect = (card: CardTS) => {
    if (onCardSelect) {
      onCardSelect(card);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* フィルターと検索 */}
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          className="px-3 py-2 border rounded-md"
          value={filter}
          onChange={(e) => setFilter(e.target.value as CardType | 'all')}
        >
          <option value="all">すべて</option>
          <option value="幼女">幼女</option>
          <option value="お菓子">お菓子</option>
        </select>

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

      {/* カードリスト */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-auto max-h-[calc(100vh-200px)]">
        {filteredCards.map((card) => (
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