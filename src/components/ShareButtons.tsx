/**
 * @file ShareButtons.tsx
 * @description SNS共有ボタンコンポーネント
 */

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CardInfo } from '@/types/card';

interface ShareButtonsProps {
  share_url: string;
  share_text: string;
  isLocal?: boolean;
  yojoDeck?: CardInfo[];
  sweetDeck?: CardInfo[];
  playableCard?: CardInfo | null;
}

/**
 * SNS共有ボタンコンポーネント
 * クリック時にリンクコピーとTwitterシェアの選択肢を横並びアイコンで表示します。
 * @param {ShareButtonsProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} SNS共有ボタンコンポーネント
 */
const ShareButtons: React.FC<ShareButtonsProps> = ({ 
  share_url, 
  share_text, 
  isLocal = false, 
  yojoDeck = [], 
  sweetDeck = [], 
  playableCard = null 
}) => {
  const [show_options, set_show_options] = useState(false);
  const [copy_success, set_copy_success] = useState(false);
  const share_button_ref = useRef<HTMLDivElement>(null);

  // ローカルデッキの場合の共有URLを生成
  const getLocalShareUrl = () => {
    if (!isLocal) return share_url;

    const baseUrl = window.location.origin;
    const params = new URLSearchParams();

    // 幼女デッキのIDをカンマ区切りで追加
    if (yojoDeck.length > 0) {
      params.append('yojo', yojoDeck.map(card => card.id).join(','));
    }

    // お菓子デッキのIDをカンマ区切りで追加
    if (sweetDeck.length > 0) {
      params.append('sweet', sweetDeck.map(card => card.id).join(','));
    }

    // プレイアブルカードのIDを追加
    if (playableCard) {
      params.append('playable', playableCard.id);
    }

    return `${baseUrl}/deck/local/local?${params.toString()}`;
  };

  const shareUrl = isLocal ? getLocalShareUrl() : share_url;
  const encoded_url = encodeURIComponent(shareUrl);
  const encoded_text = encodeURIComponent(share_text);
  const twitter_url = `https://twitter.com/intent/tweet?url=${encoded_url}&text=${encoded_text}`;

  // 画像のURLを直接指定
  const ShareIcon = '/images/share.png';
  const LinkIcon = '/images/link.png';
  const TwitterIcon = '/images/twitter.png';

  // 外部クリックで選択肢を閉じる
  useEffect(() => {
    const handle_click_outside = (event: MouseEvent) => {
      if (share_button_ref.current && !share_button_ref.current.contains(event.target as Node)) {
        set_show_options(false);
      }
    };
    document.addEventListener('mousedown', handle_click_outside);
    return () => {
      document.removeEventListener('mousedown', handle_click_outside);
    };
  }, [share_button_ref]);

  // リンクをクリップボードにコピー
  const handle_copy_link = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      set_copy_success(true);
      set_show_options(false);
      setTimeout(() => set_copy_success(false), 2000);
    } catch (err) {
      console.error('リンクのコピーに失敗しました:', err);
      alert('リンクのコピーに失敗しました。');
      set_show_options(false);
    }
  };

  return (
    <div className="relative" ref={share_button_ref}>
      {/* シェアボタン */}
      <button
        onClick={() => set_show_options(!show_options)}
        className="flex items-center justify-center w-8 h-8 rounded-full main-color"
        aria-label="シェア"
        title="シェア"
      >
        <Image 
          src={ShareIcon} 
          alt="シェアアイコン" 
          width={40}
          height={40}
        />
      </button>

      {/* コピー成功メッセージ */}
      {copy_success && (
        <span className="ml-2 text-green-600 text-sm">コピーしました！</span>
      )}

      {/* シェアの選択肢（横並びアイコン） */}
      {show_options && (
        <div className="absolute right-0 mt-2 w-auto bg-white border rounded shadow-lg z-10 p-2 flex gap-2">
          {/* リンクコピーボタン */}
          <button
            onClick={handle_copy_link}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-800 text-white main-color"
            aria-label="リンクをコピー"
            title="リンクをコピー"
          >
            <Image 
              src={LinkIcon} 
              alt="リンクアイコン" 
              width={50}
              height={50}
            />
          </button>
          {/* Twitterシェアボタン */}
          <a
            href={twitter_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => set_show_options(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full text-white main-color"
            aria-label="Twitterでシェア"
            title="Twitterでシェア"
          >
            <Image 
              src={TwitterIcon} 
              alt="Twitterアイコン" 
              width={50}
              height={50}
            />
          </a>
        </div>
      )}
    </div>
  );
};

export default ShareButtons; 