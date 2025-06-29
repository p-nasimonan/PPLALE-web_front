import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CardInfo } from '@/types/card';
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards';
import DeckPageClient from './DeckPageClient';
import { Metadata } from 'next';

interface DeckDocData {
  yojoDeckIds?: string[];
  sweetDeckIds?: string[];
  playableCardId?: string | null;
  updatedAt?: Date;
  name?: string;
  is2pick?: boolean;
}

async function getDeckData(userId: string, deckId: string): Promise<{
  initialDeckName: string | null;
  initialYojoDeck: CardInfo[];
  initialSweetDeck: CardInfo[];
  initialSelectedPlayableCard: CardInfo | null;
  isServerDataAvailable: boolean;
  initialError: string | null;
}> {
  if (userId === 'local') {
    // ローカルユーザーの場合、クライアント側でlocalStorageから読み込むため初期データは空とし、
    // isServerDataAvailable を false に設定してクライアント側での処理を促す。
    return {
      initialDeckName: '無名のデッキ', // または null
      initialYojoDeck: [],
      initialSweetDeck: [],
      initialSelectedPlayableCard: null,
      isServerDataAvailable: false, // クライアントでのローカルストレージ読み込みを期待
      initialError: null,
    };
  }

  try {
    const deckRef = doc(db, 'users', userId, 'decks', deckId);
    const deckDoc = await getDoc(deckRef);

    if (!deckDoc.exists()) {
      throw new Error(`デッキID "${deckId}" が見つかりません。ユーザーID: "${userId}"`);
    }

    const deckDocData = deckDoc.data() as DeckDocData;
    
    // 必要なプロパティの存在チェック
    if (!deckDocData) {
      throw new Error(`デッキデータが不正です。ユーザーID: "${userId}", デッキID: "${deckId}"`);
    }

    const deckName = deckDocData.name || '無名のデッキ';

    const yojoDeckIds: string[] = deckDocData.yojoDeckIds || [];
    const sweetDeckIds: string[] = deckDocData.sweetDeckIds || [];
    const playableCardId: string | null = deckDocData.playableCardId || null;

    // データの整合性チェック
    if (!Array.isArray(yojoDeckIds)) {
      throw new Error(`幼女デッキIDが配列ではありません。ユーザーID: "${userId}", デッキID: "${deckId}"`);
    }

    if (!Array.isArray(sweetDeckIds)) {
      throw new Error(`お菓子デッキIDが配列ではありません。ユーザーID: "${userId}", デッキID: "${deckId}"`);
    }

    // データが不完全な場合のチェック（デフォルト値になっている場合）
    if (deckName === '無名のデッキ' && yojoDeckIds.length === 0 && sweetDeckIds.length === 0 && !playableCardId) {
      // データが不完全な場合、少し待ってから再試行
      console.log('デッキデータが不完全です。再試行します...');
      // 再読み込み
      window.location.reload();
      await new Promise(resolve => setTimeout(resolve, 500)); // 0.5秒待機
      
      // 再取得を試行
      const retryDeckDoc = await getDoc(deckRef);
      if (!retryDeckDoc.exists()) {
        throw new Error(`デッキID "${deckId}" が見つかりません（再試行後）。ユーザーID: "${userId}"`);
      }
      
      const retryDeckDocData = retryDeckDoc.data() as DeckDocData;
      if (!retryDeckDocData) {
        throw new Error(`デッキデータが不正です（再試行後）。ユーザーID: "${userId}", デッキID: "${deckId}"`);
      }
      
      // 再取得したデータを使用
      const retryDeckName = retryDeckDocData.name || '無名のデッキ';
      const retryYojoDeckIds: string[] = retryDeckDocData.yojoDeckIds || [];
      const retrySweetDeckIds: string[] = retryDeckDocData.sweetDeckIds || [];
      const retryPlayableCardId: string | null = retryDeckDocData.playableCardId || null;
      
      // 再取得後も不完全な場合はエラー
      if (retryDeckName === '無名のデッキ' && retryYojoDeckIds.length === 0 && retrySweetDeckIds.length === 0 && !retryPlayableCardId) {
        throw new Error(`デッキデータが不完全です（再試行後も）。ユーザーID: "${userId}", デッキID: "${deckId}"`);
      }
      
      // 再取得したデータで処理を続行
      const yojoDeck: CardInfo[] = retryYojoDeckIds
        .map(id => allYojoCards.find(card => card.id === id))
        .filter((card): card is CardInfo => card !== undefined);

      const sweetDeck: CardInfo[] = retrySweetDeckIds
        .map(id => allSweetCards.find(card => card.id === id))
        .filter((card): card is CardInfo => card !== undefined);

      const selectedPlayableCard = retryPlayableCardId
        ? allPlayableCards.find(card => card.id === retryPlayableCardId) || null
        : null;

      return {
        initialDeckName: retryDeckName,
        initialYojoDeck: yojoDeck,
        initialSweetDeck: sweetDeck,
        initialSelectedPlayableCard: selectedPlayableCard,
        isServerDataAvailable: true,
        initialError: null,
      };
    }

    const yojoDeck: CardInfo[] = yojoDeckIds
      .map(id => allYojoCards.find(card => card.id === id))
      .filter((card): card is CardInfo => card !== undefined);

    const sweetDeck: CardInfo[] = sweetDeckIds
      .map(id => allSweetCards.find(card => card.id === id))
      .filter((card): card is CardInfo => card !== undefined);

    const selectedPlayableCard = playableCardId
      ? allPlayableCards.find(card => card.id === playableCardId) || null
      : null;

    return {
      initialDeckName: deckName,
      initialYojoDeck: yojoDeck,
      initialSweetDeck: sweetDeck,
      initialSelectedPlayableCard: selectedPlayableCard,
      isServerDataAvailable: true,
      initialError: null,
    };
  } catch (error) {
    console.error('デッキの取得に失敗しました(Server):', error);
    
    // エラーメッセージを詳細化
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'デッキの取得に失敗しました';
    
    return {
      initialDeckName: '無名のデッキ',
      initialYojoDeck: [],
      initialSweetDeck: [],
      initialSelectedPlayableCard: null,
      isServerDataAvailable: true, // エラーでもロード試行は完了
      initialError: errorMessage,
    };
  }
}

