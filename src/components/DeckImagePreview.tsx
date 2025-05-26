import React, { useEffect, useRef, useState } from 'react';
import { CardInfo } from '@/types/card';
import Image from 'next/image';

interface DeckImagePreviewProps {
  yojoDeck: CardInfo[];
  sweetDeck: CardInfo[];
  playableCard: CardInfo | null;
  onClose: () => void;
}

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const BLANK_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJgAAACgCAYAAABw4pVUAAAAF0lEQVR4nO3BMQEAAAgDoJvc6F9hAAEAAAAAAAAAAADwG4wAAQAA//8DAAAAAElFTkSuQmCC';

// 幼女デッキ
const YOJO_CARD_W = 162;
const YOJO_CARD_H = 262;
const YOJO_MARGIN_L = 0;
const YOJO_MARGIN_T = 0;
const YOJO_GAP = 8;
// お菓子デッキ
const SWEET_CARD_W = 205;
const SWEET_CARD_H = 333;
const SWEET_MARGIN_R = 0;
const SWEET_MARGIN_T = 0;
const SWEET_GAP = 10;
// プレイアブル
const PLAYABLE_W = 264;
const PLAYABLE_H = 393;
const PLAYABLE_MARGIN_L = 10;
const PLAYABLE_MARGIN_T = 0;

const DeckImagePreview: React.FC<DeckImagePreviewProps> = ({ yojoDeck, sweetDeck, playableCard, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // カード画像URLを取得する関数（CardInfo型に合わせて調整）
  const getImageUrl = (card: CardInfo | null) => card?.imageUrl || BLANK_IMAGE;

  useEffect(() => {
    setLoading(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 画像を順に読み込んで描画
    const yojoPositions = yojoDeck
      .slice(0, 20)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((_, i) => ({
      x: YOJO_MARGIN_L + (i % 5) * (YOJO_CARD_W + YOJO_GAP),
      y: YOJO_MARGIN_T + Math.floor(i / 5) * (YOJO_CARD_H + YOJO_GAP),
      w: YOJO_CARD_W,
      h: YOJO_CARD_H,
    }));
    const sweetPositions = sweetDeck
      .slice(0, 10)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((_, i) => ({
      x: CANVAS_WIDTH - SWEET_MARGIN_R - SWEET_CARD_W * 5 - SWEET_GAP * 4 + (i % 5) * (SWEET_CARD_W + SWEET_GAP),
      y: SWEET_MARGIN_T + Math.floor(i / 5) * (SWEET_CARD_H + SWEET_GAP),
      w: SWEET_CARD_W,
      h: SWEET_CARD_H,
    }));
    const playablePosition = {
      x: YOJO_CARD_W * 5 + YOJO_GAP * 4  + PLAYABLE_MARGIN_L,
      y: CANVAS_HEIGHT - PLAYABLE_MARGIN_T - PLAYABLE_H - SWEET_GAP,
      w: PLAYABLE_W,
      h: PLAYABLE_H,
    };

    // 画像リスト作成
    const allImages: { img: HTMLImageElement; x: number; y: number; w: number; h: number; loaded: boolean }[] = [];
    yojoDeck
      .slice(0, 20)
      .sort((a, b) => a.id.localeCompare(b.id))
      .forEach((card, i) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = getImageUrl(card);
      const pos = yojoPositions[i];
      allImages.push({ img, x: pos.x, y: pos.y, w: pos.w, h: pos.h, loaded: false });
    });
    sweetDeck
      .slice(0, 10)
      .sort((a, b) => a.id.localeCompare(b.id))
      .forEach((card, i) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = getImageUrl(card);
      const pos = sweetPositions[i];
      allImages.push({ img, x: pos.x, y: pos.y, w: pos.w, h: pos.h, loaded: false });
    });
    // プレイアブルカード
    const playableImg = new window.Image();
    playableImg.crossOrigin = 'anonymous';
    playableImg.src = getImageUrl(playableCard);
    allImages.push({ img: playableImg, x: playablePosition.x, y: playablePosition.y, w: playablePosition.w, h: playablePosition.h, loaded: false });

    let finished = 0;
    const tryDraw = () => {
      if (finished === allImages.length) {
        allImages.forEach(({ img, x, y, w, h, loaded }) => {
          if (loaded) {
            ctx.drawImage(img, x, y, w, h);
          } else {
            // 失敗した場合はBLANK_IMAGEで再描画
            const fallback = new window.Image();
            fallback.src = BLANK_IMAGE;
            ctx.drawImage(fallback, x, y, w, h);
          }
        });
        setImgUrl(canvasRef.current?.toDataURL('image/png') || null);
        setLoading(false);
      }
    };

    allImages.forEach((entry) => {
      entry.img.onload = () => {
        entry.loaded = true;
        finished++;
        tryDraw();
      };
      entry.img.onerror = () => {
        entry.loaded = false;
        finished++;
        tryDraw();
      };
    });
    // eslint-disable-next-line
  }, [yojoDeck, sweetDeck, playableCard]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-5xl w-full flex flex-col items-center">
        <h3 className="text-lg font-bold mb-4">デッキ画像プレビュー</h3>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ display: 'none' }} />
        {loading ? (
          <div className="my-8">画像生成中...</div>
        ) : imgUrl ? (
          <>
            <Image src={imgUrl} alt="デッキ画像" className="mb-4 max-w-full" width={1920} height={1080} unoptimized />
            <a href={imgUrl} download="deck.png" className="btn btn-primary mb-2">画像をダウンロード</a>
          </>
        ) : (
          <div className="my-8 text-red-500">画像生成に失敗しました</div>
        )}
        <button className="btn btn-secondary mt-2" onClick={onClose}>閉じる</button>
      </div>
    </div>
  );
};

export default DeckImagePreview; 