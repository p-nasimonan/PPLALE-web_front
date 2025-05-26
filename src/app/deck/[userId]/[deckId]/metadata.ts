import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * デッキページのメタデータを生成する関数
 * 
 * @param params - ユーザーIDとデッキIDを含むパラメータ
 * @returns デッキページのメタデータ
 */
export async function generateMetadata({ params }: { params: { userId: string; deckId: string } }) {
  // 基本URL（本番環境またはローカル環境）
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://pplale.pgw.jp' 
    : 'http://localhost:3000';
  
  // Firebaseからデッキ情報を取得
  try {
    const deckRef = doc(db, 'users', params.userId, 'decks', params.deckId);
    const deckDoc = await getDoc(deckRef);
    const deckData = deckDoc.data();
    const deckName = deckData?.name || '無名のデッキ';
    const yojoCount = deckData?.yojoDeckIds?.length || 0;
    const sweetCount = deckData?.sweetDeckIds?.length || 0;
    
    // 動的に生成されるOGP画像のURL
    const ogImageUrl = `${baseUrl}/api/og/${params.userId}/${params.deckId}`;

    return {
      title: `${deckName} - PPLALE`,
      description: `${deckName}のデッキ - 幼女カード${yojoCount}枚、お菓子カード${sweetCount}枚`,
      openGraph: {
        title: `${deckName} - PPLALE`,
        description: `${deckName}のデッキ - 幼女カード${yojoCount}枚、お菓子カード${sweetCount}枚`,
        url: `${baseUrl}/deck/${params.userId}/${params.deckId}`,
        siteName: 'ぷぷりえーる デッキ構築',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${deckName}のデッキ`,
          },
        ],
        locale: 'ja_JP',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${deckName} - PPLALE`,
        description: `${deckName}のデッキ - 幼女カード${yojoCount}枚、お菓子カード${sweetCount}枚`,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error('メタデータの生成に失敗しました:', error);
    
    // エラー時にはデフォルトのメタデータを返す
    return {
      title: 'デッキ - PPLALE',
      description: 'ぷぷりえーるのデッキ構築ツール',
      openGraph: {
        title: 'デッキ - PPLALE',
        description: 'ぷぷりえーるのデッキ構築ツール',
        url: `${baseUrl}/deck/${params.userId}/${params.deckId}`,
        siteName: 'ぷぷりえーる デッキ構築',
        images: ['/images/ogp.png'],
        locale: 'ja_JP',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'デッキ - PPLALE',
        description: 'ぷぷりえーるのデッキ構築ツール',
        images: ['/images/ogp.png'],
      },
    };
  }
} 