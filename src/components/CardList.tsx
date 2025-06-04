/**
 * カードリストコンポーネント
 * 
 * 複数のカードを表示するコンポーネント
 * フィルタリングやソート機能を提供する
 */

import React, { useState, useMemo, useEffect } from 'react';
import { CardInfo, FruitType } from '@/types/card';
import Card from './Card';

/**
 * @JSDoc
 * @description CardListコンポーネントのProps
 * @property {CardInfo[]} allYojoCards - 表示する幼女カードのリスト
 * @property {CardInfo[]} allSweetCards - 表示するお菓子カードのリスト
 * @property {CardInfo[]} allPlayableCards - 表示するプレイアブルカードのリスト
 * @property {'yojo' | 'sweet' | 'playable'} displayCardType - 表示するカードの種類 (外部から指定)
 * @property {(card: CardInfo) => void} [onCardSelect] - カードが選択されたときのコールバック関数
 * @property {string} [selectedCardId] - 選択されているカードのID
 * @property {boolean} [draggable=false] - カードがドラッグ可能かどうか
 * @property {(e: React.DragEvent, card: CardInfo) => void} [onDragStart] - ドラッグ開始時のコールバック関数
 * @property {(card: CardInfo) => boolean} [canAddToDeck] - デッキに追加可能かどうかを判定する関数
 * @property {(card: CardInfo) => void} [onAddToDeck] - カードがデッキに追加されたときのコールバック関数
 */
interface CardListProps {
  allYojoCards: CardInfo[];
  allSweetCards: CardInfo[];
  allPlayableCards: CardInfo[];
  displayCardType: 'yojo' | 'sweet' | 'playable'; // 外部から渡されるアクティブなタブキー
  onCardSelect?: (card: CardInfo) => void;
  selectedCardId?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, card: CardInfo) => void;
  canAddToDeck?: (card: CardInfo) => boolean;
  onAddToDeck?: (card: CardInfo) => void;
}

/**
 * @JSDoc
 * @description カードリストとフィルタリング機能を提供するコンポーネント
 * @param {CardListProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} カードリストコンポーネント
 */
const CardList: React.FC<CardListProps> = ({
  allYojoCards,
  allSweetCards,
  allPlayableCards,
  displayCardType, // Props から受け取る
  onCardSelect,
  selectedCardId,
  draggable = false,
  onDragStart,
  canAddToDeck,
  onAddToDeck,
}) => {
  // activeTabKey の内部状態管理は削除
  const [fruitFilter, setFruitFilter] = useState<FruitType | 'all'>('all');
  const [sweetTypeFilter, setSweetTypeFilter] = useState<string | 'all'>('all');
  const [versionFilter, setVersionFilter] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentCards = useMemo(() => {
    switch (displayCardType) { // displayCardType を使用
      case 'yojo': return allYojoCards;
      case 'sweet': return allSweetCards;
      case 'playable': return allPlayableCards;
      default: return [];
    }
  }, [displayCardType, allYojoCards, allSweetCards, allPlayableCards]);

  const filteredCards = useMemo(() => currentCards.filter(card => {
    if (versionFilter !== 'all' && card.version !== versionFilter) return false;
    if (displayCardType !== 'playable' && fruitFilter !== 'all' && card.fruit !== fruitFilter) return false;
    if (displayCardType === 'sweet' && sweetTypeFilter !== 'all' && card.sweetType !== sweetTypeFilter) return false;
    if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }), [currentCards, versionFilter, fruitFilter, sweetTypeFilter, searchQuery, displayCardType]);

  const sweetTypes = useMemo(() => Array.from(new Set(allSweetCards.filter(card => card.sweetType).map(card => card.sweetType ?? ''))).filter(Boolean), [allSweetCards]);
  const versions = useMemo(() => Array.from(new Set(allPlayableCards.filter(card => card.version).map(card => card.version ?? ''))).filter(Boolean), [allPlayableCards]);

  const handleCardSelect = (card: CardInfo) => {
    if (onCardSelect) onCardSelect(card);
  };

  
  useEffect(() => {
    setFruitFilter('all');
    setSweetTypeFilter('all');
    setVersionFilter('all');
    setSearchQuery('');
  }, [displayCardType]); // displayCardType の変更を監視

  return (
    <div className="flex flex-col gap-4">
      {/* TabButtons は DeckPageClient に移動したので削除 */}

      {/* フィルターセクション */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {displayCardType === 'yojo' && (
            <select
              className="px-2 py-1 border rounded-md main-color text-sm"
              value={fruitFilter}
              onChange={(e) => setFruitFilter(e.target.value as FruitType | 'all')}
            >
              <option value="all">フルーツ</option>
              <option value="いちご">いちご</option>
              <option value="ぶどう">ぶどう</option>
              <option value="めろん">めろん</option>
              <option value="おれんじ">おれんじ</option>
            </select>
          )}
          {displayCardType === 'sweet' && (
            <select
              className="px-2 py-1 border rounded-md main-color text-sm"
              value={sweetTypeFilter}
              onChange={(e) => setSweetTypeFilter(e.target.value)}
            >
              <option value="all">お菓子タイプ</option>
              {sweetTypes.map(type => (
                type && <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}
          {displayCardType === 'playable' && (
            <select
              className="px-2 py-1 border rounded-md main-color text-sm"
              value={versionFilter}
              onChange={(e) => setVersionFilter(e.target.value)}
            >
              <option value="all">バージョン</option>
              {versions.map(version => (
                version && <option key={version} value={version}>{version}</option>
              ))}
            </select>
          )}
          <input
            type="text"
            placeholder="カード名検索..."
            className="px-2 py-1 border rounded-md flex-grow main-color text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 gap-1 overflow-auto max-h-[calc(75vh-50px)]`}>
          {filteredCards
            .sort((a, b) => {
              if (displayCardType === 'playable') {
                const versionCompare = (a.version || '').localeCompare(b.version || '');
                if (versionCompare !== 0) return versionCompare;
              }
              const idNumA = parseInt(a.id.split('_')[1], 10);
              const idNumB = parseInt(b.id.split('_')[1], 10);
              if (isNaN(idNumA) && isNaN(idNumB)) return a.id.localeCompare(b.id);
              if (isNaN(idNumA)) return 1;
              if (isNaN(idNumB)) return -1;
              return idNumA - idNumB;
            })
            .map((card) => (
              <div key={card.id} className="flex justify-center items-center">
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

      {filteredCards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          条件に一致するカードが見つかりませんでした。
        </div>
      )}
    </div>
  );
};

export default CardList;