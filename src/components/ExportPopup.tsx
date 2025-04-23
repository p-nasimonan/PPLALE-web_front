/**
 * エクスポートポップアップコンポーネント
 * 
 * デッキのエクスポート機能を提供するポップアップ
 * 幼女デッキとお菓子デッキのカードIDを別々に表示・コピーできる
 */

'use client';

import React, { useState } from 'react';
import { CardInfo } from '@/types/card'; // CardをCardInfoに変更

/**
 * エクスポートポップアップのプロパティ
 */
interface ExportPopupProps {
  /**
   * 幼女デッキのカード配列
   */
  yojoDeck: CardInfo[]; // CardをCardInfoに変更
  
  /**
   * お菓子デッキのカード配列
   */
  sweetDeck: CardInfo[]; // CardをCardInfoに変更
  
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
const ExportPopup: React.FC<ExportPopupProps> = ({ yojoDeck, sweetDeck, onClose }) => {
  // 幼女デッキのコピー状態
  const [yojoCopied, setYojoCopied] = useState(false);
  // お菓子デッキのコピー状態
  const [sweetCopied, setSweetCopied] = useState(false);

  /**
   * 幼女デッキをクリップボードにコピーする
   */
  const handleCopyYojoDeck = () => {
    navigator.clipboard.writeText(yojoDeck.map(card => card.id).join(','));
    setYojoCopied(true);
    setTimeout(() => setYojoCopied(false), 2000);
  };

  /**
   * お菓子デッキをクリップボードにコピーする
   */
  const handleCopySweetDeck = () => {
    navigator.clipboard.writeText(sweetDeck.map(card => card.id).join(','));
    setSweetCopied(true);
    setTimeout(() => setSweetCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">デッキをエクスポート</h3>
        <div className="mb-4">
          <div className="mb-4">
            <h4 className="font-bold mb-2">幼女デッキ</h4>
            <div className="bg-gray-100 p-3 rounded border border-gray-300 overflow-auto max-h-40">
              <pre className="whitespace-pre-wrap">{yojoDeck.map(card => card.id).join(',')}</pre>
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
            <div className="bg-gray-100 p-3 rounded border border-gray-300 overflow-auto max-h-40">
              <pre className="whitespace-pre-wrap">{sweetDeck.map(card => card.id).join(',')}</pre>
            </div>
            <button
              className="btn btn-primary mt-2"
              onClick={handleCopySweetDeck}
            >
              {sweetCopied ? 'コピーしました！' : 'お菓子デッキをコピー'}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPopup;