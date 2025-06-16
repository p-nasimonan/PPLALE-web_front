'use client';

import React from 'react';
import { Darumadrop_One } from 'next/font/google';
import Link from 'next/link';

const darumadrop = Darumadrop_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const avatar = [
  {
    Name: '【オリジナル３Dモデル】mia -ミア-',
    Credit: '「Hamuketsu/はむけつ」©Sisters!',
    Link: 'https://sisters.booth.pm/items/2908226',
  },
  {
    Name: '【VRアバター「こぎちゅね姉妹」',
    Credit: '「Hamuketsu/はむけつ」©Sisters!',
    Link: 'https://sisters.booth.pm/items/1105122',
  },
  {
    Name: 'original 3D model 「cocoa-ココア-」',
    Credit: '「Hamuketsu/はむけつ」©Sisters!',
    Link: 'https://sisters.booth.pm/items/3639280',
  },
  {
    Name: 'オリジナル３Dモデル「ぽんとちゅね pon&chune」 #chibi_kemo',
    Credit: '「Hamuketsu/はむけつ」©Sisters!',
    Link: 'https://booth.pm/ja/items/5335595',
  },
  {
    Name: 'original 3D model 「ましゅ -mashu-」',
    Credit: '「Hamuketsu/はむけつ」©Sisters!',
    Link: 'https://booth.pm/ja/items/3878174',
  },
  {
    Name: 'オリジナル3Dモデル「たま-tama-」',
    Credit: '「Hamuketsu/はむけつ」©Sisters!',
    Link: 'https://booth.pm/ja/items/2991523',
  },
  {
    Name: 'オリジナル３Dモデル「ぱたにゃこ　patanyako」',
    Credit: '「Hamuketsu/はむけつ」©Sisters!',
    Link: 'https://sisters.booth.pm/items/5129661',
  },
  {
    Name: 'Original 3D Model ［nero -ネロ-］',
    Credit: '「Hamuketsu/はむけつ」©Sisters!',
    Link: 'https://booth.pm/ja/items/3436014',
  },
  {
    Name: 'オリジナル3Dモデル『アズキ』',
    Credit: '©えも研',
    Link: 'https://booth.pm/ja/items/6654988',
  },
  {
    Name: 'オリジナル3Dモデル『クララ』',
    Credit: '©えも研',
    Link: 'https://emolab.booth.pm/items/5484178',
  },
  {
    Name: 'オリジナル３Dモデル「てまり temari」',
    Credit: '「Hamuketsu/はむけつ」©Sisters!',
    Link: 'https://booth.pm/ja/items/4962906',
  },
  {
    Name: 'オリジナル3Ｄモデル 紫苑_Sion',
    Credit: '©Lemiel_atelier',
    Link: 'https://booth.pm/ja/items/3987778',
  },
  
];

const clothes = [
  {
    Name: '着せ替えデータ「テディベアエプロンドレス」',
    Credit: '「Hamuketsu/はむけつ」©Sisters!',
    Link: 'https://sisters.booth.pm/items/1829886',
  },
  {
    Name: '【15アバター対応】WiccaMaid【VRChat】',
    Credit: '#NookNook',
    Link: 'https://osatoubox.booth.pm/items/6148778',
  },
  {
    Name: '【ましゅちゃん対応】みるきぃロリータ',
    Credit: '@AnomaNice',
    Link: 'https://anomanice.booth.pm/items/4112140',
  },
  {
    Name: 'Lepus hair うさぎ座ヘア【VRChat】',
    Credit: '©VAlice',
    Link: 'https://booth.pm/ja/items/5618066',
  },
  {
    Name: '【15アバター対応】Urban Rabbit',
    Credit: 'PLUMARIUM',
    Link: 'https://booth.pm/ja/items/4658833',
  },
  {
    Name: 'ゆるふわ ツインテール VRC用',
    Credit: '©#Ene_Collection',
    Link: 'https://booth.pm/ja/items/3999987',
  },
  
]

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
            <p className="text-sm mb-3 leading-relaxed">これらの素材がカードの画像に使用されている可能性があります。</p>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-bold text-lg mb-2">アバター</h3>
                {avatar.map((avatar, idx) => (
                <p className="text-sm mb-3 leading-relaxed" key={idx}>
                  {/* ここにアバターのクレジット情報を記載 */}
                  アバター名: {avatar.Name}<br/>
                  クレジット: {avatar.Credit}<br />
                  リンク: <a href={avatar.Link} target="_blank" className="text-blue-500 hover:text-blue-600" rel="noopener noreferrer">{avatar.Link}</a><br />
                </p>
                ))}
              </div>

              <div className="border-b pb-4">
                <h3 className="font-bold text-lg mb-2">衣装</h3>
                {clothes.map((clothes, idx) => (
                <p className="text-sm mb-2 leading-relaxed" key={idx}>
                  {/* ここに衣装のクレジット情報を記載 */}
                  衣装名: {clothes.Name}<br />
                  クレジット: {clothes.Credit}<br />
                  リンク: <a href={clothes.Link} target="_blank" className="text-blue-500 hover:text-blue-600" rel="noopener noreferrer">{clothes.Link}</a><br />
                </p>
                ))}
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