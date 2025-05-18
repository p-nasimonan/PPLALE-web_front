import type { NextConfig } from 'next';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const basePath = isGitHubPages ? '/PPLALE-web_front' : '';

const config: NextConfig = {
  output: isGitHubPages ? 'export' : 'standalone',
  distDir: 'out',
  assetPrefix: basePath,
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
    path: basePath,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    unoptimized: true
  },
  experimental: {
    optimizeCss: true,
  },
  basePath,
  trailingSlash: true,
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
            publicPath: `${basePath}/images`,
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
