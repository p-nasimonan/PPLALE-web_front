'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, limit, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';
import { generateDeckImageDataUrl } from '@/components/DeckImagePreview';
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards';
import { nanoid } from 'nanoid';

interface Deck {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  yojoDeckIds?: string[];
  sweetDeckIds?: string[];
  playableCardId?: string | null;
}

export default function BuildPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recentDecks, setRecentDecks] = useState<Deck[]>([]);
  const [deckImages, setDeckImages] = useState<{ [deckId: string]: string }>({});
  const [isCreating, setIsCreating] = useState(false);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);
  const [topDecks, setTopDecks] = useState<Deck[]>([]);
  const [otherDecks, setOtherDecks] = useState<Deck[]>([]);
  const [filter, setFilter] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecentDecks([]);
      setTopDecks([]);
      setOtherDecks([]);
      return;
    }
    // ログインユーザーのみデッキ取得
    const fetchRecentDecks = async () => {
      try {
        const decksRef = collection(db, 'users', user.uid, 'decks');
        const q = query(
          decksRef,
          orderBy('updatedAt', 'desc'),
          limit(6)
        );
        const querySnapshot = await getDocs(q);
        const decks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Deck[];
        setRecentDecks(decks);

        // 画像生成処理
        const images: { [deckId: string]: string } = {};
        await Promise.all(
          decks.map(async (deck) => {
            // カード情報をローカルデータから取得
            const yojoDeck = (deck.yojoDeckIds || [])
              .map((id) => allYojoCards.find(c => c.id === id))
              .filter((c): c is import('@/types/card').CardInfo => Boolean(c));
            const sweetDeck = (deck.sweetDeckIds || [])
              .map((id) => allSweetCards.find(c => c.id === id))
              .filter((c): c is import('@/types/card').CardInfo => Boolean(c));
            const playableCard = deck.playableCardId
              ? allPlayableCards.find(c => c.id === deck.playableCardId) || null
              : null;
            if (yojoDeck.length > 0) {
              try {
                images[deck.id] = await generateDeckImageDataUrl(yojoDeck, sweetDeck, playableCard);
              } catch {
                images[deck.id] = '';
              }
            }
          })
        );
        setDeckImages(images);
      } catch (error) {
        console.error('デッキの取得に失敗しました:', error);
      }
    };
    fetchRecentDecks();
  }, [user]);

  useEffect(() => {
    setTopDecks(recentDecks.slice(0, 3));
    setOtherDecks(recentDecks.slice(3));
  }, [recentDecks]);

  // メニューポップアップ外クリックで閉じる
  useEffect(() => {
    if (!menuOpenId) return;
    const handleClick = () => {
      setMenuOpenId(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [menuOpenId]);

  const handleCreateDeck = async (type: string, options?: { isTwoCardLimit?: boolean, initialFruits?: string[], initialPlayableVersions?: string[] }) => {
    setIsCreating(true);
    try {
      if (type === '2pick') {
        const queryParams = new URLSearchParams();
        if (options?.isTwoCardLimit) queryParams.set('twoCardLimit', 'true');
        if (options?.initialFruits) queryParams.set('fruits', options.initialFruits.join(','));
        if (options?.initialPlayableVersions) queryParams.set('playableVersions', options.initialPlayableVersions.join(','));
        router.push(`/deck/2pick?${queryParams.toString()}`);
        return;
      }
      
      // 新規作成の場合はデッキIDを生成してから遷移
      if (user) {
        // ログインユーザーの場合、Firebaseに新しいデッキを作成
        const newDeckId = nanoid(8);
        const deckRef = doc(db, 'users', user.uid, 'decks', newDeckId);
        
        await setDoc(deckRef, {
          name: '無名のデッキ',
          yojoDeckIds: [],
          sweetDeckIds: [],
          playableCardId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('新しいデッキを作成しました:', newDeckId);
        router.push(`/deck/${user.uid}/${newDeckId}?isNew=true`);
      } else {
        // ローカルユーザーの場合
        const deckId = nanoid(8);
        const newDeck = {
          id: deckId,
          name: '無名のデッキ',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'local'
        };
        const localDecks = JSON.parse(localStorage.getItem('localDecks') || '[]');
        localStorage.setItem('localDecks', JSON.stringify([newDeck, ...localDecks]));
        router.push(`/deck/local/${deckId}?isNew=true`);
      }
    } catch (error) {
      console.error('デッキの作成に失敗しました:', error);
      alert('デッキの作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      if (user) {
        const deckRef = doc(db, 'users', user.uid, 'decks', deckId);
        await deleteDoc(deckRef);
      } else {
        const localDecks = JSON.parse(localStorage.getItem('localDecks') || '[]');
        const updatedDecks = localDecks.filter((deck: Deck) => deck.id !== deckId);
        localStorage.setItem('localDecks', JSON.stringify(updatedDecks));
      }
      
      setRecentDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
      setDeletingDeckId(null);
    } catch (error) {
      console.error('デッキの削除に失敗しました:', error);
      alert('デッキの削除に失敗しました');
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* 新しいデッキ作成セクション */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 main-color">新しいデッキを作成</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => handleCreateDeck('normal')}
              disabled={isCreating}
              className="p-6 card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium light-color">通常構築</h3>
                  <p className="description">新しいデッキを最初から構築します</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleCreateDeck('2pick')}
              disabled={isCreating}
              className="p-6 card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium light-color">2pick</h3>
                  <p className="description">2枚選択方式でデッキを構築します</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* 最近作成したデッキセクション（ログインユーザーのみ表示） */}
        {user && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 main-color">最近作成したデッキ</h2>
            {/* 直近3つを大きく表示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {topDecks
                .filter(deck => deck.name.includes(filter))
                .map((deck) => (
                  <div key={deck.id} className="relative group">
                    <Link
                      href={`/deck/${user?.uid}/${deck.id}`}
                      className="card hover:shadow-lg transition-shadow block"
                    >
                      <div className="aspect-video relative bg-orange-200 rounded mb-3 overflow-hidden">
                        {deck.yojoDeckIds && deck.yojoDeckIds.length > 0 && deckImages[deck.id] && (
                          <Image
                            src={deckImages[deck.id]}
                            alt={`${deck.name}のデッキ画像`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <h3 className="font-medium light-color">{deck.name}</h3>
                      <p className="description">
                        最終更新: {deck.updatedAt.toLocaleDateString('ja-JP')}
                      </p>
                    </Link>
                    <button
                      onClick={() => setDeletingDeckId(deck.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="デッキを削除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
            </div>
            {/* それ以外を小さくリスト表示 */}
            {otherDecks.length > 0 && (
              <div className="light-background rounded p-4">
                {/* フィルターとソートUIをここに移動 */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                  <input
                    type="text"
                    placeholder="デッキ名でフィルター"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="p-2 border rounded w-full max-w-xs main-color"
                  />
                  {/* ソートUI例: */}
                  {/* <select className="p-2 border rounded main-color">
                    <option value="updatedAt">最終更新順</option>
                    <option value="name">名前順</option>
                  </select> */}
                </div>
                <h3 className="text-lg font-semibold mb-2 main-color light-background">その他のデッキ</h3>
                <ul>
                  {otherDecks
                    .filter(deck => deck.name.includes(filter))
                    .map(deck => (
                      <li key={deck.id} className="flex items-center justify-between border-b py-2 group relative">
                        <Link href={`/deck/${user?.uid}/${deck.id}`} className="flex-1 flex items-center min-w-0 px-2 py-1 rounded cursor-pointer light-background">
                          <span className="font-medium main-color truncate">{deck.name}</span>
                          <span className="ml-2 text-xs text-gray-500 flex-shrink-0">{deck.updatedAt.toLocaleDateString('ja-JP')}</span>
                        </Link>
                        <button
                          onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === deck.id ? null : deck.id); }}
                          className="p-1 ml-2 rounded main-color main-background"
                          aria-label="メニューを開く"
                        >
                          {/* 3点縦メニューアイコン */}
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.5"/>
                            <circle cx="12" cy="12" r="1.5"/>
                            <circle cx="12" cy="19" r="1.5"/>
                          </svg>
                        </button>
                        {/* メニューポップアップ */}
                        {menuOpenId === deck.id && (
                          <div
                            className="absolute right-0 top-8 z-10 bg-white border rounded shadow-md min-w-[120px]"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              onClick={e => { e.stopPropagation(); setDeletingDeckId(deck.id); setMenuOpenId(null); }}
                              className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                            >
                              削除
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(`${window.location.origin}/deck/${user?.uid}/${deck.id}`);
                                setMenuOpenId(null);
                              }}
                              className="block w-full text-left px-4 py-2 hover:bg-blue-100 text-blue-600"
                            >
                              共有リンクをコピー
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* 削除確認モーダル */}
        {deletingDeckId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="main-color main-background p-6 rounded-lg max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold mb-4 main-color">デッキの削除</h3>
              <p className="mb-6 description">このデッキを削除してもよろしいですか？この操作は取り消せません。</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeletingDeckId(null)}
                  className="px-4 py-2 rounded main-color"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDeleteDeck(deletingDeckId)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 