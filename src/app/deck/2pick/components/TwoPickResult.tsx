/**
 * 2Pick結果表示コンポーネント
 * 
 * 2pickが完了した後の結果画面を表示し、デッキの保存やエクスポート、共有などの機能を提供します。
 * 
 * @packageDocumentation
 */

'use client';

import React from 'react';
import { CardInfo } from '@/types/card';
import ShareButtons from '@/components/ShareButtons';
import { User } from 'firebase/auth';

/**
 * 2Pick結果表示コンポーネントのProps
 * 
 * @interface
 * @property {CardInfo[]} yojoDeck - 構築された幼女デッキ
 * @property {CardInfo[]} sweetDeck - 構築されたお菓子デッキ
 * @property {CardInfo | null} playableCard - 選択されたプレイアブルカード
 * @property {User | null} user - 現在のユーザー情報
 * @property {() => void} onExport - エクスポートボタンがクリックされたときのコールバック関数
 * @property {() => Promise<void>} onSave - デッキを保存ボタンがクリックされたときのコールバック関数
 */
interface TwoPickResultProps {
  /** 構築された幼女デッキ */
  yojoDeck: CardInfo[];
  /** 構築されたお菓子デッキ */
  sweetDeck: CardInfo[];
  /** 選択されたプレイアブルカード */
  playableCard: CardInfo | null;
  /** 現在のユーザー情報 */
  user: User | null;
  /** エクスポートボタンがクリックされたときのコールバック関数 */
  onExport: () => void;
  /** デッキを保存ボタンがクリックされたときのコールバック関数 */
  onSave: () => Promise<void>;
}

/**
 * 2Pick結果表示コンポーネント
 * 
 * @param {TwoPickResultProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 2Pick結果表示画面
 */
const TwoPickResult: React.FC<TwoPickResultProps> = ({
  yojoDeck,
  sweetDeck,
  playableCard,
  user,
  onExport,
  onSave,
}) => {
  return (
    <div className="text-center relative">
      <div className="absolute top-0 right-20">
        <ShareButtons
          share_url={window.location.href}
          share_text="2pickでデッキを作成しました！
          #お菓子争奪戦争ぷぷりえーる"
          isLocal={true}
          yojoDeck={yojoDeck}
          sweetDeck={sweetDeck}
          playableCard={playableCard}
        />
      </div>
      <h2 className="text-2xl font-bold mb-4">デッキ構築完了！</h2>
      <p className="mb-4">選択したカードでデッキが完成しました。</p>
      <div className="flex justify-center gap-4 mb-4">
        <button
          className="btn-export"
          onClick={onExport}
        >
          エクスポート
        </button>
        {user?.uid === 'local' && (
          <button
            className="btn-primary"
            onClick={onSave}
          >
            デッキを保存
          </button>
        )}
      </div>
    </div>
  );
};

export default TwoPickResult;