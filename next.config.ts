import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pplale.pgw.jp',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      }
    ],
    domains: ['pplale.pgw.jp', 'localhost', 'lh3.googleusercontent.com'],
    unoptimized: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60
  },
  experimental: {
    optimizeCss: true,
    serverComponentsExternalPackages: ['@vercel/og'],
  },
  // フォント最適化の設定
  optimizeFonts: true,
  // 本番環境用の設定
  assetPrefix: '',
  basePath: '',
  // 動的ルーティングの設定
  trailingSlash: true,

  publicRuntimeConfig: {
    basePath: '',
  },
  webpack: (config) => {
    // SVG 以外の画像ファイルを file-loader で処理する
    config.module.rules.push({
      test: /\.(png|jpe?g|gif)$/i,
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

    // SVG を React コンポーネントとして処理する
    config.module.rules.push({
      test: /\.svg$/i,
      use: [{
        loader: '@svgr/webpack',
        options: {
          svgo: true,
          svgoConfig: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: { removeViewBox: false },
                },
              },
            ],
          },
        },
      }],
    });

    return config;
  }
};

export default config;
