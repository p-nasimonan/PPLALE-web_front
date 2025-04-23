import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    path: '/PPLALE-web_front',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
  },
  // 画像のパスを修正
  async rewrites() {
    return [
      {
        source: '/PPLALE-web_front/images/:path*',
        destination: '/images/:path*',
      },
    ];
  },
};

export default nextConfig;
