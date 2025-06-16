'use client';

import React from 'react';
import { Darumadrop_One } from 'next/font/google';
import Link from 'next/link';

const darumadrop = Darumadrop_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default function Contact() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className={`${darumadrop.className} text-4xl md:text-5xl text-center mb-16 text-pink-600`}>
          お問い合わせ
        </h1>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <section className="space-y-8">
            <div>
              <h2 className={`${darumadrop.className} text-2xl mb-4 text-pink-500`}>ぷぷりえーるについて</h2>
              <p className="text-gray-700 mb-4">
                ぷぷりえーるの運営やカード、ゲームルールについてのお問い合わせは、以下の方法でお願いします：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>VRChat: ぷぷりえーるグループに参加してください。</li>
                <li>Twitter: </li>
              </ul>
            </div>

            <div>
              <h2 className={`${darumadrop.className} text-2xl mb-4 text-pink-500`}>デッキビルダーについて</h2>
              <p className="text-gray-700 mb-4">
                このデッキビルダー（Webアプリ）についてのお問い合わせは、以下の方法でお願いします：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>GitHub: <a href="https://github.com/p-nasimonan" className="text-blue-500 hover:text-blue-600" target="_blank" rel="noopener noreferrer">https://github.com/p-nasimonan</a></li>
              </ul>
            </div>

            <div>
              <h2 className={`${darumadrop.className} text-2xl mb-4 text-pink-500`}>お問い合わせの際の注意</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>お問い合わせの内容を具体的にお知らせください</li>
                <li>不具合の報告の場合は、発生時の状況や再現手順があると助かります</li>
                <li>ご要望やご提案も大歓迎です</li>
              </ul>
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