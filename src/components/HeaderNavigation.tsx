'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function HeaderNavigation() {
  const pathname = usePathname();
  const isNormalPage = pathname === '/deck/normal';
  const is2PickPage = pathname === '/deck/2pick';

  return (
    <div className="flex items-center gap-4 ">
      {isNormalPage ? (
        <>
          <button
            className="btn-reset"
            onClick={() => window.dispatchEvent(new CustomEvent('resetDeck'))}
          >
            リセット
          </button>
        </>
      ) : is2PickPage ? (
      <></>
      ) : null}
    </div>
  );
} 