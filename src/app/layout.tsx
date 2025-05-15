import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DarkModeProvider from './DarkModeProvider';
import { SettingsProvider } from './SettingsProvider';
import SettingsButton from '@/components/SettingsButton';
import FireBaseLogin from '@/components/FireBaseLogin';

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
            <div className="fixed bottom-4 left-4 z-50 flex items-center gap-4">
              <FireBaseLogin />
              <SettingsButton />
            </div>
            {children}
          </SettingsProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
