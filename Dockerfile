FROM node:22-alpine AS builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# ソースコードのコピーとビルド
COPY . .

# ビルド時に環境変数を渡す
ARG FIREBASE_PROJECT_ID
ARG FIREBASE_CLIENT_EMAIL
ARG FIREBASE_PRIVATE_KEY
ARG NEXT_PUBLIC_BASE_URL

ENV FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
ENV FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL
ENV FIREBASE_PRIVATE_KEY=$FIREBASE_PRIVATE_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

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

# ログディレクトリの作成
RUN mkdir -p /app/logs && chmod 777 /app/logs

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
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# ボリュームの設定
VOLUME ["/app/logs"]

# アプリケーションの起動
CMD ["node", "server.js"] 