'use client';

import React, { useState, useEffect } from 'react';
import { Card as CardInterface, CardType as CardTypeEnum, FruitType } from '@/types/card';
import CardList from '@/components/CardList';
import Deck from '@/components/Deck';
import Card from '@/components/Card';
import cardData from '@/data/cards.json';
import Link from 'next/link';

// サンプルカードデータ
const sampleCards: CardInterface[] = cardData.cards.map(card => ({
  ...card,
  type: card.type as CardTypeEnum,
  fruit: card.fruit as FruitType
}));

export default function TwoPick() {
  // すべてのカード
  const [allCards] = useState<CardInterface[]>(sampleCards);
  // 選択されたカード
  const [selectedCards, setSelectedCards] = useState<CardInterface[]>([]);
  // 現在の選択フェーズ（幼女かお菓子か）
  const [currentPhase, setCurrentPhase] = useState<CardTypeEnum>('幼女');
  // 現在表示されている選択肢
  const [currentChoices, setCurrentChoices] = useState<CardInterface[]>([]);

  // 選択肢を更新する関数
  const updateChoices = () => {
    const availableCards = allCards.filter(card => card.type === currentPhase);
    const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
    setCurrentChoices(shuffled.slice(0, 2));
  };

  // フェーズが変わったときに選択肢を更新
  useEffect(() => {
    updateChoices();
  }, [currentPhase]);

  // カードが選択されたときの処理
  const handleCardSelect = (card: CardInterface) => {
    if (selectedCards.length < 2) {
      setSelectedCards([...selectedCards, card]);
      if (selectedCards.length === 0) {
        setCurrentPhase('お菓子');
      }
    }
  };

  // カードが削除されたときの処理
  const handleCardRemove = (card: CardInterface) => {
    setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    if (selectedCards.length === 2) {
      setCurrentPhase('幼女');
      updateChoices();
    }
  };

  return (
    <div className="container">
      <header>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-center">2pick デッキ構築</h1>
          <Link href="/" className="btn-secondary">
            通常構築に戻る
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {/* カード選択エリア */}
        <div className="col-span-2">
          <h2 className="text-xl font-bold mb-4">
            {currentPhase}カードを選択してください
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {currentChoices.map((card) => (
              <div key={card.id} className="flex justify-center">
                <Card
                  card={card}
                  onClick={() => handleCardSelect(card)}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 選択されたカード */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">選択されたカード</h2>
          <div className="grid grid-cols-1 gap-4">
            {selectedCards.map((card) => (
              <div key={card.id} className="relative">
                <Card
                  card={card}
                  draggable={false}
                />
                <button
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  onClick={() => handleCardRemove(card)}
                  aria-label={`${card.name}を削除`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 