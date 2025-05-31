/**
 * インポートポップアップコンポーネント
 * 
 * デッキのインポート機能を提供するポップアップ
 * 幼女デッキとお菓子デッキのカードIDを別々に入力できる
 */

'use client';

import React, { useState } from 'react';
import { CardInfo } from '@/types/card';
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards';

interface ImportedDeck {
  yojoDeck: CardInfo[];
  sweetDeck: CardInfo[];
  playableCard: CardInfo | null;
}

/**
 * インポートポップアップのプロパティ
 */
interface ImportPopupProps {
  /**
   * デッキをインポートする関数
   * @param deck インポートするデッキの情報
   */
  onImport: (deck: ImportedDeck) => void;
  
  /**
   * ポップアップを閉じる関数
   */
  onClose: () => void;
}

/**
 * インポートポップアップコンポーネント
 * 
 * @param props コンポーネントのプロパティ
 * @returns インポートポップアップコンポーネント
 */
const ImportPopup: React.FC<ImportPopupProps> = ({ onImport, onClose }) => {
  // 幼女デッキのカードID
  const [yojoCardIds, setYojoCardIds] = useState('');
  // お菓子デッキのカードID
  const [sweetCardIds, setSweetCardIds] = useState('');
  // プレイアブルカードのID
  const [playableCardId, setPlayableCardId] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * デッキをインポートする
   */
  const handleImport = () => {
    try {
      setError(null);

      // 幼女デッキのカードIDを取得
      const yojoIds = yojoCardIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '')
        .map(id => {
          // 数値部分を取得して先頭の0を削除
          const num = parseInt(id, 10).toString();
          return `y_${num}`;
        });

      // 幼女デッキのカードを取得
      const newYojoDeck = yojoIds
        .map(id => {
          const card = allYojoCards.find(card => card.id === id);
          if (!card) {
            console.log(`カードが見つかりません: ${id}`);
          }
          return card;
        })
        .filter((card): card is CardInfo => card !== undefined);

      // お菓子デッキのカードIDを取得
      const sweetIds = sweetCardIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '')
        .map(id => `s_${id.padStart(2, '0')}`);

      // お菓子デッキのカードを取得
      const newSweetDeck = sweetIds
        .map(id => allSweetCards.find(card => card.id === id))
        .filter((card): card is CardInfo => card !== undefined);

      // プレイアブルカードのIDを取得
      const playableId = playableCardId.trim();
      const newPlayableCard = playableId
        ? allPlayableCards.find(card => card.id === playableId) || null
        : null;

      // デッキを更新
      onImport({
        yojoDeck: newYojoDeck,
        sweetDeck: newSweetDeck,
        playableCard: newPlayableCard
      });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'デッキのインポートに失敗しました');
    }
  };

  /**
   * ポップアップを閉じる
   */
  const handleClose = () => {
    setYojoCardIds('');
    setSweetCardIds('');
    setPlayableCardId('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg main-color">
        <h2 className="text-xl font-bold mb-4">デッキをインポート</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <h4 className="font-bold mb-2">幼女デッキ</h4>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={yojoCardIds}
              onChange={(e) => setYojoCardIds(e.target.value)}
              placeholder="1,2,3,4,5"
            />
            <p className="text-sm text-gray-600 mt-1">
              カンマ区切りで数字を入力してください（例：1,2,3,4,5）。IDは1から64の範囲で入力してください。先頭の0は不要です。
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-2">お菓子デッキ</h4>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={sweetCardIds}
              onChange={(e) => setSweetCardIds(e.target.value)}
              placeholder="6,7,8,9,10"
            />
          </div>

          <div>
            <h4 className="font-bold mb-2">プレイアブルカード</h4>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={playableCardId}
              onChange={(e) => setPlayableCardId(e.target.value)}
              placeholder="p_01"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="btn-secondary"
            onClick={handleClose}
          >
            キャンセル
          </button>
          <button
            className="btn-primary"
            onClick={handleImport}
          >
            インポート
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPopup; 