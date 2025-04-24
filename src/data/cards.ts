import { CardInfo, CardType, FruitType } from '@/types/card';
import sweetData from '@/data/sweet.json';
import yojoData from '@/data/yojo.json';
import playableData from '@/data/playable.json';

// 幼女カードデータ
export const allYojoCards: CardInfo[] = yojoData.yojo.map(card => ({
  ...card,
  type: card.type as CardType,
  fruit: card.fruit as FruitType,
}));

// お菓子カードデータ
export const allSweetCards: CardInfo[] = sweetData.sweet.map(card => ({
  ...card,
  type: card.type as CardType,
  fruit: card.fruit as FruitType,
}));

export const allPlayableCards: CardInfo[] = playableData.playable.map(card => ({
  ...card,
  type: card.type as CardType,
  fruit: card.fruit as FruitType,
}));