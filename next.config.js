/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // 静的ファイルのパスを設定
  assetPrefix: '/',
  basePath: '',
}

module.exports = nextConfig 