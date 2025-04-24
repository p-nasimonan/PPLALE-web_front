'use client';

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import { CardInfo, CardType, FruitType } from '@/types/card';
import sweetData from '@/data/sweet.json';
import yojoData from '@/data/yojo.json';
import Link from 'next/link';
import { DarkModeContext } from "../DarkModeProvider";
import Deck from '@/components/Deck';
import CardSelection from './components/CardSelection';
import ExportPopup from '@/components/ExportPopup';

// サンプルカードデータ
const sampleCards: CardInfo[] = [
  ...yojoData.yojo.map(card => ({
    ...card,
    type: card.type as CardType,
    fruit: card.fruit as FruitType
  })),
  ...sweetData.sweet.map(card => ({
    ...card,
    type: card.type as CardType,
    fruit: card.fruit as FruitType
  }))
];

export default function TwoPick() {
  // すべてのカード
  const [allCards] = useState<CardInfo[]>(sampleCards);
  // 選択されたカード
  const [selectedCards, setSelectedCards] = useState<CardInfo[]>([]);
  // 現在の選択フェーズ（幼女かお菓子か）
  const [currentPhase, setCurrentPhase] = useState<CardType>('幼女');
  // 現在表示されている選択肢
  const [currentChoices, setCurrentChoices] = useState<CardInfo[]>([]);
  // 幼女デッキ
  const [yojoDeck, setYojoDeck] = useState<CardInfo[]>([]);
  // お菓子デッキ
  const [sweetDeck, setSweetDeck] = useState<CardInfo[]>([]);

  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  
  const [isShowDeck, setIsShowDeck] = useState(false); // デッキ確認ポップアップの表示状態
  const [round, setRound] = useState(1); // 現在のラウンド
  const [showExportPopup, setShowExportPopup] = useState(false);

  const { control, handleSubmit, watch } = useForm<{ fruits: FruitType[] }>({
    defaultValues: {
      fruits: ['いちご', 'ぶどう'], // 初期選択
    },
  });

  const selectedFruits = watch('fruits'); // フルーツ選択の監視
  const [isFruitSelectionComplete, setIsFruitSelectionComplete] = useState(false); // フルーツ選択完了状態

  // 選択肢を更新する関数
  const updateChoices = useCallback(() => {
    const availableCards = allCards.filter(
      card => card.type === currentPhase && selectedFruits.includes(card.fruit)
    );

    const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
    setCurrentChoices(shuffled.slice(0, 4));
  }, [allCards, currentPhase, selectedFruits]);

  // ラウンドが変わったときに選択肢を更新
  useEffect(() => {
    if (isFruitSelectionComplete) {
      updateChoices();
    }
  }, [currentPhase, updateChoices, isFruitSelectionComplete]);

  // カードが選択されたときの処理
  const handleCardSelect = (card1: CardInfo, card2: CardInfo) => {
    if (currentPhase === '幼女' && yojoDeck.length < 20) {
      setSelectedCards([...selectedCards, card1, card2]);
      setYojoDeck([...yojoDeck, card1, card2]);
    } else if (currentPhase === 'お菓子' && sweetDeck.length < 10) {
      setSelectedCards([...selectedCards, card1, card2]);
      setSweetDeck([...sweetDeck, card1, card2]);
    }

    setRound(round + 1);
    updateChoices();

    // 20枚選択したらお菓子を選択
    if (currentPhase === '幼女' && round >= 10) {
      setCurrentPhase('お菓子');
      setRound(1);
    }
  };

  // デッキ確認ボタンの処理
  const showDeck = () => {
    setIsShowDeck(isShowDeck => !isShowDeck);
  };

  // フルーツ選択画面のフォーム送信処理
  const handleFruitSelectionSubmit = () => {
    setIsFruitSelectionComplete(true); // フルーツ選択完了
  };

  return (
    <div className="container relative">
      <header>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-center">2pick デッキ構築</h1>
          <Link href="/" className="text-1xl text-center">
            通常構築に戻る
          </Link>
          <button
            className="toggle-dark-mode"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {!isFruitSelectionComplete ? (
        // フルーツ選択画面
        <div className="flex flex-col items-center mt-8">
          <h2 className="text-xl font-bold mb-4">カードのフルーツを選択してください</h2>
          <form
            onSubmit={handleSubmit(handleFruitSelectionSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              {(['いちご', 'ぶどう', 'めろん', 'おれんじ'] as FruitType[]).map(fruit => (
                <Controller
                  key={fruit}
                  name="fruits"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<{ fruits: FruitType[] }, 'fruits'> }) => (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        value={fruit}
                        checked={field.value.includes(fruit)}
                        onChange={e => {
                          const newValue = e.target.checked
                            ? [...field.value, fruit]
                            : field.value.filter(f => f !== fruit);
                          field.onChange(newValue);
                        }}
                        className="mr-2"
                      />
                      {fruit}
                    </label>
                  )}
                />
              ))}
            </div>
            <button type="submit" className="btn-primary">
              次へ
            </button>
          </form>
        </div>
      ) : (
        // カード選択画面
        <div className="mt-4 flex flex-col items-center">
          {yojoDeck.length < 20 || sweetDeck.length < 10 ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-center">
                {round} / {currentPhase === "幼女" ? 10 : 5}: {currentPhase}カードを選択してください
              </h2>
              <div className="flex justify-between w-full max-w-4xl items-center">
                {/* 左側のカード選択 */}
                {currentChoices.length >= 2 && (
                  <CardSelection
                    card1={currentChoices[0]}
                    card2={currentChoices[1]}
                    onSelect={() => handleCardSelect(currentChoices[0], currentChoices[1])}
                  />
                )}

                {/* デッキ確認ボタン */}
                <div className="flex justify-center">
                  <button
                    className="btn-import"
                    onClick={() => showDeck()}
                  >
                    デッキ確認
                  </button>
                </div>

                {/* 右側のカード選択 */}
                {currentChoices.length >= 4 && (
                  <CardSelection
                    card1={currentChoices[2]}
                    card2={currentChoices[3]}
                    onSelect={() => handleCardSelect(currentChoices[2], currentChoices[3])}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">デッキ構築完了！</h2>
              <p className="mb-4">選択したカードでデッキが完成しました。</p>
              <Link href="/" className="btn-export mb-4">
                ホームに戻る
              </Link>
              <button
                className="btn-export mb-4"
                onClick={() => setShowExportPopup(true)}
              >
                エクスポート
              </button>
              <div className="flex justify-center">
                <button
                  className="btn-import"
                  onClick={() => showDeck()}
                >
                  デッキ確認
                </button>
              </div>
            </div>
          )}
          {isShowDeck && (
            <div className="space-y-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 mt-2">
              <Deck
                cards={yojoDeck}
                type="幼女"
                removeable={false}
              />
              <Deck
                cards={sweetDeck}
                type="お菓子"
                removeable={false}
              />
            </div>
          )}
        </div>
      )}

      {/* エクスポートポップアップ */}
      {showExportPopup && (
        <ExportPopup
          yojoDeck={yojoDeck}
          sweetDeck={sweetDeck}
          onClose={() => setShowExportPopup(false)}
        />
      )}
    </div>
  );
}