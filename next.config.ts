import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const config: NextConfig = {
  assetPrefix: isProd ? '/PPLALE-web_front' : '', // 環境に応じて設定
  images: {
    domains: ['localhost'],
    path: isProd ? '/PPLALE-web_front' : '',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    unoptimized: true, // 日本語ファイル名の問題を回避するため
  },
  experimental: {
    optimizeCss: true,
  },
  async rewrites() {
    return [
      {
        source: '/images/:path*', // ローカル環境では直接 /images を使用
        destination: '/images/:path*',
      },
      {
        source: '/PPLALE-web_front/images/:path*', // 本番環境では /PPLALE-web_front/images を使用
        destination: '/images/:path*',
      },
    ];
  },
};

export default config;
