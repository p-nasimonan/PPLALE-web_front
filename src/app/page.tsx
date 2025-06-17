'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Darumadrop_One } from 'next/font/google';

const darumadrop = Darumadrop_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const cardButtons = [
  { title: 'デッキをつくる', href: '/build', img: '/images/back-card.webp' },
  { title: 'ようかん杯', href: '/deck/2pick?twoCardLimit=false&fruits=いちご', img: '/images/back-card.webp' },
];

// 解説カード情報
const explanationCards = [
  { 
    title: 'ぷぷりえーるとは', 
    description: 'ぷぷりえの幼女とお菓子のカードゲーム。20枚の幼女カードと10枚のお菓子カードでデッキを構築し対戦します。ぷぷりえポイント(PP)を使用してカードを使って、先に相手のお菓子(HP)を食べた方が勝ちです。',
    img: '/images/fruits/いちご.png' 
  },
  { 
    title: 'ぷぷりえとは', 
    description: 'VRChatのイベントです',
    img: '/images/fruits/いちご.png' 
  }
];

// アニメーション設定
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.6,
    }
  }
};

const cardVariants = {
  hidden: { 
    y: -400, 
    opacity: 0.1,
    rotateY: 100,
    rotateX: 90,
    scale: 0.8
  },
  visible: { 
    y: 0, 
    opacity: 1,
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 70,
      damping: 20,
      duration: 0.7
    }
  }
};

// 解説カードアニメーション
const explanationVariants = {
  hidden: { 
    opacity: 0,
    y: 100
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 20
    }
  }
};

export default function Home() {
  const { scrollY } = useScroll();
  const [isMounted, setIsMounted] = useState(false);
  
  // スクロール量に基づいたカードの位置調整
  // 最初は画面外の下（bottom: -60vh）に配置され、スクロールすると上に移動
  const cardsYPosition = useTransform(
    scrollY, 
    [0, 100, 600], 
    ['calc(100vh + 30vh)', 'calc(100vh - 30vh)', 'calc(100vh - 100vh)']
  );
  
  // 解説カードの表示制御
  const explanationOpacity = useTransform(scrollY, [400, 600], [0, 1]);
  const explanationY = useTransform(scrollY, [400, 700], [100, 0]);

  // クライアント側でのみマウント状態を設定
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen w-full relative overflow-x-hidden">
      {/* ヒーローセクション（タイトルとカード部分） */}
      <section className="relative h-screen">
        {/* タイトル部分の背景画像 */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: 'url("/top.jpg")' }}
        >
          {/* 背景オーバーレイ */}
          <div className="absolute inset-0"></div>
        </div>
        
        {/* タイトルコンテナ */}
        <div className="relative z-10">
          <motion.div 
            className="w-full text-center pt-16 md:pt-24 lg:pt-28"
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <Image src="/pupu_game.webp" alt="ぷぷりえーる" width={500} height={281} className="absolute left-0 right-0 mx-auto top-1/2" priority/>
          </motion.div>

          {/* カードボタンコンテナ - 絶対位置で画面外下部に配置 */}
          {isMounted && (
            <motion.div 
              className="absolute left-0 right-0 bottom-0 z-20 flex justify-center px-3"
              style={{ 
                top: cardsYPosition
              }}
            >
              <motion.div 
                className="flex flex-wrap justify-center gap-5 md:gap-8 lg:gap-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {cardButtons.map((btn, idx) => (
                  <motion.div
                    key={btn.title}
                    variants={cardVariants}
                    custom={idx}
                    whileHover={{ 
                      transition: { duration: 0.2, ease: "easeOut" },
                      y: -100
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="relative mb-1"
                  >
                    <Link href={btn.href} className="block">
                      <div 
                        className="relative" 
                        style={{ 
                          width: 'calc(280px + 1vw)',
                          maxWidth: '320px',
                          aspectRatio: '220/320'
                        }}
                      >
                        {/* タイトルを画像の上に重ねる */}
                        <div 
                          className={`${darumadrop.className} absolute inset-0 z-10 flex items-center justify-center 
                          bg-black bg-opacity-25 rounded-2xl font-bold text-xl sm:text-2xl text-white shadow-lg
                          p-2 text-center`}
                        >
                          {btn.title}
                        </div>
                        <Image
                          src={btn.img}
                          alt={btn.title}
                          fill
                          sizes="(max-width: 640px) 85vw, (max-width: 768px) 45vw, 320px"
                          style={{
                            objectFit: 'cover',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                          }}
                          priority={idx === 0}
                        />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* 解説カードセクション - 別の背景画像 */}
      {isMounted && (
        <section className="relative min-h-screen w-full">
          {/* 解説セクションの背景画像 */}
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: 'url("/explanation-bg.jpg")' }}
          >
            {/* 背景オーバーレイ */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>

          <motion.div 
            className="relative z-10 w-full flex items-center justify-center py-20 px-4"
            style={{
              opacity: explanationOpacity,
              y: explanationY
            }}
          >
            <div className="w-full max-w-6xl">
              <motion.h2 
                className={`${darumadrop.className} text-4xl md:text-5xl text-center mb-16 text-white`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                style={{
                  background: 'linear-gradient(to top,rgb(255, 201, 187),rgb(255, 116, 220))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                ゲームについて
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-10 mt-10">
                {explanationCards.map((card) => (
                  <motion.div
                    key={card.title}
                    className="bg-yellow-200 bg-opacity-90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white border-opacity-20"
                    variants={explanationVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <div className="flex flex-col h-full">
                      <h3 className={`${darumadrop.className} text-2xl md:text-3xl mb-4 text-pink-400`}>
                        {card.title}
                      </h3>
                      
                      <div className="mb-6 flex-grow">
                        <p className="text-black-500 text-lg leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                      
                      <div className="relative h-64 rounded-xl overflow-hidden">
                        <Image
                          src={card.img}
                          alt={card.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      )}
      <footer className="py-4  w-full gap-1 justify-center items-center flex flex-col maincolor z-1 bg-black/50">
        <div>© 2025 ぷぷりえーる デッキ構築</div>
        <div className="flex gap-4 mt-2">
          <div>
            <Link href="/privacy-policy">プライバシーポリシー</Link>
          </div>
          <div>
            <Link href="/terms">利用規約</Link>
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          <div>
            <Link href="/credits">クレジット</Link>
          </div>
          <div>
            <Link href="/contact">お問い合わせ</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
