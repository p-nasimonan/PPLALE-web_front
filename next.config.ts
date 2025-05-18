import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  distDir: '.next',
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
    unoptimized: true
  },
  experimental: {
    optimizeCss: true,
  },
  // 本番環境用の設定
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://pplale.pgw.jp' : '',
  basePath: '',
  trailingSlash: true,
  publicRuntimeConfig: {
    basePath: '',
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
