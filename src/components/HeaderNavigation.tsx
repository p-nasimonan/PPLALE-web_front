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
            className="lnk-mode truncate"
          >
            2pick
          </Link>
        </>
      ) : is2PickPage ? (
        <Link
          href="/"
          className="lnk-mode truncate"
        >
          通常構築
        </Link>
      ) : null}
    </div>
  );
} 