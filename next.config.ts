import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pplale.pgw.jp',
        port: '',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
    domains: ['pplale.pgw.jp', 'localhost', 'lh3.googleusercontent.com'],
    unoptimized: true,
    path: '/images',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60
  },
  experimental: {
    optimizeCss: true,
  },
  // GitHub Pages用の設定
  basePath: process.env.NEXT_PUBLIC_GITHUB_PAGES ? '/PPLALE-web_front' : '',
  // 動的ルーティングの設定
  trailingSlash: true,
  // リダイレクト設定
  async redirects() {
    return [
      {
        source: '/deck/:userId/:deckId',
        destination: '/deck/:userId/:deckId/',
        permanent: true,
      },
    ];
  },
  // リライト設定
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/deck/:userId/:deckId',
          destination: '/deck/[userId]/[deckId]',
        },
      ],
    };
  },
  // 静的生成の設定
  async generateStaticParams() {
    return {
      '/deck/[userId]/[deckId]': [
        { userId: 'local', deckId: '1' },
        { userId: 'local', deckId: '2' },
        // 必要に応じて他のパスを追加
      ],
    };
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/images',
            outputPath: 'images',
            name: '[name].[ext]',
          },
        },
      ],
    });
    return config;
  }
};

export default config;
