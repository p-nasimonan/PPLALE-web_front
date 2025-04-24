/**
 * メインページコンポーネント
 * 
 * ぷぷりえーるデッキ構築アプリのメインページ
 * カードリストとデッキ構築エリアを表示する
 */

'use client';

import React, { useState, useEffect, useContext } from 'react';
import { CardInfo } from '@/types/card';
import CardList from '@/components/CardList';
import Deck from '@/components/Deck';
import ExportPopup from '@/components/ExportPopup';
import ImportPopup from '@/components/ImportPopup';
import Link from 'next/link';
import { DarkModeContext } from "./DarkModeProvider";
import { allYojoCards, allSweetCards } from '@/data/cards';

/**
 * メインページコンポーネント
 * 
 * @returns メインページコンポーネント
 */
export default function Home() {
  // 幼女デッキのカード
  const [yojoDeck, setYojoDeck] = useState<CardInfo[]>([]);
  // お菓子デッキのカード
  const [sweetDeck, setSweetDeck] = useState<CardInfo[]>([]);
  // 選択されているカード
  const [selectedCard, setSelectedCard] = useState<CardInfo | null>(null);
  // エクスポートポップアップの表示状態
  const [showExportPopup, setShowExportPopup] = useState(false);
  // インポートポップアップの表示状態
  const [showImportPopup, setShowImportPopup] = useState(false);

  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // デッキの状態を保持するための useEffect
  useEffect(() => {
    // 初回読み込み時にデッキを localStorage から取得
    const savedYojoDeck = localStorage.getItem('yojoDeck');
    const savedSweetDeck = localStorage.getItem('sweetDeck');

    if (savedYojoDeck) {
      setYojoDeck(JSON.parse(savedYojoDeck));
    }
    if (savedSweetDeck) {
      setSweetDeck(JSON.parse(savedSweetDeck));
    }
  }, []);

  // デッキが更新されたときに localStorage に保存
  useEffect(() => {
    localStorage.setItem('yojoDeck', JSON.stringify(yojoDeck));
  }, [yojoDeck]);

  useEffect(() => {
    localStorage.setItem('sweetDeck', JSON.stringify(sweetDeck));
  }, [sweetDeck]);

  // カードが選択されたときの処理
  const handleCardSelect = (card: CardInfo) => {
    setSelectedCard(card);
  };

  // カードがデッキに追加されたときの処理
  const handleAddToDeck = (card: CardInfo) => {
    if (card.type === '幼女' && yojoDeck.length < 20) {
      const updatedYojoDeck = [...yojoDeck, card];
      setYojoDeck(updatedYojoDeck);
      localStorage.setItem('yojoDeck', JSON.stringify(updatedYojoDeck)); // デッキを同期
    } else if (card.type === 'お菓子' && sweetDeck.length < 10) {
      const updatedSweetDeck = [...sweetDeck, card];
      setSweetDeck(updatedSweetDeck);
      localStorage.setItem('sweetDeck', JSON.stringify(updatedSweetDeck)); // デッキを同期
    }
  };

  // カードがデッキから削除されたときの処理
  const handleRemoveFromDeck = (card: CardInfo, deckType: string) => {
    if (deckType === '幼女') {
      const updatedYojoDeck = yojoDeck.filter(c => c.id !== card.id);
      setYojoDeck(updatedYojoDeck);
      localStorage.setItem('yojoDeck', JSON.stringify(updatedYojoDeck)); // デッキを同期
    } else {
      const updatedSweetDeck = sweetDeck.filter(c => c.id !== card.id);
      setSweetDeck(updatedSweetDeck);
      localStorage.setItem('sweetDeck', JSON.stringify(updatedSweetDeck)); // デッキを同期
    }
  };

  // デッキのカードが並べ替えられたときの処理
  const handleDeckReorder = (cards: CardInfo[], deckType: string) => {
    if (deckType === '幼女') {
      setYojoDeck(cards);
    } else {
      setSweetDeck(cards);
    }
  };

  // ドラッグ開始時の処理
  const handleDragStart = (e: React.DragEvent, card: CardInfo) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(card));
  };

  // ドロップ時の処理
  const handleDrop = (e: React.DragEvent, deckType: string) => {
    e.preventDefault();
    const cardData = e.dataTransfer.getData('text/plain');
    const card = JSON.parse(cardData) as CardInfo;
    
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

      // 幼女デッキのカードを取得
      const newYojoDeck = yojoIds
        .map(id => allYojoCards.find(card => parseInt(card.id, 10) === id))
        .filter((card): card is CardInfo => card !== undefined);

      // お菓子デッキのカードIDを取得
      const sweetIds = sweetCardIds
        .split(',')
        .filter(id => id.trim() !== '')
        .map(id => parseInt(id.trim(), 10));

      // お菓子デッキのカードを取得
      const newSweetDeck = sweetIds
        .map(id => allSweetCards.find(card => parseInt(card.id, 10) === id))
        .filter((card): card is CardInfo => card !== undefined);

      // デッキを更新
      setYojoDeck(newYojoDeck);
      setSweetDeck(newSweetDeck);

      // ポップアップを閉じる
      setShowImportPopup(false);
    } catch (error) {
      console.error('デッキのインポートに失敗しました:', error);
      alert('デッキのインポートに失敗しました');
    }
  };

  return (
    <div>
    <div className={showImportPopup||showExportPopup ? 'blur-sm ' : 'container'}>
      <header>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-center">ぷぷりえーる デッキ構築</h1>
          <button
            className="toggle-dark-mode"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
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
            <Link
              className="lnk-important"
              href="/2pick">
              2pickで構築する
            </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-2 mt-2">
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
              onCardRemove={(card) => handleRemoveFromDeck(card, '幼女')}
              onCardsReorder={(cards) => handleDeckReorder(cards, '幼女')}
            />
        </div>



     
        {/* カードリスト */}
        <div className="card">
          <CardList
            cards={allYojoCards}
            onCardSelect={handleCardSelect}
            selectedCardId={selectedCard?.id}
            draggable={true}
            onDragStart={handleDragStart}
            cardType="幼女" // 幼女カードリスト
          />
        </div>
      
        {/* デッキ構築エリア */}
        <div className="space-y-6">
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
                onCardRemove={(card) => handleRemoveFromDeck(card, 'お菓子')}
                onCardsReorder={(cards) => handleDeckReorder(cards, 'お菓子')}
              />
            </div>
          </div>
      </div>
      </div>

      <div className="card">
        <CardList
          cards={allSweetCards}
          onCardSelect={handleCardSelect}
          selectedCardId={selectedCard?.id}
          draggable={true}
          onDragStart={handleDragStart}
          cardType="お菓子" // 幼女カードリスト
        />
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
      </div>


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
