'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { CardInfo } from '@/types/card';
import Deck from '@/components/Deck';

export default function DeckDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [deck, setDeck] = useState<{
    name: string;
    yojoDeck: CardInfo[];
    sweetDeck: CardInfo[];
    selectedPlayableCard: CardInfo | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeck = async () => {
      if (!user) return;

      try {
        const deckRef = doc(db, 'decks', id as string);
        const deckDoc = await getDoc(deckRef);
        
        if (deckDoc.exists()) {
          const data = deckDoc.data();
          setDeck({
            name: data.name || '無名のデッキ',
            yojoDeck: data.yojoDeck || [],
            sweetDeck: data.sweetDeck || [],
            selectedPlayableCard: data.selectedPlayableCard || null
          });
        }
      } catch (error) {
        console.error('デッキの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
  }, [user, id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  if (!deck) {
    return <div className="flex justify-center items-center h-screen">デッキが見つかりません</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{deck.name}</h1>
      
      <div className="space-y-8">
        {/* 幼女デッキ */}
        <div>
          <h2 className="text-xl font-bold mb-4">幼女デッキ ({deck.yojoDeck.length}/20)</h2>
          <Deck
            cards={deck.yojoDeck}
            type="幼女"
            removeable={false}
          />
        </div>

        {/* お菓子デッキ */}
        <div>
          <h2 className="text-xl font-bold mb-4">お菓子デッキ ({deck.sweetDeck.length}/10)</h2>
          <Deck
            cards={deck.sweetDeck}
            type="お菓子"
            removeable={false}
          />
        </div>

        {/* プレイアブルカード */}
        {deck.selectedPlayableCard && (
          <div>
            <h2 className="text-xl font-bold mb-4">プレイアブルカード</h2>
            <div className="flex justify-center">
              <Deck
                cards={[deck.selectedPlayableCard]}
                type="プレイアブル"
                removeable={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 