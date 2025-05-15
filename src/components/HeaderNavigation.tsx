'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function HeaderNavigation() {
  const pathname = usePathname();
  const isMainPage = pathname === '/';
  const is2PickPage = pathname === '/2pick';

  return (
    <div className="flex items-center gap-4">
      {isMainPage ? (
        <>
          <button
            className="btn-reset"
            onClick={() => window.dispatchEvent(new CustomEvent('resetDeck'))}
          >
            リセット
          </button>
          <button
            className="btn-export"
            onClick={() => window.dispatchEvent(new CustomEvent('exportDeck'))}
          >
            エクスポート
          </button>
          <button
            className="btn-import"
            onClick={() => window.dispatchEvent(new CustomEvent('importDeck'))}
          >
            インポート
          </button>
          <Link
            href="/2pick"
            className="lnk-important"
          >
            2pickで構築する
          </Link>
        </>
      ) : is2PickPage ? (
        <Link
          href="/"
          className="lnk-important"
        >
          通常構築に戻る
        </Link>
      ) : null}
    </div>
  );
} 