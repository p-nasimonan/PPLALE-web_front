import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import DarkModeProvider from './DarkModeProvider';
import { SettingsProvider } from './SideMenuProvider';
import { AuthProvider } from '@/lib/auth';
import SettingsButton from '@/components/SideMenu';
import FireBaseLogin from '@/components/FireBaseLogin';
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pplale.pgw.jp'),
  title: "ぷぷりえーる デッキ構築",
  description: "VRChatにあるカードゲーム「ぷぷりえーる」のデッキ構築などができるwebアプリ。通常構築や2pick構築が可能で、カードの組み合わせを自由に試せます。",
  keywords: "ぷぷりえーる, VRChat, カードゲーム, デッキ構築, 2pick, カード組み合わせ",
  authors: [{ name: "ようかん" }],
  creator: "ぷぷりえ",
  publisher: "ぷぷりえ",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "ぷぷりえーる デッキ構築",
    description: "VRChatにあるカードゲーム「ぷぷりえーる」のデッキ構築などができるwebアプリ",
    url: "https://pplale.pgw.jp",
    siteName: "ぷぷりえーる デッキ構築",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "ぷぷりえーる デッキ構築",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ぷぷりえーる デッキ構築",
    description: "VRChatにあるカードゲーム「ぷぷりえーる」のデッキ構築などができるwebアプリ",
    images: ["/ogp.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="canonical" href="https://pplale.pgw.jp" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Favicon設定 */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ぷぷりえーる デッキ構築",
              "description": "VRChatにあるカードゲーム「ぷぷりえーる」のデッキ構築などができるwebアプリ",
              "url": "https://pplale.pgw.jp",
              "applicationCategory": "Game",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "JPY"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SpeedInsights />
        <AuthProvider>
          <DarkModeProvider>
            <SettingsProvider>
              <header className="fixed top-0 left-0 right-0 h-16 z-40">
                <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center justify-between">
                  <div className="flex items-center gap-4 truncate">
                    <Link className="text-xl font-bold truncate" href="/">ぷぷりえーる デッキ構築</Link>
                  </div>
                  <div className="flex items-center gap-4">
                    <SettingsButton />
                    <FireBaseLogin />
                  </div>
                </div>
              </header>
              <main className="pt-20 px-4">
                {children}
              </main>
            </SettingsProvider>
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
