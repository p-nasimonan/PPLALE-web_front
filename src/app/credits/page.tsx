'use client';

import React from 'react';
import { Darumadrop_One } from 'next/font/google';
import Link from 'next/link';

const darumadrop = Darumadrop_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default function Credits() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className={`${darumadrop.className} text-4xl md:text-5xl text-center mb-16 text-pink-600`}>
          クレジット
        </h1>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <section className="mb-8">
            <h2 className={`${darumadrop.className} text-2xl mb-4 text-pink-500`}>使用素材</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-bold text-lg mb-2">アバター</h3>
                <p className="text-gray-700">
                  {/* ここにアバターのクレジット情報を記載 */}
                  アバター名: [アバター名]<br />
                  作者: [作者名]<br />
                  ライセンス: [ライセンス情報]<br />
                  リンク: [アバターのリンク]
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-bold text-lg mb-2">画像素材</h3>
                <p className="text-gray-700">
                  {/* ここに画像素材のクレジット情報を記載 */}
                  素材名: [素材名]<br />
                  作者: [作者名]<br />
                  ライセンス: [ライセンス情報]<br />
                  リンク: [素材のリンク]
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-bold text-lg mb-2">フォント</h3>
                <p className="text-gray-700">
                  Darumadrop One<br />
                  Google Fonts<br />
                  Apache License 2.0
                </p>
              </div>
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