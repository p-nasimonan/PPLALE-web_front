'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CardInfo } from '@/types/card';
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Deck from '@/components/Deck';
import CardList from '@/components/CardList';
import { useAuth } from '@/lib/auth';
import ExportPopup from '@/components/ExportPopup';
import ImportPopup from '@/components/ImportPopup';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import ShareButtons from '@/components/ShareButtons';
import { useSettings } from '../../../SideMenuProvider';

interface DeckDocData {
  yojoDeckIds?: string[];
  sweetDeckIds?: string[];
  playableCardId?: string | null;
  updatedAt?: Date;
  name?: string;
  is2pick?: boolean;
}

const yojoLimit = 20;
const sweetLimit = 10;

export default function DeckPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { isTwoCardLimit } = useSettings();
  const [deckName, setDeckName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [yojoDeck, setYojoDeck] = useState<CardInfo[]>([]);
  const [sweetDeck, setSweetDeck] = useState<CardInfo[]>([]);
  const [selectedPlayableCard, setSelectedPlayableCard] = useState<CardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'yojo' | 'sweet' | 'playable'>('yojo');
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const userId = params.userId as string;
  const deckId = params.deckId as string;

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const savedName = localStorage.getItem(`deck_${deckId}_name`);
        const savedYojo = localStorage.getItem(`deck_${deckId}_yojo`);
        const savedSweet = localStorage.getItem(`deck_${deckId}_sweet`);
        const savedPlayable = localStorage.getItem(`deck_${deckId}_playable`);

        if(userId != 'local'){
          // Firebaseからデッキを取得
          const deckRef = doc(db, 'users', userId, 'decks', deckId);
          const deckDoc = await getDoc(deckRef);

          // デッキが存在しない場合
          if (!deckDoc.exists()) {
            if(savedName || savedYojo || savedSweet || savedPlayable){
              setDeckName(savedName || '無名のデッキ');
              setYojoDeck(savedYojo ? JSON.parse(savedYojo) : []);
              setSweetDeck(savedSweet ? JSON.parse(savedSweet) : []);
              setSelectedPlayableCard(savedPlayable ? JSON.parse(savedPlayable) : null);
              setIsLoading(false);
            } else {
              setError('デッキが存在しません');
              setIsLoading(false);
            }
            return;
          }
            const deckDocData: DeckDocData = deckDoc.data() as DeckDocData;


            setDeckName(deckDocData.name || '無名のデッキ');

            // カードIDからカードデータを復元
            const yojoDeckIds: string[] = deckDocData.yojoDeckIds || [];
            const sweetDeckIds: string[] = deckDocData.sweetDeckIds || [];
            const playableCardId: string | null = deckDocData.playableCardId || null;

            // 幼女デッキの復元
            const newYojoDeck: CardInfo[] = yojoDeckIds
              .map(id => allYojoCards.find(card => card.id === id))
              .filter((card): card is CardInfo => card !== undefined);

            // お菓子デッキの復元
            const newSweetDeck: CardInfo[] = sweetDeckIds
              .map(id => allSweetCards.find(card => card.id === id))
              .filter((card): card is CardInfo => card !== undefined);

            // プレイアブルカードの復元
            const newPlayableCard = playableCardId
              ? allPlayableCards.find(card => card.id === playableCardId) || null
              : null;

            setYojoDeck(newYojoDeck);
            setSweetDeck(newSweetDeck);
            setSelectedPlayableCard(newPlayableCard);
        }else{
          setDeckName(savedName || '無名のデッキ');
          setYojoDeck(savedYojo ? JSON.parse(savedYojo) : []);
          setSweetDeck(savedSweet ? JSON.parse(savedSweet) : []);
          setSelectedPlayableCard(savedPlayable ? JSON.parse(savedPlayable) : null);
        }
      } catch (error) {
        console.error('デッキの取得に失敗しました:', error);
        setError('デッキの取得に失敗しました');
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    };

    fetchDeck();
  }, [user, userId, deckId]);

  

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


  // デッキの変更をローカルストレージに保存
  useEffect(() => {
    if (userId === 'local') {
      localStorage.setItem(`deck_${params.deckId}_yojo`, JSON.stringify(yojoDeck));
    }
  }, [yojoDeck, params.deckId, userId]);

  useEffect(() => {
    if (userId === 'local') {
      localStorage.setItem(`deck_${params.deckId}_sweet`, JSON.stringify(sweetDeck));
    }
  }, [sweetDeck, params.deckId, userId]);

  useEffect(() => {
    if (userId === 'local') {
      localStorage.setItem(`deck_${params.deckId}_playable`, JSON.stringify(selectedPlayableCard));
    }
  }, [selectedPlayableCard, params.deckId, userId]);

  // Firebaseへの保存
  useEffect(() => {
    if (!isLoaded) return; // 初回ロードが終わるまで保存しない
    if (!user || user.uid !== userId || userId === 'local') return;

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
      localStorage.setItem(`deck_${params.deckId}_name`, newName);
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          // ローカルデータを保存したままページ遷移
          router.push(`/deck/${result.user.uid}/${deckId}`);
        }
      } catch (error) {
        console.error('ログインエラー:', error);
        alert('ログインに失敗しました');
      }
      return;
    }
    if (!user || user.uid !== params.userId) {
      setIsEditing(false);
      setDeckName(deckName);
      return;
    }
    try {
      const deckRef = doc(db, 'users', params.userId as string, 'decks', params.deckId as string);
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
      } else {   
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

    if (cardType === '幼女' && deckType === 'yojo') {
      const card = allYojoCards.find(c => c.id === cardId);
      if (card && yojoDeck.length < 20) {
        handleAddCard(card);
      }
    } else if (cardType === 'お菓子' && deckType === 'sweet') {
      const card = allSweetCards.find(c => c.id === cardId);
      if (card && sweetDeck.length < 10) {
        handleAddCard(card);
      }
    } else if (cardType === 'プレイアブル' && deckType === 'playable') {
      const card = allPlayableCards.find(c => c.id === cardId);
      if (card && !selectedPlayableCard) {
        handleAddCard(card);
      }
    }
  };

  const canAddToDeck = (card: CardInfo) => {
    // 二枚制限がオンの場合、同じカードが既に2枚あるかチェック
    if (isTwoCardLimit) {
      if (card.type === '幼女') {
        const count = yojoDeck.filter(c => c.id === card.id).length;
        if (count >= 2) {
          return false;
        }
      } else if (card.type === 'お菓子') {
        const count = sweetDeck.filter(c => c.id === card.id).length;
        if (count >= 2) {
          return false;
        }
      }
      // プレイアブルカードは1枚制限なので、ここでの2枚制限チェックは不要
    }
    // 動物さんソーダは1枚制限なので、ここでの2枚制限チェックは不要
    if (card.sweetType == "動物さんソーダ"){
      const count = sweetDeck.filter(c => c.id == card.id).length;
      if (count >= 1){
        return false;
      }
    }


    // デッキ全体の枚数制限チェック（既存ロジック）
    const yojoLimit = 20;
    const sweetLimit = 10;

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

  // localユーザーの場合もオーナーとして扱う
  const isOwner = user ? user.uid === params.userId : params.userId === 'local';

  return (
    <div className="container mx-auto p-2">
      <div className="flex items-center gap-4 mb-6">
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
            {userId !== 'local' && (
              <ShareButtons 
                share_url={typeof window !== 'undefined' ? window.location.href : ''}
                share_text={`${deckName} #お菓子争奪戦争ぷぷりえーる`}
              />
            )}
          </div>
        )}
      </div>

      {/* ローカルユーザー向けメッセージ */}
      {userId === 'local' && (
        <div className="mb-4 p-1 bg-yellow-100 text-yellow-800 rounded">
          このデッキを保存したり、他のユーザーと共有するには、ログインしてください。
        </div>
      )}

      <div className={`grid grid-cols-1 ${isOwner ? 'lg:grid-cols-2' : ''} gap-8`}>
        {/* デッキ表示エリア */}
        <div className="space-y-5">
          {isOwner ? (
            <>
              {/* 選択されたタブに応じたデッキを表示（オーナーの場合） */}
              {activeTab === 'yojo' && (
                <Deck
                  cards={yojoDeck}
                  type="幼女"
                  readOnly={false}
                  onCardRemove={handleRemoveFromYojoDeck}
                  onDragOverDeck={(e) => {
                    e.preventDefault();
                  }}
                  onDragLeaveDeck={() => {}}
                  onDropDeck={(e) => handleDrop(e, 'yojo')}
                />
              )}

              {activeTab === 'sweet' && (
                <Deck
                  cards={sweetDeck}
                  type="お菓子"
                  readOnly={false}
                  onCardRemove={handleRemoveFromSweetDeck}
                  onDragOverDeck={(e) => {
                    e.preventDefault();
                  }}
                  onDragLeaveDeck={() => {}}
                  onDropDeck={(e) => handleDrop(e, 'sweet')}
                />
              )}

              {activeTab === 'playable' && (
                <Deck
                  cards={[selectedPlayableCard || null].filter(Boolean) as CardInfo[]}
                  type="プレイアブル"
                  readOnly={false}
                  onCardRemove={handleRemovePlayableCard}
                  onDragOverDeck={(e) => {
                    e.preventDefault();
                  }}
                  onDragLeaveDeck={() => {}}
                  onDropDeck={(e) => handleDrop(e, 'playable')}
                />
              )}
            </>
          ) : (
            <>
              {/* 3つのデッキを同時に表示（閲覧モードの場合） */}
              <Deck
                cards={yojoDeck}
                type="幼女"
                readOnly={true}
                onCardRemove={handleRemoveFromYojoDeck}
                onDragOverDeck={(e) => {
                  e.preventDefault();
                }}
                onDragLeaveDeck={() => {}}
                onDropDeck={(e) => handleDrop(e, 'yojo')}
              />

              <Deck
                cards={sweetDeck}
                type="お菓子"
                readOnly={true}
                onCardRemove={handleRemoveFromSweetDeck}
                onDragOverDeck={(e) => {
                  e.preventDefault();
                }}
                onDragLeaveDeck={() => {}}
                onDropDeck={(e) => handleDrop(e, 'sweet')}
              />

              <Deck
                cards={[selectedPlayableCard || null].filter(Boolean) as CardInfo[]}
                type="プレイアブル"
                readOnly={true}
                onCardRemove={handleRemovePlayableCard}
                onDragOverDeck={(e) => {
                  e.preventDefault();
                }}
                onDragLeaveDeck={() => {}}
                onDropDeck={(e) => handleDrop(e, 'playable')}
              />
            </>
          )}
        </div>

        {/* カードリストエリア */}
        {isOwner && (
          <div className="card">
            <div className="flex gap-4 mb-3">
              <button
                onClick={() => setActiveTab('yojo')}
                className={`px-4 py-2 rounded ${activeTab === 'yojo' ? 'bg-blue-500 text-white' : 'lgiht-color'}`}
              >
                幼女カード
              </button>
              <button
                onClick={() => setActiveTab('sweet')}
                className={`px-4 py-2 rounded ${activeTab === 'sweet' ? 'bg-blue-500 text-white' : 'lgiht-color'}`}
              >
                お菓子カード
              </button>
              <button
                onClick={() => setActiveTab('playable')}
                className={`px-4 py-2 rounded ${activeTab === 'playable' ? 'bg-blue-500 text-white' : 'lgiht-color'}`}
              >
                プレイアブルカード
              </button>
            </div>

            <CardList
              cards={
                activeTab === 'yojo' ? allYojoCards :
                activeTab === 'sweet' ? allSweetCards :
                allPlayableCards
              }
              cardType={
                activeTab === 'yojo' ? '幼女' :
                activeTab === 'sweet' ? 'お菓子' :
                'プレイアブル'
              }
              onAddToDeck={handleAddCard}
              canAddToDeck={canAddToDeck}
              draggable={true}
              onDragStart={handleDragStart}
            />
          </div>
        )}
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
          onClose={() => setShowImportPopup(false)}
          onImport={(importedDeck) => {
            // 幼女デッキの更新（空白でない場合のみ）
            if (importedDeck.yojoDeck && importedDeck.yojoDeck.length > 0) {
              setYojoDeck(importedDeck.yojoDeck);
              localStorage.setItem(`deck_${params.deckId}_yojo`, JSON.stringify(importedDeck.yojoDeck));
            }

            // お菓子デッキの更新（空白でない場合のみ）
            if (importedDeck.sweetDeck && importedDeck.sweetDeck.length > 0) {
              setSweetDeck(importedDeck.sweetDeck);
              localStorage.setItem(`deck_${params.deckId}_sweet`, JSON.stringify(importedDeck.sweetDeck));
            }

            // プレイアブルカードの更新（空白でない場合のみ）
            if (importedDeck.playableCard) {
              setSelectedPlayableCard(importedDeck.playableCard);
              localStorage.setItem(`deck_${params.deckId}_playable`, JSON.stringify(importedDeck.playableCard));
            }

            // Firebaseへの保存
            if (user && user.uid === params.userId) {
              const deckRef = doc(db, 'users', params.userId as string, 'decks', params.deckId as string);
              setDoc(deckRef, {
                yojoDeckIds: importedDeck.yojoDeck && importedDeck.yojoDeck.length > 0 
                  ? importedDeck.yojoDeck.map(card => card.id)
                  : yojoDeck.map(card => card.id),
                sweetDeckIds: importedDeck.sweetDeck && importedDeck.sweetDeck.length > 0
                  ? importedDeck.sweetDeck.map(card => card.id)
                  : sweetDeck.map(card => card.id),
                playableCardId: importedDeck.playableCard
                  ? importedDeck.playableCard.id
                  : selectedPlayableCard?.id || null,
                updatedAt: new Date()
              }, { merge: true }).catch(error => {
                console.error('デッキの更新に失敗しました:', error);
                alert('デッキの更新に失敗しました');
              });
            }

            setShowImportPopup(false);
          }}
        />
      )}
    </div>
  );
} 