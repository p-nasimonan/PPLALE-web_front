'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function HeaderNavigation() {
  const pathname = usePathname();
  const isMainPage = pathname === '/';
  const is2PickPage = pathname === '/2pick';

  return (
    <div className="flex items-center gap-4 ">
      {isMainPage ? (
        <>
          <button
            className="btn-reset"
            onClick={() => window.dispatchEvent(new CustomEvent('resetDeck'))}
          >
            リセット
          </button>
          <Link
            href="/2pick"
            className="lnk-important truncate"
          >
            2pickで構築する
          </Link>
          <button
            className="btn-export"
            onClick={() => window.dispatchEvent(new CustomEvent('exportDeck'))}
            title="エクスポート"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
          <button
            className="btn-import"
            onClick={() => window.dispatchEvent(new CustomEvent('importDeck'))}
            title="インポート"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          </button>
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