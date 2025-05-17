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
  canAddToDeck,
  onAddToDeck,
}) => {
  // フルーツのフィルタリング用の状態
  const [fruitFilter, setFruitFilter] = useState<FruitType | 'all'>('all');
  // お菓子タイプのフィルタリング用の状態
  const [sweetTypeFilter, setSweetTypeFilter] = useState<string | 'all'>('all');
  // バージョンのフィルタリング用の状態
  const [versionFilter, setVersionFilter] = useState<string | 'all'>('all');
  // 検索用の状態
  const [searchQuery, setSearchQuery] = useState('');

  // フィルタリングされたカードを取得
  const filteredCards = cards.filter(card => {
    // バージョンでフィルタリング
    if (versionFilter !== 'all' && card.version !== versionFilter) {
      return false;
    }

    // フルーツでフィルタリング
    if (fruitFilter !== 'all' && card.fruit !== fruitFilter) {
      return false;
    }  
    
    // お菓子タイプでフィルタリング
    if (sweetTypeFilter !== 'all' && card.sweetType !== sweetTypeFilter) {
      return false;
    }

    
    // 検索クエリでフィルタリング
    if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // お菓子タイプのリストを取得
  const sweetTypes = Array.from(new Set(cards.filter(card => card.sweetType).map(card => card.sweetType)));
  // バージョンのリストを取得
  const versions = Array.from(new Set(cards.filter(card => card.version).map(card => card.version)));

  // カードが選択されたときの処理
  const handleCardSelect = (card: CardInfo) => {
    if (onCardSelect) {
      onCardSelect(card);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 幼女カードリスト */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* フルーツのフィルター */}
          {(cardType !== 'プレイアブル') && (
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
          )}
          {/* お菓子タイプのフィルター */}
          {cardType === 'お菓子' && (
            <select
              className="px-3 py-2 border rounded-md"
              value={sweetTypeFilter}
              onChange={(e) => setSweetTypeFilter(e.target.value)}
            >
              <option value="all">すべてのお菓子タイプ</option>
              {sweetTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}

          {/* プレイアブルのフィルター */}
          {cardType === 'プレイアブル' && (
            <>
              {/* バージョンのフィルター */}
              <select
                className="px-3 py-2 border rounded-md"
                value={versionFilter}
                onChange={(e) => setVersionFilter(e.target.value)}
              >
                <option value="all">すべてのバージョン</option>
                {versions.map(version => (
                  <option key={version} value={version}>{version}</option>
                ))}
              </select>
            </>
          )}

          <input
            type="text"
            placeholder="カード名で検索..."
            className="px-3 py-2 border rounded-md flex-grow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 overflow-auto  max-h-[calc(70vh-50px)]">
          {filteredCards
            .filter(card => card.type === cardType) // カードの種類でフィルタリング
            .sort((a, b) => (a.version || '').localeCompare(b.version || '')) // バージョンでソート
            .map((card) => (
              <div key={card.id} className="flex justify-center">
                <Card
                  card={card}
                  isSelected={card.id === selectedCardId}
                  onClick={handleCardSelect}
                  draggable={draggable}
                  onDragStart={onDragStart}
                  canAddToDeck={canAddToDeck}
                  onAddToDeck={onAddToDeck}
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