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
import { useDarkMode } from "../../DarkModeProvider";
import { useSettings } from "../../SideMenuProvider";
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';


/**
 * メインページコンポーネント
 * 
 * @returns メインページコンポーネント
 */
export default function Home() {
  const { user } = useAuth();
  // 幼女デッキのカード
  const [yojoDeck, setYojoDeck] = useState<CardInfo[]>([]);
  // お菓子デッキのカード
  const [sweetDeck, setSweetDeck] = useState<CardInfo[]>([]);
  // プレイアブルカード
  const [selectedPlayableCard, setSelectedPlayableCard] = useState<CardInfo | null>(null);


  // 選択されているカード
  const [selectedCard, setSelectedCard] = useState<CardInfo | null>(null);
  // エクスポートポップアップの表示状態
  const [showExportPopup, setShowExportPopup] = useState(false);
  // インポートポップアップの表示状態
  const [showImportPopup, setShowImportPopup] = useState(false);

  const { isDarkMode } = useDarkMode();
  const { isTwoCardLimit } = useSettings();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // デッキの状態をFirebaseから取得
  useEffect(() => {
    const fetchDeck = async () => {
      if (!user) return;

      try {
        const deckRef = doc(db, 'decks', user.uid);
        const deckDoc = await getDoc(deckRef);
        
        if (deckDoc.exists()) {
          const data = deckDoc.data();
          setYojoDeck(data.yojoDeck || []);
          setSweetDeck(data.sweetDeck || []);
          setSelectedPlayableCard(data.selectedPlayableCard || null);
        }
      } catch (error) {
        console.error('デッキの取得に失敗しました:', error);
      }
    };

    fetchDeck();
  }, [user]);

  // デッキの状態をFirebaseに保存
  useEffect(() => {
    const saveDeck = async () => {
      if (!user) return;

      try {
        const deckRef = doc(db, 'decks', user.uid);
        await setDoc(deckRef, {
          yojoDeck,
          sweetDeck,
          selectedPlayableCard,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('デッキの保存に失敗しました:', error);
      }
    };

    saveDeck();
  }, [user, yojoDeck, sweetDeck, selectedPlayableCard]);

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
    } else if (card.type === 'お菓子' && sweetDeck.length < 10) {
      const updatedSweetDeck = [...sweetDeck, card];
      setSweetDeck(updatedSweetDeck);
    } else if (card.type === 'プレイアブル') {
      setSelectedPlayableCard(card);
    }
  };

  // カードがデッキから削除されたときの処理
  const handleRemoveFromDeck = (card: CardInfo, deckType: string) => {
    if (deckType === '幼女') {
      const updatedYojoDeck = yojoDeck.filter(c => c.id !== card.id);
      setYojoDeck(updatedYojoDeck);
    } else {
      const updatedSweetDeck = sweetDeck.filter(c => c.id !== card.id);
      setSweetDeck(updatedSweetDeck);
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

  // イベントリスナーの設定
  useEffect(() => {
    const handleResetDeck = () => resetAllDeck();
    const handleExportDeck = () => setShowExportPopup(true);
    const handleImportDeck = () => setShowImportPopup(true);

    window.addEventListener('resetDeck', handleResetDeck);
    window.addEventListener('exportDeck', handleExportDeck);
    window.addEventListener('importDeck', handleImportDeck);

    return () => {
      window.removeEventListener('resetDeck', handleResetDeck);
      window.removeEventListener('exportDeck', handleExportDeck);
      window.removeEventListener('importDeck', handleImportDeck);
    };
  }, []);

  return (
    <div>
      <div className={showImportPopup||showExportPopup ? 'blur-sm container' : 'container'}>
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-2">
          {/* デッキ構築エリア */}
          <div className="space-y-5">
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
                selectedCardId={selectedPlayableCard?.id}
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
          playableCard={selectedPlayableCard}
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
