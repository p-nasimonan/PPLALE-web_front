import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function generateMetadata({ params }: { params: { userId: string; deckId: string } }) {
  const deckRef = doc(db, 'users', params.userId, 'decks', params.deckId);
  const deckDoc = await getDoc(deckRef);
  const deckData = deckDoc.data();
  const deckName = deckData?.name || '無名のデッキ';
  const yojoCount = deckData?.yojoDeckIds?.length || 0;
  const sweetCount = deckData?.sweetDeckIds?.length || 0;

  return {
    title: `${deckName} - PPLALE`,
    description: `${deckName}のデッキ - 幼女カード${yojoCount}枚、お菓子カード${sweetCount}枚`,
    openGraph: {
      title: `${deckName} - PPLALE`,
      description: `${deckName}のデッキ - 幼女カード${yojoCount}枚、お菓子カード${sweetCount}枚`,
      url: `https://pplale.pgw.jp/deck/${params.userId}/${params.deckId}`,
      siteName: 'ぷぷりえーる デッキ構築',
      images: [
        {
          url: '/images/ogp.png',
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
      images: ['/images/ogp.png'],
    },
  };
} 