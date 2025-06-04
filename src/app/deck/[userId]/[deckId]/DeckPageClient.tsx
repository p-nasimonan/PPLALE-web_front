'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardInfo } from '@/types/card';
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CardList from '@/components/CardList';
import { useAuth } from '@/lib/auth';
import ExportPopup from '@/components/ExportPopup';
import ImportPopup from '@/components/ImportPopup';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import ShareButtons from '@/components/ShareButtons';
import { useSettings } from '../../../SideMenuProvider';
import DeckList from '@/components/DeckList';
import TabButtons, { TabDefinition } from '@/components/TabButtons';

const yojoLimit = 20;
const sweetLimit = 10;

interface DeckPageClientProps {
  initialDeckName: string | null;
  initialYojoDeck: CardInfo[];
  initialSweetDeck: CardInfo[];
  initialSelectedPlayableCard: CardInfo | null;
  isInitialDataLoaded: boolean;
  initialError: string | null;
  serverUserId: string; // Passed from server component (params.userId)
  serverDeckId: string; // Passed from server component (params.deckId)
}

export default function DeckPageClient({ 
  initialDeckName,
  initialYojoDeck,
  initialSweetDeck,
  initialSelectedPlayableCard,
  isInitialDataLoaded,
  initialError,
  serverUserId,
  serverDeckId
}: DeckPageClientProps) {
  const router = useRouter();
  const userId = serverUserId;
  const deckId = serverDeckId;

  const { user } = useAuth();
  const { isTwoCardLimit } = useSettings();
  
  const [deckName, setDeckName] = useState(initialDeckName || '無名のデッキ');
  const [isEditing, setIsEditing] = useState(false);
  const [yojoDeck, setYojoDeck] = useState<CardInfo[]>(initialYojoDeck);
  const [sweetDeck, setSweetDeck] = useState<CardInfo[]>(initialSweetDeck);
  const [selectedPlayableCard, setSelectedPlayableCard] = useState<CardInfo | null>(initialSelectedPlayableCard);
  const [isLoading, setIsLoading] = useState(!isInitialDataLoaded); // 初期データロード済みならfalse
  const [error, setError] = useState<string | null>(initialError);
  const [deckViewActiveTab, setDeckViewActiveTab] = useState<'yojo' | 'sweet' | 'playable'>('yojo');
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [isLoaded, setIsLoaded] = useState(isInitialDataLoaded); // Firebaseへの自動保存制御用

  useEffect(() => {
    // サーバーからデータが渡された場合、それを使用
    setDeckName(initialDeckName || '無名のデッキ');
    setYojoDeck(initialYojoDeck);
    setSweetDeck(initialSweetDeck);
    setSelectedPlayableCard(initialSelectedPlayableCard);
    setError(initialError);
    setIsLoading(!isInitialDataLoaded);
    setIsLoaded(isInitialDataLoaded);

    // userId === 'local' の場合、またはサーバーからのデータロードに失敗した場合のフォールバック
    if (userId === 'local' && !isInitialDataLoaded) {
      const fetchLocalData = () => {
        try {
          setIsLoading(true);
          setError(null);

          const paramsFromUrl = new URLSearchParams(window.location.search);
          const yojoIds = paramsFromUrl.get('yojo')?.split(',') || [];
          const sweetIds = paramsFromUrl.get('sweet')?.split(',') || [];
          const playableId = paramsFromUrl.get('playable');

          const savedName = localStorage.getItem(`deck_${deckId}_name`);
          const savedYojo = localStorage.getItem(`deck_${deckId}_yojo`);
          const savedSweet = localStorage.getItem(`deck_${deckId}_sweet`);
          const savedPlayable = localStorage.getItem(`deck_${deckId}_playable`);

          if (yojoIds.length > 0 || sweetIds.length > 0 || playableId) {
            const newYojoDeck: CardInfo[] = yojoIds
              .map(id => allYojoCards.find(card => card.id === id))
              .filter((card): card is CardInfo => card !== undefined);
            const newSweetDeck: CardInfo[] = sweetIds
              .map(id => allSweetCards.find(card => card.id === id))
              .filter((card): card is CardInfo => card !== undefined);
            const newPlayableCard = playableId
              ? allPlayableCards.find(card => card.id === playableId) || null
              : null;

            setYojoDeck(newYojoDeck);
            setSweetDeck(newSweetDeck);
            setSelectedPlayableCard(newPlayableCard);
            setDeckName('共有されたデッキ');
          } else if(savedName || savedYojo || savedSweet || savedPlayable){
            setDeckName(savedName || '無名のデッキ');
            setYojoDeck(savedYojo ? JSON.parse(savedYojo) : []);
            setSweetDeck(savedSweet ? JSON.parse(savedSweet) : []);
            setSelectedPlayableCard(savedPlayable ? JSON.parse(savedPlayable) : null);
          }
        } catch (e) {
          console.error("ローカルデータの読み込みに失敗:", e);
          setError("ローカルデータの読み込みに失敗しました");
        } finally {
          setIsLoading(false);
          setIsLoaded(true); // ローカルデータロード後、isLoadedをtrueに
        }
      };
      fetchLocalData();
    }
  }, [initialDeckName, initialYojoDeck, initialSweetDeck, initialSelectedPlayableCard, isInitialDataLoaded, initialError, userId, deckId]);

  useEffect(() => {
    const handleExport = () => setShowExportPopup(true);
    const handleImport = () => setShowImportPopup(true);

    window.addEventListener('exportDeck', handleExport);
    window.addEventListener('importDeck', handleImport);

    return () => {
      window.removeEventListener('exportDeck', handleExport);
      window.removeEventListener('importDeck', handleImport);
    };
  }, []);

  // デッキの変更をローカルストレージに保存 (localユーザーの場合)
  useEffect(() => {
    if (userId === 'local') {
      localStorage.setItem(`deck_${deckId}_yojo`, JSON.stringify(yojoDeck));
    }
  }, [yojoDeck, deckId, userId]);

  useEffect(() => {
    if (userId === 'local') {
      localStorage.setItem(`deck_${deckId}_sweet`, JSON.stringify(sweetDeck));
    }
  }, [sweetDeck, deckId, userId]);

  useEffect(() => {
    if (userId === 'local') {
      localStorage.setItem(`deck_${deckId}_playable`, JSON.stringify(selectedPlayableCard));
    }
  }, [selectedPlayableCard, deckId, userId]);

  // Firebaseへの保存
  useEffect(() => {
    if (!isLoaded) return; // データロードが終わるまで保存しない
    if (userId === 'local' || !user || user.uid !== userId) return; // ローカルユーザーまたは非オーナーは保存しない

    const saveToFirebase = async () => {
      try {
        const deckRef = doc(db, 'users', userId, 'decks', deckId);
        await setDoc(deckRef, {
          name: deckName,
          yojoDeckIds: yojoDeck.map(card => card.id),
          sweetDeckIds: sweetDeck.map(card => card.id),
          playableCardId: selectedPlayableCard?.id || null,
          updatedAt: new Date()
        }, { merge: true });
      } catch (error) {
        console.error('デッキの更新に失敗しました:', error);
        if (error instanceof Error) {
          console.error('エラーの詳細:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
        }
        alert(`デッキの更新に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
      }
    };

    saveToFirebase();
  }, [user, userId, deckId, isLoaded, deckName, yojoDeck, sweetDeck, selectedPlayableCard]);


  const handleNameChange = async (newName: string) => {
    if (userId === 'local') {
      setIsEditing(false);
      setDeckName(newName);
      localStorage.setItem(`deck_${deckId}_name`, newName);
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          router.push(`/deck/${result.user.uid}/${deckId}`);
        }
      } catch (error) {
        console.error('ログインエラー:', error);
        alert('ログインに失敗しました');
      }
      return;
    }
    if (!user || user.uid !== userId) {
      setIsEditing(false);
      setDeckName(deckName); // 元のデッキ名に戻すか、何もしない
      return;
    }
    try {
      const deckRef = doc(db, 'users', userId, 'decks', deckId);
      await setDoc(deckRef, {
        name: newName,
        updatedAt: new Date()
      }, { merge: true });
      setDeckName(newName);
      setIsEditing(false);
    } catch (error) {
      console.error('デッキ名の更新に失敗しました:', error);
      alert('デッキ名の更新に失敗しました');
    }
  };

  const handleAddCard = (card: CardInfo) => {
    if (canAddToDeck(card)){
      if (card.type === '幼女' && yojoDeck.length < yojoLimit) {
        setYojoDeck(prev => [...prev, card]);
      } else if (card.type === 'お菓子' && sweetDeck.length < sweetLimit) {
        setSweetDeck(prev => [...prev, card]);
      } else if (card.type === 'プレイアブル' && !selectedPlayableCard) {
        setSelectedPlayableCard(card);
      } 
    }
  };

  const handleRemoveFromYojoDeck = (card: CardInfo) => {
    setYojoDeck(prev => prev.filter(c => c.id !== card.id));
  };

  const handleRemoveFromSweetDeck = (card: CardInfo) => {
    setSweetDeck(prev => prev.filter(c => c.id !== card.id));
  };

  const handleRemovePlayableCard = () => {
    setSelectedPlayableCard(null);
  };

  const handleDragStart = (e: React.DragEvent, card: CardInfo) => {
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('cardType', card.type);
  };


  const handleDrop = (e: React.DragEvent, deckType: string) => {
    e.preventDefault();

    const cardId = e.dataTransfer.getData('cardId');
    const cardType = e.dataTransfer.getData('cardType');

    let cardToAdd: CardInfo | undefined;
    if (cardType === '幼女') cardToAdd = allYojoCards.find(c => c.id === cardId);
    else if (cardType === 'お菓子') cardToAdd = allSweetCards.find(c => c.id === cardId);
    else if (cardType === 'プレイアブル') cardToAdd = allPlayableCards.find(c => c.id === cardId);

    if (cardToAdd && canAddToDeck(cardToAdd)) {
      if (cardType === '幼女' && deckType === 'yojo') {
        handleAddCard(cardToAdd);
      } else if (cardType === 'お菓子' && deckType === 'sweet') {
        handleAddCard(cardToAdd);
      } else if (cardType === 'プレイアブル' && deckType === 'playable') {
        handleAddCard(cardToAdd);
      }
    }
  };

  const canAddToDeck = (card: CardInfo) => {
    if (isTwoCardLimit) {
      if (card.type === '幼女') {
        const count = yojoDeck.filter(c => c.id === card.id).length;
        if (count >= 2) return false;
      } else if (card.type === 'お菓子') {
        const count = sweetDeck.filter(c => c.id === card.id).length;
        if (count >= 2) return false;
      }
    }
    if (card.sweetType == "動物さんソーダ"){
      const count = sweetDeck.filter(c => c.id == card.id).length;
      if (count >= 1) return false;
    }

    if (card.type === '幼女') {
      return yojoDeck.length < yojoLimit;
    } else if (card.type === 'お菓子') {
      return sweetDeck.length < sweetLimit;
    } else if (card.type === 'プレイアブル') {
      return !selectedPlayableCard;
    }
    return false;
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  const isOwner = user ? user.uid === userId : userId === 'local';

  const deckViewTabs: TabDefinition[] = [
    { key: 'yojo', label: '幼女' },
    { key: 'sweet', label: 'お菓子' },
    { key: 'playable', label: 'プレイアブル' },
  ];

  const getCardListColor = () => {
    return deckViewActiveTab === 'yojo' ? 'yojo-deck-color'
    : deckViewActiveTab === 'sweet' ? 'sweet-deck-color'
    : deckViewActiveTab === 'playable' ? 'playable-deck-color'
    : 'deck-color';
  };

  return (
    <div className="container mx-auto p-2">
      <div className="flex items-center mb-5">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              onBlur={() => handleNameChange(deckName)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNameChange(deckName);
                }
              }}
              className="text-3xl font-bold p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <h1 
              className="text-3xl font-bold"
              onClick={() => isOwner && setIsEditing(true)}
              style={{ cursor: isOwner ? 'pointer' : 'default' }}
            >
              {deckName}
              {isOwner && (
                <span className="ml-2 text-sm text-gray-500">
                  (クリックして編集)
                </span>
              )}
            </h1>
            <ShareButtons 
              share_url={typeof window !== 'undefined' ? window.location.href : ''}
              share_text={`${deckName} #お菓子争奪戦争ぷぷりえーる`}
              isLocal={userId === 'local'}
              yojoDeck={yojoDeck}
              sweetDeck={sweetDeck}
              playableCard={selectedPlayableCard}
            />
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 ${isOwner ? 'lg:grid-cols-2' : ''} gap-2`}>
        <DeckList
          yojoDeck={yojoDeck}
          sweetDeck={sweetDeck}
          playableCard={selectedPlayableCard}
          isOwner={isOwner}
          activeTabKey={deckViewActiveTab}
          onRemoveFromYojoDeck={handleRemoveFromYojoDeck}
          onRemoveFromSweetDeck={handleRemoveFromSweetDeck}
          onRemovePlayableCard={handleRemovePlayableCard}
          onDropDeck={handleDrop}
        />

        {isOwner && (
          <div className="card">
            <TabButtons
              tabs={deckViewTabs}
              activeTabKey={deckViewActiveTab}
              onTabClick={(key: string) => setDeckViewActiveTab(key as 'yojo' | 'sweet' | 'playable')}
              variant="cardList"
            />
          <div className={` ${getCardListColor()} rounded-b-md p-2`}>
            <CardList
              allYojoCards={allYojoCards}
              allSweetCards={allSweetCards}
              allPlayableCards={allPlayableCards}
              displayCardType={deckViewActiveTab}
              onAddToDeck={handleAddCard}
              canAddToDeck={canAddToDeck}
              draggable={true}
              onDragStart={handleDragStart}
            />
          </div>
          </div>
        )}
      </div>

      {showExportPopup && (
        <ExportPopup
          yojoDeck={yojoDeck}
          sweetDeck={sweetDeck}
          playableCard={selectedPlayableCard}
          onClose={() => setShowExportPopup(false)}
        />
      )}

      {showImportPopup && (
        <ImportPopup
          onClose={() => setShowImportPopup(false)}
          onImport={(importedDeck) => {
            if (importedDeck.yojoDeck && importedDeck.yojoDeck.length > 0) {
              setYojoDeck(importedDeck.yojoDeck);
              if (userId === 'local') localStorage.setItem(`deck_${deckId}_yojo`, JSON.stringify(importedDeck.yojoDeck));
            }
            if (importedDeck.sweetDeck && importedDeck.sweetDeck.length > 0) {
              setSweetDeck(importedDeck.sweetDeck);
              if (userId === 'local') localStorage.setItem(`deck_${deckId}_sweet`, JSON.stringify(importedDeck.sweetDeck));
            }
            if (importedDeck.playableCard) {
              setSelectedPlayableCard(importedDeck.playableCard);
              if (userId === 'local') localStorage.setItem(`deck_${deckId}_playable`, JSON.stringify(importedDeck.playableCard));
            }
            // Firebaseへの保存はuseEffectで自動的に行われるため、ここでは重複しない
            setShowImportPopup(false);
          }}
        />
      )}
    </div>
  );
} 