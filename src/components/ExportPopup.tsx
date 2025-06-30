/**
 * エクスポートポップアップコンポーネント
 * 
 * デッキのエクスポート機能を提供するポップアップ
 * 幼女デッキとお菓子デッキのカードIDを別々に表示・コピーできる
 */

'use client';

import React, { useState } from 'react';
import { CardInfo } from '@/types/card'; 
import Card from './Card';
import DeckImagePreview from './DeckImagePreview';

/**
 * エクスポートポップアップのプロパティ
 */
interface ExportPopupProps {
  /**
   * 幼女デッキのカード配列
   */
  yojoDeck: CardInfo[];
  
  /**
   * お菓子デッキのカード配列
   */
  sweetDeck: CardInfo[]; 

  /**
   * プレイアブルキャラの情報
   */
  playableCard: CardInfo | null; 

  /**
   * ポップアップを閉じる関数
   */
  onClose: () => void;
}

/**
 * エクスポートポップアップコンポーネント
 * 
 * @param props コンポーネントのプロパティ
 * @returns エクスポートポップアップコンポーネント
 */
const ExportPopup: React.FC<ExportPopupProps> = ({ yojoDeck, sweetDeck, playableCard, onClose }) => {
  // 幼女デッキのコピー状態
  const [yojoCopied, setYojoCopied] = useState(false);
  // お菓子デッキのコピー状態
  const [sweetCopied, setSweetCopied] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  /**
   * IDから数字のみを抽出する関数
   */
  const extractNumber = (id: string) => {
    return id.replace(/[^0-9]/g, '');
  };

  /**
   * 幼女デッキをクリップボードにコピーする
   */
  const handleCopyYojoDeck = () => {
    navigator.clipboard.writeText(yojoDeck.map(card => extractNumber(card.id)).join(','));
    setYojoCopied(true);
    setTimeout(() => setYojoCopied(false), 2000);
  };

  /**
   * お菓子デッキをクリップボードにコピーする
   */
  const handleCopySweetDeck = () => {
    navigator.clipboard.writeText(sweetDeck.map(card => extractNumber(card.id)).join(','));
    setSweetCopied(true);
    setTimeout(() => setSweetCopied(false), 2000);
  };



  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
      <div className="popup p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">デッキをエクスポート</h3>
        <div className="mb-4">
          <div className="mb-4">
            <h4 className="font-bold mb-2">幼女デッキ</h4>
            <div className="main-background p-3 rounded border border-gray-300 overflow-auto max-h-40">
              <pre>{yojoDeck.map(card => extractNumber(card.id)).join(',')}</pre>
            </div>
            <button
              className="btn btn-primary mt-2"
              onClick={handleCopyYojoDeck}
            >
              {yojoCopied ? 'コピーしました！' : '幼女デッキをコピー'}
            </button>
          </div>
          
          <div className="mb-4">
            <h4 className="font-bold mb-2">お菓子デッキ</h4>
            <div className="main-background p-3 rounded border border-gray-300 overflow-auto max-h-40">
              <pre>{sweetDeck.map(card => extractNumber(card.id)).join(',')}</pre>
            </div>
            <button
              className="btn btn-primary mt-2"
              onClick={handleCopySweetDeck}
            >
              {sweetCopied ? 'コピーしました！' : 'お菓子デッキをコピー'}
            </button>
          </div>

            {playableCard?.name && (
            <div className="mb-4">
            <h4 className="font-bold mb-2">プレイアブルキャラ</h4>
              <Card
                card={playableCard}
                isSelected={false}
                onClick={() => {}}
                draggable={false}
                showRemoveButton={false}
                />
              </div>
              )}
          
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setShowImagePreview(true)}
          >
            デッキの画像を表示
          </button>
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
        {showImagePreview && (
          <DeckImagePreview
            yojoDeck={yojoDeck}
            sweetDeck={sweetDeck}
            playableCard={playableCard}
            onClose={() => setShowImagePreview(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ExportPopup;