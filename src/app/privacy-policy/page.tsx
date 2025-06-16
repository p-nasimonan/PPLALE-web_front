'use client';

import React from 'react';
import { Darumadrop_One } from 'next/font/google';
import Link from 'next/link';

const darumadrop = Darumadrop_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className={`${darumadrop.className} text-4xl md:text-5xl text-center mb-16 text-pink-600`}>
          プライバシーポリシー
        </h1>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <section className="space-y-8">
            <div>
              <h2 className={`${darumadrop.className} text-2xl mb-4 text-pink-500`}>1. 収集する情報</h2>
              <p className="text-gray-700 mb-4">
                当サービスでは、以下の情報を収集する場合があります：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Firebaseに保存される情報：
                  <ul className="list-disc pl-6 mt-2">
                    <li>Googleアカウントのメールアドレス（ログイン時）</li>
                    <li>デッキデータ（ログイン時のみ保存）</li>
                  </ul>
                </li>
                <li>クライアント側でのみ使用される情報（サーバーには保存されません）：
                  <ul className="list-disc pl-6 mt-2">
                    <li>Googleアカウントのユーザー名（ログイン時の表示用）</li>
                    <li>Googleアカウントのプロフィール画像（ログイン時のアイコン表示用）</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div>
              <h2 className={`${darumadrop.className} text-2xl mb-4 text-pink-500`}>2. 情報の利用目的</h2>
              <p className="text-gray-700 mb-4">
                収集した情報は以下の目的で利用されます：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>ユーザー認証</li>
                <li>デッキデータの保存、共有</li>
              </ul>
            </div>

            <div>
              <h2 className={`${darumadrop.className} text-2xl mb-4 text-pink-500`}>3. 情報の管理</h2>
              <p className="text-gray-700 mb-4">
                当サービスでは、収集した情報を適切に管理し、以下の取り組みを行っています：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Firebaseのセキュリティ機能を活用した安全なデータ管理</li>
              </ul>
            </div>

            <div>
              <h2 className={`${darumadrop.className} text-2xl mb-4 text-pink-500`}>4. 情報の共有</h2>
              <p className="text-gray-700 mb-4">
                当サービスでは、収集した情報を以下の場合を除き、第三者に提供することはありません：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>法令に基づく場合</li>
                <li>ユーザーの同意がある場合</li>
              </ul>
            </div>

            <div>
              <h2 className={`${darumadrop.className} text-2xl mb-4 text-pink-500`}>5. ユーザーの権利</h2>
              <p className="text-gray-700 mb-4">
                ユーザーは以下の権利を有します：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>自身のデータの削除要求権</li>
              </ul>
            </div>

            <div>
              <h2 className={`${darumadrop.className} text-2xl mb-4 text-pink-500`}>6. プライバシーポリシーの変更</h2>
              <p className="text-gray-700">
                当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。
                変更があった場合は、本ページでお知らせします。
              </p>
            </div>
          </section>

          <div className="text-center mt-8">
            <Link 
              href="/" 
              className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
            >
              トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 