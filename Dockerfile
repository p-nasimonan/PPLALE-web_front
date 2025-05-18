FROM node:22-alpine AS builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# ソースコードのコピーとビルド
COPY . .
RUN npm run build

# 本番環境用のイメージ
FROM node:22-alpine AS runner

WORKDIR /app

# 必要なファイルのみをコピー
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 本番環境の設定
ENV NODE_ENV=production
ENV PORT=3000

# アプリケーションの起動
CMD ["node", "server.js"] 