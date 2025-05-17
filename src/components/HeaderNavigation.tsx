'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function HeaderNavigation() {
  const pathname = usePathname();
  const isNormalPage = pathname === '/deck/normal';
  const is2PickPage = pathname === '/deck/2pick';
  const { user } = useAuth();
  const [deckName, setDeckName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      alert('デッキを保存するにはログインが必要です');
      return;
    }

    if (!deckName.trim()) {
      alert('デッキ名を入力してください');
      return;
    }

    setIsSaving(true);
    try {
      const decksCollection = collection(db, 'decks');
      const deckRef = doc(decksCollection, user.uid);
      await setDoc(deckRef, {
        name: deckName,
        updatedAt: new Date()
      }, { merge: true });
      alert('デッキを保存しました');
    } catch (error) {
      console.error('デッキの保存に失敗しました:', error);
      alert('デッキの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {isNormalPage ? (
        <>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="デッキ名を入力"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-48 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              className={`px-4 py-1 rounded-md ${
                user ? 'bg-primary-color text-white hover:bg-primary-color/80' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleSave}
              disabled={!user || isSaving}
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
          <button
            className="btn-reset"
            onClick={() => window.dispatchEvent(new CustomEvent('resetDeck'))}
          >
            リセット
          </button>
        </>
      ) : is2PickPage ? (
        <></>
      ) : null}
    </div>
  );
} 