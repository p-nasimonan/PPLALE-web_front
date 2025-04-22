/**
 * インポートポップアップコンポーネント
 * 
 * デッキのインポート機能を提供するポップアップ
 * 幼女デッキとお菓子デッキのカードIDを別々に入力できる
 */

'use client';

import React, { useState } from 'react';

/**
 * インポートポップアップのプロパティ
 */
interface ImportPopupProps {
  /**
   * デッキをインポートする関数
   * @param yojoCardIds 幼女デッキのカードID（カンマ区切り）
   * @param sweetCardIds お菓子デッキのカードID（カンマ区切り）
   */
  onImport: (yojoCardIds: string, sweetCardIds: string) => void;
  
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

  /**
   * デッキをインポートする
   */
  const handleImport = () => {
    onImport(yojoCardIds, sweetCardIds);
  };

  /**
   * ポップアップを閉じる
   */
  const handleClose = () => {
    setYojoCardIds('');
    setSweetCardIds('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">デッキをインポート</h3>
        <div className="mb-4">
          <div className="mb-4">
            <h4 className="font-bold mb-2">幼女デッキ</h4>
            <textarea
              className="w-full p-3 border border-gray-300 rounded"
              rows={3}
              value={yojoCardIds}
              onChange={(e) => setYojoCardIds(e.target.value)}
              placeholder="1,2,3,4,5"
            />
          </div>
          
          <div className="mb-4">
            <h4 className="font-bold mb-2">お菓子デッキ</h4>
            <textarea
              className="w-full p-3 border border-gray-300 rounded"
              rows={3}
              value={sweetCardIds}
              onChange={(e) => setSweetCardIds(e.target.value)}
              placeholder="6,7,8,9,10"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <button
            className="btn btn-primary"
            onClick={handleImport}
          >
            インポート
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleClose}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPopup; 