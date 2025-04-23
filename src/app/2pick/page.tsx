'use client';

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { CardInfo, CardType, FruitType } from '@/types/card';
import cardData from '@/data/cards.json';
import Link from 'next/link';
import { DarkModeContext } from "../DarkModeProvider";
import Deck from '@/components/Deck';
import CardSelection from './components/CardSelection'; // 新しいコンポーネントをインポート

// サンプルカードデータ
const sampleCards: CardInfo[] = cardData.cards.map(card => ({
  ...card,
  type: card.type as CardType,
  fruit: card.fruit as FruitType
}));

export default function TwoPick() {
  // すべてのカード
  const [allCards] = useState<CardInfo[]>(sampleCards);
  // 選択されたカード
  const [selectedCards, setSelectedCards] = useState<CardInfo[]>([]);
  // 現在の選択フェーズ（幼女かお菓子か）
  const [currentPhase, setCurrentPhase] = useState<CardType>('幼女');
  // 現在表示されている選択肢
  const [currentChoices, setCurrentChoices] = useState<CardInfo[]>([]);

  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  
  const [deck, setDeck] = useState<CardInfo[]>([]); // 幼女デッキ
  const [isShowDeck, setIsShowDeck] = useState(false); // デッキ確認ポップアップの表示状態
  const [round, setRound] = useState(1); // 現在のラウンド

  // 選択肢を更新する関数
  const updateChoices = useCallback(() => {
    // 現在のフェーズで種類を合わせて、すでに2つ以上選択されているカードを除外
    const selectedCardCounts = selectedCards.reduce((acc, card) => {
      acc[card.id] = (acc[card.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const availableCards = allCards.filter(
      card => card.type === currentPhase && (selectedCardCounts[card.id] || 0) < 2
    );

    const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
    setCurrentChoices(shuffled.slice(0, 4));
  }, [allCards, currentPhase, selectedCards]);

  // ラウンドが変わったときに選択肢を更新
  useEffect(() => {
    updateChoices();
  }, [currentPhase, updateChoices]);

  // カードが選択されたときの処理
  const handleCardSelect = (card1: CardInfo, card2: CardInfo) => {
    if (deck.length < 30) {
      if (currentPhase === '幼女') {
        setSelectedCards([...selectedCards, card1, card2]);
        setDeck([...deck, card1, card2]);
      } else {
        setSelectedCards([...selectedCards, card1]);
        setDeck([...deck, card1]);
      }
      // 20枚選択したらお菓子を選択
      if (currentPhase === '幼女' && deck.length >= 20) {
        setCurrentPhase('お菓子');
        setRound(1);
      }

      setRound(round + 1);

      updateChoices();
      
    }
  };

  // デッキ確認ボタンの処理
  const showDeck = () => {
    setIsShowDeck(isShowDeck => !isShowDeck);
  };



  return (
    <div className="container">
      <header className="flex-col">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-center">2pick デッキ構築</h1>
          <Link href="/" className="text-1xl text-center">
            通常構築に戻る
          </Link>
          <button
            className="toggle-dark-mode"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <div className="mt-4 shadow-md flex flex-col items-center">
        {deck.length < 30 ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-center">
              {round} / {currentPhase == "幼女" ? 10 : 5}: {currentPhase}カードを選択してください
            </h2>
            <div className="flex justify-between w-full max-w-4xl items-center">
              {/* 左側のカード選択 */}
              {currentChoices.length >= 2 && (
                <CardSelection
                  card1={currentChoices[0]}
                  card2={currentChoices[1]}
                  onSelect={() => handleCardSelect(currentChoices[0], currentChoices[1])}
                />
              )}

              {/* デッキ確認ボタン */}
              <div className="flex justify-center">
                <button
                  className="btn-import"
                  onClick={() => showDeck()}
                >
                  デッキ確認
                </button>
              </div>

              {/* 右側のカード選択 */}
              {currentChoices.length >= 4 && (
                <CardSelection
                  card1={currentChoices[2]}
                  card2={currentChoices[3]}
                  onSelect={() => handleCardSelect(currentChoices[2], currentChoices[3])}
                />
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">デッキ構築完了！</h2>
            <p className="mb-4">選択したカードでデッキが完成しました。</p>
            <Link href="/" className="btn-export">
              ホームに戻る
            </Link>
          </div>

        )}
        {isShowDeck && (
            <Deck
              cards={deck}
              type={currentPhase}
              removeable={false}
              ></Deck>
          )}
      </div>
    </div>
  );
}