/**
 * カードの種類を定義する型
 */
export type CardType = '幼女' | 'お菓子';
export type FruitType = 'いちご' | 'ぶどう' | 'めろん' | 'おれんじ';

/**
 * カードの情報を表すインターフェース
 */
export interface CardInfo { // 名前をCardからCardInfoに変更
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