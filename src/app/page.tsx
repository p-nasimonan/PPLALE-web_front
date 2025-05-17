'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">マイデッキ</h1>
        
        {/* 新しいデッキ作成セクション */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">新しいデッキを作成</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/deck/normal"
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">通常構築</h3>
                  <p className="text-gray-600">新しいデッキを最初から構築します</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/deck/2pick"
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">2pick</h3>
                  <p className="text-gray-600">2枚選択方式でデッキを構築します</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* 最近作成したデッキセクション */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">最近作成したデッキ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ここに最近作成したデッキのリストを表示 */}
            <div className="p-4 bg-white rounded-lg shadow-md">
              <div className="aspect-video bg-gray-100 rounded mb-3"></div>
              <h3 className="font-medium">デッキ名</h3>
              <p className="text-sm text-gray-600">最終更新: 2024/03/21</p>
            </div>
            {/* サンプルカードを追加 */}
            <div className="p-4 bg-white rounded-lg shadow-md">
              <div className="aspect-video bg-gray-100 rounded mb-3"></div>
              <h3 className="font-medium">デッキ名</h3>
              <p className="text-sm text-gray-600">最終更新: 2024/03/20</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <div className="aspect-video bg-gray-100 rounded mb-3"></div>
              <h3 className="font-medium">デッキ名</h3>
              <p className="text-sm text-gray-600">最終更新: 2024/03/19</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
