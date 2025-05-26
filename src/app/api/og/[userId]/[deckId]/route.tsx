/**
 * @file OGP画像生成API（@vercel/og版・Canvasなし）
 * @description Firestoreからデッキ情報を取得し、カード画像をHTML/CSSレイアウトでOGP画像として生成します。
 * @packageDocumentation
 */

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards';
export const runtime = 'nodejs';
// キャッシュ制御を追加
export const revalidate = 3600; // 1時間キャッシュ

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
  });
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pplale.pgw.jp';

// カードデータのキャッシュ
const cardCache = new Map();

// カードデータを取得する関数（キャッシュ付き）
const getCardData = async (cardId: string, cardType: 'yojo' | 'sweet' | 'playable') => {
  console.log(`Getting card data for ${cardType} card: ${cardId}`); // デバッグログ
  const cacheKey = `${cardType}-${cardId}`;
  if (cardCache.has(cacheKey)) {
    console.log(`Cache hit for ${cacheKey}`); // デバッグログ
    return cardCache.get(cacheKey);
  }

  let card;
  switch (cardType) {
    case 'yojo':
      card = allYojoCards.find(c => c.id === cardId);
      break;
    case 'sweet':
      card = allSweetCards.find(c => c.id === cardId);
      break;
    case 'playable':
      card = allPlayableCards.find(c => c.id === cardId);
      break;
  }

  if (card) {
    console.log(`Found card: ${card.name}`); // デバッグログ
    console.log(`Original imageUrl: ${card.imageUrl}`); // デバッグログ
    console.log(`Base URL: ${baseUrl}`); // デバッグログ

    const cardData = {
      ...card,
      imageUrl: card.imageUrl.startsWith('http') 
        ? card.imageUrl 
        : `${baseUrl}/Resized${card.imageUrl}`
    };
    console.log(`Generated imageUrl: ${cardData.imageUrl}`); // デバッグログ

    // 画像の存在確認を試みる
    try {
      const response = await fetch(cardData.imageUrl, { method: 'HEAD' });
      console.log(`Image check response: ${response.status}`); // デバッグログ
    } catch (error) {
      console.error(`Error checking image: ${error}`); // デバッグログ
    }

    cardCache.set(cacheKey, cardData);
    return cardData;
  }
  console.log(`Card not found: ${cardId}`); // デバッグログ
  return undefined;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string; deckId: string }> }
): Promise<Response> {
  try {
    console.log('OGP API called'); // デバッグログ
    const params = await context.params;
    const { userId, deckId } = params;
    console.log(`Generating OGP for user: ${userId}, deck: ${deckId}`); // デバッグログ

    const db = getFirestore();

    // Firestoreからデッキ情報を取得
    const deckDoc = await db.collection('users').doc(userId).collection('decks').doc(deckId).get();
    if (!deckDoc.exists) {
      console.log('Deck not found'); // デバッグログ
      return new Response('Not found', { status: 404 });
    }
    const deckData = deckDoc.data();
    if (!deckData) {
      console.log('Deck data is null'); // デバッグログ
      return new Response('Not found', { status: 404 });
    }

    console.log('Deck data retrieved:', deckData); // デバッグログ

    // カードデータ取得（キャッシュを活用）
    const yojoCards = await Promise.all((deckData.yojoDeckIds || [])
      .slice()
      .sort((a: string, b: string) => a.localeCompare(b, 'ja', { numeric: true }))
      .map((id: string) => getCardData(id, 'yojo'))
      .filter(Boolean));

    console.log('Yojo cards:', yojoCards.length); // デバッグログ

    const sweetCards = await Promise.all((deckData.sweetDeckIds || [])
      .slice()
      .sort((a: string, b: string) => a.localeCompare(b, 'ja', { numeric: true }))
      .map((id: string) => getCardData(id, 'sweet'))
      .filter(Boolean));

    console.log('Sweet cards:', sweetCards.length); // デバッグログ

    const playableCard = deckData.playableCardId ? await getCardData(deckData.playableCardId, 'playable') : undefined;

    console.log('Playable card:', playableCard ? 'exists' : 'none'); // デバッグログ

    const YOJO_COLS = 6; // 横5
    const YOJO_ROWS = 4; // 縦4
    const YOJO_CARD_WIDTH = 100;
    const YOJO_CARD_HEIGHT = 150;
    const CARD_GAP = 4;

    // 幼女カードグリッド（左上）
    const yojoGrid = (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: YOJO_COLS * YOJO_CARD_WIDTH + (YOJO_COLS - 1) * CARD_GAP,
          height: YOJO_ROWS * YOJO_CARD_HEIGHT + (YOJO_ROWS - 1) * CARD_GAP,
          display: 'flex',
          flexWrap: 'wrap',
          gap: CARD_GAP,
          zIndex: 2,
        }}
      >
        {Array.from({ length: YOJO_COLS * YOJO_ROWS }).map((_, i) => {
          const card = yojoCards[i];
          const isLastCol = i % YOJO_COLS === YOJO_COLS - 1;
          const isLastRow = i >= YOJO_COLS * (YOJO_ROWS - 1);
          return card ? (
            <img
              key={i}
              src={card.imageUrl}
              width={YOJO_CARD_WIDTH}
              height={YOJO_CARD_HEIGHT}
              alt={card.name || 'カード画像'}
              style={{
                boxShadow: '0 2px 8px #aaa',
                marginRight: isLastCol ? 0 : CARD_GAP,
                marginBottom: isLastRow ? 0 : CARD_GAP,
              }}
              onError={(e) => {
                console.error(`Failed to load image: ${card.imageUrl}`); // デバッグログ
                e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1透明画像
              }}
            />
          ) : (
            <div
              key={i}
              style={{
                width: YOJO_CARD_WIDTH,
                height: YOJO_CARD_HEIGHT,
                background: '#eee',
                marginRight: isLastCol ? 0 : CARD_GAP,
                marginBottom: isLastRow ? 0 : CARD_GAP,
              }}
            />
          );
        })}
      </div>
    );

    // お菓子カードグリッド（右上）
    const sweetGrid = (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 5 * 100 + 12 * CARD_GAP, // 幼女カードの右隣
          width: 5 * 120 + 4 * (CARD_GAP+5), // 5枚+4gap
          height: 2 * 180 + 1 * CARD_GAP, // 2段+1gap
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0, // gapは0にしてmarginで調整
          zIndex: 3,
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => {
          const card = sweetCards[i];
          // 5列ごとに右マージン、1行目に下マージン
          const isLastCol = i % 5 === 4;
          const isLastRow = i >= 5;
          return card ? (
            <img
              key={i}
              src={card.imageUrl}
              width={120}
              height={180}
              alt={card.name || 'お菓子カード画像'}
              style={{
                marginRight: isLastCol ? 0 : CARD_GAP+5,
                marginBottom: isLastRow ? 0 : CARD_GAP,
              }}
            />
          ) : (
            <div
              key={i}
              style={{
                width: 120,
                height: 180,
                background: '#eee',
                marginRight: isLastCol ? 0 : CARD_GAP,
                marginBottom: isLastRow ? 0 : CARD_GAP,
              }}
            />
          );
        })}
      </div>
    );

    // プレイアブルカード（右下）
    const playableCardView = playableCard && (
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 5 * 100 + 12 * CARD_GAP, // 幼女カードの右隣,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 4,
        }}
      >
        <img
          src={playableCard.imageUrl}
          width={176}
          height={264}
          alt={playableCard.name || 'プレイアブルカード画像'}
          style={{boxShadow: '0 4px 16px #aaa' }}
        /> 
      </div>
    );

    // OGP画像生成
    const response = new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            background: '#fffbe7',
            position: 'relative',
            fontFamily: 'Noto Sans JP, sans-serif',
            display: 'flex', 
          }}
        >
          {yojoGrid}
          {sweetGrid}
          {playableCardView}
          {/* ハッシュタグ */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              right: 40,
              fontSize: 28,
              color: '#000000',
              zIndex: 10, 
            }}
          >
            #お菓子争奪戦争ぷぷりえーる
          </div>
        </div>
      ),
      { 
        width: 1200, 
        height: 630,
        // 画像の最適化オプション
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'Content-Type': 'image/png',
        }
      }
    );

    return response;
  } catch (error) {
    console.error('Error in OGP generation:', error); // エラーログ
    return new Response('Internal Server Error', { status: 500 });
  }
}