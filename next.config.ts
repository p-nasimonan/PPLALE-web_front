import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const config: NextConfig = {
  output: 'export',
  assetPrefix: isProd ? '' : '', // 本番環境では空文字列
  images: {
    unoptimized: true,
    domains: ['localhost', 'pplale.pgw.jp'],
    path: isProd ? '' : '',
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
  basePath: isGitHubPages ? '/PPLALE-web_front' : '',
  trailingSlash: false,
};

export default config;
