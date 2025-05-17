'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDarkMode } from './DarkModeProvider';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
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
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [recentDecks, setRecentDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentDecks = async () => {
      if (!user) {
        setRecentDecks([]);
        setLoading(false);
        return;
      }

      try {
        const decksRef = collection(db, 'decks');
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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* 新しいデッキ作成セクション */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 main-color">新しいデッキを作成</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/deck/normal"
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
            </Link>

            <Link 
              href="/deck/2pick"
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
            </Link>
          </div>
        </section>

        {/* 最近作成したデッキセクション */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 main-color">最近作成したデッキ</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto"></div>
            </div>
          ) : recentDecks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDecks.map((deck) => (
                <Link
                  key={deck.id}
                  href={`/deck/${deck.id}`}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded mb-3"></div>
                  <h3 className="font-medium light-color">{deck.name}</h3>
                  <p className="description">
                    最終更新: {deck.updatedAt.toLocaleDateString('ja-JP')}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 description">
              {user ? 'デッキがまだありません。新しいデッキを作成しましょう！' : 'ログインしてデッキを作成しましょう'}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
