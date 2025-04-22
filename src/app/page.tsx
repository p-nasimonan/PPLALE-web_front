/**
 * メインページコンポーネント
 * 
 * ぷぷりえーるデッキ構築アプリのメインページ
 * カードリストとデッキ構築エリアを表示する
 */

'use client';

import React, { useState } from 'react';
import { Card, CardType, FruitType } from '@/types/card';
import CardList from '@/components/CardList';
import Deck from '@/components/Deck';
import cardData from '@/data/cards.json';
import ExportPopup from '@/components/ExportPopup';
import ImportPopup from '@/components/ImportPopup';

// サンプルカードデータ
const sampleCards: Card[] = cardData.cards.map(card => ({
  ...card,
  type: card.type as CardType,
  fruit: card.fruit as FruitType
}));

/**
 * メインページコンポーネント
 * 
 * @returns メインページコンポーネント
 */
export default function Home() {
  // すべてのカード
  const [allCards] = useState<Card[]>(sampleCards);
  // 幼女デッキのカード
  const [yojoDeck, setYojoDeck] = useState<Card[]>([]);
  // お菓子デッキのカード
  const [sweetDeck, setSweetDeck] = useState<Card[]>([]);
  // 選択されているカード
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  // エクスポートポップアップの表示状態
  const [showExportPopup, setShowExportPopup] = useState(false);
  // インポートポップアップの表示状態
  const [showImportPopup, setShowImportPopup] = useState(false);

  // カードが選択されたときの処理
  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
  };

  // カードがデッキに追加されたときの処理
  const handleAddToDeck = (card: Card) => {
    if (card.type === '幼女' && yojoDeck.length < 20) {
      setYojoDeck([...yojoDeck, card]);
    } else if (card.type === 'お菓子' && sweetDeck.length < 10) {
      setSweetDeck([...sweetDeck, card]);
    }
  };

  // カードがデッキから削除されたときの処理
  const handleRemoveFromDeck = (card: Card, deckType: string) => {
    if (deckType === '幼女') {
      setYojoDeck(yojoDeck.filter(c => c.id !== card.id));
    } else {
      setSweetDeck(sweetDeck.filter(c => c.id !== card.id));
    }
  };

  // デッキのカードが並べ替えられたときの処理
  const handleDeckReorder = (cards: Card[], deckType: string) => {
    if (deckType === '幼女') {
      setYojoDeck(cards);
    } else {
      setSweetDeck(cards);
    }
  };

  // ドラッグ開始時の処理
  const handleDragStart = (e: React.DragEvent, card: Card) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(card));
  };

  // ドロップ時の処理
  const handleDrop = (e: React.DragEvent, deckType: string) => {
    e.preventDefault();
    const cardData = e.dataTransfer.getData('text/plain');
    const card = JSON.parse(cardData) as Card;
    
    if (deckType === '幼女' && card.type === '幼女' && yojoDeck.length < 20) {
      setYojoDeck([...yojoDeck, card]);
    } else if (deckType === 'お菓子' && card.type === 'お菓子' && sweetDeck.length < 10) {
      setSweetDeck([...sweetDeck, card]);
    }
  };

  // ドラッグオーバー時の処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  

  // デッキをエクスポートする処理
  const handleExportDeck = () => {
    // エクスポートポップアップを表示
    setShowExportPopup(true);
  };

  // デッキをインポートする処理
  const handleImportDeck = (yojoCardIds: string, sweetCardIds: string) => {
    try {
      // 幼女デッキのカードIDを取得
      const yojoIds = yojoCardIds
        .split(',')
        .filter(id => id.trim() !== '')
        .map(id => parseInt(id.trim(), 10));
      
      // お菓子デッキのカードIDを取得
      const sweetIds = sweetCardIds
        .split(',')
        .filter(id => id.trim() !== '')
        .map(id => parseInt(id.trim(), 10));
      
      // カードIDからカードオブジェクトを取得
      const newYojoDeck = yojoIds
        .map(id => allCards.find(card => parseInt(card.id, 10) === id))
        .filter((card): card is Card => card !== undefined);
      
      const newSweetDeck = sweetIds
        .map(id => allCards.find(card => parseInt(card.id, 10) === id))
        .filter((card): card is Card => card !== undefined);
      
      // デッキを更新
      setYojoDeck(newYojoDeck);
      setSweetDeck(newSweetDeck);
      
      // ポップアップを閉じる
      setShowImportPopup(false);
      
      alert('デッキをインポートしました');
    } catch (error) {
      console.error('デッキのインポートに失敗しました:', error);
      alert('デッキのインポートに失敗しました');
    }
  };

  return (
    <div className="container">
      <header>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-center">ぷぷりえーる デッキ構築</h1>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button
            className="btn-export"
            onClick={handleExportDeck}
          >
            デッキをエクスポート
          </button>
          <button
            className="btn-import"
            onClick={() => setShowImportPopup(true)}
          >
            デッキをインポート
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3">
        {/* カードリスト */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">カードリスト</h2>
          <CardList
            cards={allCards}
            onCardSelect={handleCardSelect}
            selectedCardId={selectedCard?.id}
            draggable={true}
            onDragStart={handleDragStart}
          />
        </div>

        {/* デッキ構築エリア */}
        <div className="space-y-6">
          {/* 幼女デッキ */}
          <div 
            className="card dropzone"
            onDrop={(e) => handleDrop(e, '幼女')}
            onDragOver={handleDragOver}
          >
            <h2 className="text-xl font-bold mb-4">幼女デッキ ({yojoDeck.length}/20)</h2>
            <Deck
              cards={yojoDeck}
              type="幼女"
              maxCards={20}
              onCardRemove={(card) => handleRemoveFromDeck(card, '幼女')}
              onCardsReorder={(cards) => handleDeckReorder(cards, '幼女')}
            />
          </div>

          {/* お菓子デッキ */}
          <div 
            className="card dropzone"
            onDrop={(e) => handleDrop(e, 'お菓子')}
            onDragOver={handleDragOver}
          >
            <h2 className="text-xl font-bold mb-4">お菓子デッキ ({sweetDeck.length}/10)</h2>
            <Deck
              cards={sweetDeck}
              type="お菓子"
              maxCards={10}
              onCardRemove={(card) => handleRemoveFromDeck(card, 'お菓子')}
              onCardsReorder={(cards) => handleDeckReorder(cards, 'お菓子')}
            />
          </div>
        </div>
      </div>

      {/* 選択されたカードの詳細 */}
      {selectedCard && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 transform translate-y-full transition-transform duration-300 ease-in-out">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">{selectedCard.name}</h3>
              <p className="text-sm text-gray-600">{selectedCard.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => handleAddToDeck(selectedCard)}
                disabled={
                  (selectedCard.type === '幼女' && yojoDeck.length >= 20) ||
                  (selectedCard.type === 'お菓子' && sweetDeck.length >= 10)
                }
              >
                デッキに追加
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedCard(null)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* エクスポートポップアップ */}
      {showExportPopup && (
        <ExportPopup
          yojoDeck={yojoDeck}
          sweetDeck={sweetDeck}
          onClose={() => setShowExportPopup(false)}
        />
      )}

      {/* インポートポップアップ */}
      {showImportPopup && (
        <ImportPopup
          onImport={handleImportDeck}
          onClose={() => setShowImportPopup(false)}
        />
      )}
    </div>
  );
}
