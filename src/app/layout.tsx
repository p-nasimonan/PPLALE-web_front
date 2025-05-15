import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DarkModeProvider from './DarkModeProvider';
import { SettingsProvider } from './SettingsProvider';
import SettingsButton from '@/components/SettingsButton';
import FireBaseLogin from '@/components/FireBaseLogin';
import HeaderNavigation from '@/components/HeaderNavigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ぷぷりえーる デッキ構築",
  description: "VRChatにあるカードゲーム「ぷぷりえーる」のデッキ構築などができるwebアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DarkModeProvider>
          <SettingsProvider>
            <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50">
              <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center justify-between">
                <h1 className="text-xl font-bold">ぷぷりえーる デッキ構築</h1>
                <div className="flex items-center gap-4">
                  <HeaderNavigation />
                  <FireBaseLogin />
                  <SettingsButton />
                </div>
              </div>
            </header>
            <main className="pt-20 px-4">
              {children}
            </main>
          </SettingsProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
