import type { NextConfig } from 'next';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const basePath = isGitHubPages ? '/PPLALE-web_front' : '';

const config: NextConfig = {
  output: 'export',
  assetPrefix: basePath,
  images: {
    unoptimized: true,
    domains: ['localhost', 'pplale.pgw.jp'],
    path: basePath,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
  },
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: '/images/:path*',
      },
    ];
  },
  basePath,
  trailingSlash: false,
  publicRuntimeConfig: {
    basePath,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: `${basePath}/images`,  // 画像のURLパス
            outputPath: 'images',              // 出力ディレクトリ
            name: '[name].[hash].[ext]',
          },
        },
      ],
    });
    return config;
  }
};

export default config;
