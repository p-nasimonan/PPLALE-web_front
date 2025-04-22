/**
 * プロバイダーコンポーネント
 * 
 * アプリケーション全体にNextAuthのプロバイダーを提供する
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface ProvidersProps {
  /** 子コンポーネント */
  children: ReactNode;
}

/**
 * プロバイダーコンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @returns プロバイダーコンポーネント
 */
export default function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
} 