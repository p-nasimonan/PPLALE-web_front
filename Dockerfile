FROM node:22-alpine AS builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# ソースコードのコピーとビルド
COPY . .
RUN npm run build && \
    echo "Checking build output..." && \
    echo "=== Standalone directory ===" && \
    ls -la /app/.next/standalone && \
    echo "=== Static directory ===" && \
    ls -la /app/.next/static && \
    echo "=== Public directory ===" && \
    ls -la /app/public && \
    echo "=== Public/images directory ===" && \
    ls -la /app/public/images

# 本番環境用のイメージ
FROM node:22-alpine AS runner

WORKDIR /app

# 必要なファイルのみをコピー
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# ファイルの存在確認
RUN echo "Checking copied files..." && \
    echo "=== App directory ===" && \
    ls -la /app && \
    echo "=== Static directory ===" && \
    ls -la /app/.next/static && \
    echo "=== Public directory ===" && \
    ls -la /app/public && \
    echo "=== Public/images directory ===" && \
    ls -la /app/public/images

# 本番環境の設定
ENV NODE_ENV=production
ENV PORT=3000

# アプリケーションの起動
CMD ["node", "server.js"] 