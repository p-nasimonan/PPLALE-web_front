export default function imageLoader({ src, width, quality }) {
  // 日本語ファイル名をエンコード
  const encodedSrc = encodeURIComponent(src);
  
  // 画像の最適化パラメータを追加
  return `${src}?w=${width}&q=${quality || 75}`;
} 