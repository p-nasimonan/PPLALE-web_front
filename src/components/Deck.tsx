/**
 * デッキコンポーネント
 * 
 * デッキの表示と操作を行うコンポーネント
 * カードの追加・削除・並べ替えなどの機能を提供する
 */

import React, { useState, useEffect } from 'react';
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
  /** ソート基準 */
  defaultSortCriteria?: 'none' | 'id' | 'name' | 'cost' | 'attack' | 'hp';
}

/**
 * デッキ内のカードをソートする関数
 * @param cards - ソート対象のカードリスト
 * @param criteria - ソート基準 ('none', 'id', 'name', 'cost', 'attack', 'hp')
 * @returns ソートされたカードリスト
 */
const sortCards = (cards: CardInfo[], criteria: 'none' | 'id' | 'name' | 'cost' | 'attack' | 'hp'): CardInfo[] => {
  if (criteria === 'none') {
    return cards; // ソートしない
  }
  return [...cards].sort((a, b) => {
    if (criteria === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (criteria === 'id') {
      const idA = parseInt(a.id.replace(/\D/g, ''), 10); // 数字部分を抽出
      const idB = parseInt(b.id.replace(/\D/g, ''), 10); // 数字部分を抽出
      return idA - idB;
    }
    return (a[criteria] || 0) - (b[criteria] || 0);
  });
};

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
  defaultSortCriteria = 'none'
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

  // ソート基準の状態
  const [sortCriteria, setSortCriteria] = useState<'none' | 'id' | 'name' | 'cost' | 'attack' | 'hp'>(defaultSortCriteria);

  // ソートされたカードリスト（重複を除く）
  const [uniqueSortedCards, setUniqueSortedCards] = useState<CardInfo[]>([]);

  // ソート基準が変更されたときにデッキを更新
  useEffect(() => {
    const sortedCards = sortCards(
      cards.filter((card, index, self) => index === self.findIndex(c => c.id === card.id)),
      sortCriteria
    );
    setUniqueSortedCards(sortedCards);
  }, [cards, sortCriteria]);

  // カードの重複数を計算する関数
  const getCardCount = (card: CardInfo) => {
    return cards.filter(c => c.id === card.id).length;
  };

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
        <div className="relative">
          <select
            className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value as 'none' | 'id' | 'name' | 'cost' | 'attack' | 'hp')}
          >
            <option value="none">ソートしない</option>
            <option value="id">ID順</option>
            <option value="name">名前順</option>
            <option value="cost">コスト順</option>
            <option value="attack">攻撃力順</option>
            <option value="hp">HP順</option>
          </select>
        </div>
      </div>

      {/* デッキのカードリスト */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 overflow-auto max-h-[calc(70vh-50px)]">
        {uniqueSortedCards.map((card, index) => (
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
              count={getCardCount(card)} // 重複数を表示
              onRemove={removeable ? handleCardRemove : undefined}
              showRemoveButton={removeable}
              isInDeck={true}
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