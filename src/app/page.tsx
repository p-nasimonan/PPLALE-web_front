'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

const cardButtons = [
  { title: 'デッキをつくる', href: '/build', img: '/images/back-card.png' },
  { title: 'つぼみ杯', href: '/event/tsubomi', img: '/images/back-card.png' },
  { title: 'ぶどう杯', href: '/event/budou', img: '/images/back-card.png' },
  { title: '2pick', href: '/deck/2pick?twoCardLimit=false&fruits=いちご', img: '/images/back-card.png' },
];

export default function Home() {
  return (
    <main className={styles.mainBg}>
      {/* 背景オーバーレイ */}
      <div className={styles.overlay}></div>

      <div style={{position: 'relative', zIndex: 10}}>
        {/* タイトル画像 */}
        <div
          style={{
            position: 'absolute', top: 100, left: 0, right: 0, zIndex: 10, textAlign: 'center'
          }}
        >
          <h1 className={styles.cherry + ' ' + styles.title}>
            ぷぷりえーる
          </h1>
        </div>

        <div style={{position: 'relative', zIndex: 10}}>
          {/* 画像ボタンをmapで横並びに（タイトルを画像の上に重ねる） */}
          <div style={{position: 'absolute', top: 600, left: 0, right: 0, zIndex: 10, display: 'flex', justifyContent: 'center', gap: '2.5rem'}}>
            {cardButtons.map((btn, idx) => (
              <div key={btn.title} style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  style={{position: 'relative', width: 220, height: 320}}
                >
                  <Link href={btn.href}>
                    {/* タイトルを画像の上に重ねる */}
                    <span className={styles.cherry} style={{
                      position: 'absolute',
                      top: 0,
                      bottom: -10,
                      left: 0,
                      right: 0,
                      width: '100%',
                      zIndex: 10,
                      fontWeight: 'bold',
                      fontSize: '2rem',
                      color: '#fff',
                      textShadow: '0 2px 8px #0008',
                      letterSpacing: '0.05em',
                      textAlign: 'center',
                      background: 'rgba(0,0,0,0.25)',
                      borderTopLeftRadius: '1rem',
                      borderTopRightRadius: '1rem',
                      borderBottomLeftRadius: '1rem',
                      borderBottomRightRadius: '1rem',
                      padding: '0.7em 0',
                    }}>{btn.title}</span>
                    <Image
                      src={btn.img}
                      alt={btn.title}
                      width={220}
                      height={320}
                      style={{cursor: 'pointer', borderRadius: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)'}}
                      priority={idx === 0}
                    />
                  </Link>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
