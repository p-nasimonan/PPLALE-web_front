/**
 * カードの種類を定義する型
 */
export type CardType = '幼女' | 'お菓子' | 'プレイアブル';
export type FruitType = 'すべて' |'いちご' | 'ぶどう' | 'めろん' | 'おれんじ';

/**
 * カードの情報を表すインターフェース
 */
export interface CardInfo {
  /** カードのID */
  id: string;
  /** カードの名前 */
  name: string;
  /** カードの種類（幼女またはお菓子） */
  type: CardType;
  /** フルーツの種類 */
  fruit: FruitType;
  /** コスト */
  cost: number;
  /** HP */
  hp: number;
  /** 攻撃力 */
  attack: number;
  /** カードの説明文 */
  description: string;
  /** カードの画像URL */
  imageUrl: string;
  /** 役職 */
  role?: string;
  /** お菓子タイプ */
  sweetType?: string;
  /** 効果 */
  effect?: string;
  /** バージョン */
  version?: string;
}

/**
 * デッキの情報を表すインターフェース
 */
export interface Deck {
  /** デッキのID */
  id: string;
  /** デッキの名前 */
  name: string;
  /** デッキに含まれるカードのIDリスト */
  cardIds: string[];
  /** デッキの作成日時 */
  createdAt: string;
  /** デッキの更新日時 */
  updatedAt: string;
}