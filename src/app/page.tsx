/**
 * メインページコンポーネント
 * 
 * ぷぷりえーるデッキ構築アプリのメインページ
 * カードリストとデッキ構築エリアを表示する
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CardInfo } from '@/types/card';
import CardList from '@/components/CardList';
import Deck from '@/components/Deck';
import ExportPopup from '@/components/ExportPopup';
import ImportPopup from '@/components/ImportPopup';
import Link from 'next/link';
import { useDarkMode } from "./DarkModeProvider";
import { useSettings } from "./SettingsProvider";
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards';
import LoadingScreen from '@/components/LoadingScreen';

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
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const { isDarkMode } = useDarkMode();
  const { isTwoCardLimit } = useSettings();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    // 画像URLリストを作成
    const allImageUrls = [
      ...allYojoCards.map(card => card.imageUrl),
      ...allSweetCards.map(card => card.imageUrl),
      // 必要ならallPlayableCardsも
    ];
    let loaded = 0;
    const total = allImageUrls.length;

    if (total === 0) {
      setIsLoading(false);
      setProgress(100);
      return;
    }

    allImageUrls.forEach(url => {
      const img = new window.Image();
      img.src = url;
      img.onload = img.onerror = () => {
        loaded++;
        setProgress(Math.round((loaded / total) * 100));
        if (loaded === total) {
          setIsLoading(false);
        }
      };
    });
  }, []);

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

  const resetAllDeck = () => {
    setYojoDeck([]);
    setSweetDeck([]);
  }

  // カードが選択されたときの処理
  const handleCardSelect = (card: CardInfo) => {
    setSelectedCard(card);
  };

  // カードがデッキに追加されたときの処理
  const onAddToDeck = (card: CardInfo) => {
    if (isTwoCardLimit) {
      // 2枚制限の場合、同じカードは最大2枚まで
      const cardCount = card.type === '幼女' 
        ? yojoDeck.filter(c => c.id === card.id).length
        : sweetDeck.filter(c => c.id === card.id).length;
      
      if (cardCount >= 2) {
        return;
      }
    }

    if (card.type === '幼女' && yojoDeck.length < 20) {
      const updatedYojoDeck = [...yojoDeck, card];
      setYojoDeck(updatedYojoDeck);
      localStorage.setItem('yojoDeck', JSON.stringify(updatedYojoDeck));
    } else if (card.type === 'お菓子' && sweetDeck.length < 10) {
      const updatedSweetDeck = [...sweetDeck, card];
      setSweetDeck(updatedSweetDeck);
      localStorage.setItem('sweetDeck', JSON.stringify(updatedSweetDeck));
    }
  };

  // カードがデッキから削除されたときの処理
  const handleRemoveFromDeck = (card: CardInfo, deckType: string) => {
    if (deckType === '幼女') {
      const updatedYojoDeck = yojoDeck.filter(c => c.id !== card.id);
      setYojoDeck(updatedYojoDeck);
      localStorage.setItem('yojoDeck', JSON.stringify(updatedYojoDeck));
    } else {
      const updatedSweetDeck = sweetDeck.filter(c => c.id !== card.id);
      setSweetDeck(updatedSweetDeck);
      localStorage.setItem('sweetDeck', JSON.stringify(updatedSweetDeck));
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
    
    if (isTwoCardLimit) {
      // 2枚制限の場合、同じカードは最大2枚まで
      const cardCount = deckType === '幼女'
        ? yojoDeck.filter(c => c.id === card.id).length
        : sweetDeck.filter(c => c.id === card.id).length;
      
      if (cardCount >= 2) {
        return;
      }
    }
    
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

  

  // デッキに追加可能かどうかを判定
  const canAddToDeck = (card: CardInfo) => {
    if (card.type === '幼女') {
      return yojoDeck.length < 20;
    } else {
      return sweetDeck.length < 10;
    }
  };

  return (
    <div>
      <LoadingScreen isLoading={isLoading} progress={progress} />
      <div className={showImportPopup||showExportPopup ? 'blur-sm container' : 'container'}>
        <header>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-center">ぷぷりえーる デッキ構築</h1>
            <div className="flex items-center gap-2">
              <button
                className="btn-reset"
                onClick={resetAllDeck}
              >
                リセット
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
                cardType="幼女"
                canAddToDeck={canAddToDeck}
                onAddToDeck={onAddToDeck}
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
                onCardRemove={(card) => handleRemoveFromDeck(card, 'お菓子')}
                onCardsReorder={(cards) => handleDeckReorder(cards, 'お菓子')}
              />
            </div>

            {/* カードリスト */}
            <div className="card">
              <CardList
                cards={allSweetCards}
                onCardSelect={handleCardSelect}
                selectedCardId={selectedCard?.id}
                draggable={true}
                onDragStart={handleDragStart}
                cardType="お菓子"
                canAddToDeck={canAddToDeck}
                onAddToDeck={onAddToDeck}
              />
            </div>

            {/* カードリスト */}
            <div className="card">
              <CardList
                cards={[...allPlayableCards].sort((a, b) => (a.version || '').localeCompare(b.version || ''))} // バージョンでソート
                onCardSelect={handleCardSelect}
                selectedCardId={selectedCard?.id}
                draggable={true}
                onDragStart={handleDragStart}
                cardType="プレイアブル"
                canAddToDeck={canAddToDeck}
                onAddToDeck={onAddToDeck}
              />
            </div>
          </div>
        </div>
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