export async function generateMetadata(
  { params: paramsPromise }: { params: Promise<{ userId: string; deckId: string }> }
): Promise<Metadata> {
  const params = await paramsPromise;
  const { userId, deckId } = params;
  let title = 'ぷぷりえーる デッキ構築';
  let description = 'お菓子争奪カードゲーム「ぷぷりえーる」のデッキ構築ツールです。';
  let ogImage = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/ogp.png`);

  if (userId !== 'local') {
    try {
      const deckRef = doc(db, 'users', userId, 'decks', deckId);
      const deckDoc = await getDoc(deckRef);
      if (deckDoc.exists()) {
        const deckData = deckDoc.data();
        if (deckData?.name) {
          title = `${deckData.name} | ぷぷりえーる デッキ`;
          description = `${deckData.name} のデッキ構成です。幼女カード、お菓子カード、プレイアブルカードを確認できます。`;
        }
        // 動的OGP画像のURLを生成
        // APIルートを使用する方式に戻す場合
        ogImage = new URL(`/api/og/${userId}/${deckId}`, process.env.NEXT_PUBLIC_BASE_URL);
      }
    } catch (e) {
      console.error("Error fetching deck data for metadata: ", e);
    }
  }

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: ogImage.toString(),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/deck/${userId}/${deckId}`
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImage.toString()],
    },
  };
}

export default async function DeckPage({ params: paramsPromise }: { params: Promise<{ userId: string; deckId: string }> }) {
  const params = await paramsPromise;
  const { userId, deckId } = params;

  const deckData = await getDeckData(userId, deckId);

  return (
    <DeckPageClient
      initialDeckName={deckData.initialDeckName}
      initialYojoDeck={deckData.initialYojoDeck}
      initialSweetDeck={deckData.initialSweetDeck}
      initialSelectedPlayableCard={deckData.initialSelectedPlayableCard}
      isServerDataAvailable={deckData.isServerDataAvailable}
      initialError={deckData.initialError}
      serverUserId={userId}
      serverDeckId={deckId}
    />
  );
} 