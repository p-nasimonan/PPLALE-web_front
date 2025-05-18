'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, limit, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

interface Deck {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [recentDecks, setRecentDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecentDecks([]);
      setLoading(false);
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
      } catch (error) {
        console.error('デッキの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentDecks();
  }, [user]);

  const handleCreateDeck = async (type: string) => {
    setIsCreating(true);
    try {
      if (type === '2pick') {
        router.push('/deck/2pick');
        return;
      }
      const deckId = Date.now().toString();
      if (user) {
        try {
          const deckRef = doc(db, 'users', user.uid, 'decks', deckId);
          await setDoc(deckRef, {
            name: '無名のデッキ',
            yojoDeckIds: [],
            sweetDeckIds: [],
            playableCardId: null,
            updatedAt: new Date(),
            is2pick: false  // 通常デッキの場合はfalse
          });
          router.push(`/deck/${user.uid}/${deckId}`);
        } catch (error) {
          console.error('Firebaseへの保存に失敗しました:', error);
          alert('デッキの作成に失敗しました');
        }
      } else {
        const newDeck = {
          id: deckId,
          name: '無名のデッキ',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'local'
        };
        const localDecks = JSON.parse(localStorage.getItem('localDecks') || '[]');
        localStorage.setItem('localDecks', JSON.stringify([newDeck, ...localDecks]));
        router.push(`/deck/local/${deckId}`);
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
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto"></div>
              </div>
            ) : recentDecks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentDecks.map((deck) => (
                  <div key={deck.id} className="relative group">
                    <Link
                      href={`/deck/${user?.uid}/${deck.id}`}
                      className="card hover:shadow-lg transition-shadow block"
                    >
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded mb-3"></div>
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
            ) : (
              <div className="text-center py-8 description">
                デッキがまだありません。新しいデッキを作成しましょう！
              </div>
            )}
          </section>
        )}

        {/* 削除確認モーダル */}
        {deletingDeckId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="main-color p-6 rounded-lg max-w-sm w-full mx-4">
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
