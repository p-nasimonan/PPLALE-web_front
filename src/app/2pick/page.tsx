'use client';

import React, { useState, useEffect, useCallback, useContext } from 'react'; // 'use' を削除
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import { CardInfo, CardType, FruitType } from '@/types/card';
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards'; // 通常構築のデータをインポート
import Link from 'next/link';
import { DarkModeContext } from "../DarkModeProvider";
import Deck from '@/components/Deck';
import CardSelection from './components/CardSelection';
import ExportPopup from '@/components/ExportPopup';
import Card from '@/components/Card';

export default function TwoPick() {
  // 幼女カード
  const [yojoCards] = useState<CardInfo[]>(allYojoCards);
  // お菓子カード
  const [sweetCards] = useState<CardInfo[]>(allSweetCards);

  // プレイアブルカード
  const [playableCards] = useState<CardInfo[]>(allPlayableCards); // 'setPlayableCards' を削除
  
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
  const [selectedPlayableCard, setSelectedPlayableCard] = useState<CardInfo | null>(null); // 選択されたプレイアブルカード
  const [isCardDisappearing, setIsCardDisappearing] = useState(false); // カードが消えるアニメーションの状態

  const [selectionPhase, setSelectionPhase] = useState<'fruitSelection' | 'playableSelection' | 'cardSelection'>('fruitSelection'); // 選択フェーズ

  // 選択肢を更新する関数
  const updateChoices = useCallback(() => {
    const availableCards =
      currentPhase === '幼女'
        ? yojoCards.filter(card => selectedFruits.includes(card.fruit))
        : sweetCards.filter(card => selectedFruits.includes(card.fruit));

    const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
    setCurrentChoices(shuffled.slice(0, 4));
  }, [yojoCards, sweetCards, currentPhase, selectedFruits]);

  // プレイアブルカード選択肢を更新する関数
  const updatePlayableChoices = useCallback(() => {
    const shuffled = [...playableCards].sort(() => Math.random() - 0.5);
    setCurrentChoices(shuffled.slice(0, 3)); // ランダムに3枚選択
  }, [playableCards]);

  // ラウンドが変わったときに選択肢を更新
  useEffect(() => {
    if (selectionPhase === 'cardSelection') {
      updateChoices();
    }
  }, [currentPhase, updateChoices, selectionPhase]);

  // フルーツ選択完了後にプレイアブルカード選択肢を更新
  useEffect(() => {
    if (selectionPhase === 'playableSelection') {
      updatePlayableChoices();
    }
  }, [selectionPhase, updatePlayableChoices]);

  // デッキの状態を保持するための useEffect
  useEffect(() => {
    // 初回読み込み時にデッキを localStorage から取得
    const savedYojoDeck = localStorage.getItem('yojoDeck');
    const savedSweetDeck = localStorage.getItem('sweetDeck');

    if (savedYojoDeck) {
      setYojoDeck(JSON.parse(savedYojoDeck));
    }
    if (savedSweetDeck) {
      setSweetDeck(JSON.parse(savedSweetDeck));
    }
  }, []);

  useEffect(() => {
  }, []);

  // デッキが更新されたときに localStorage に保存
  useEffect(() => {
    localStorage.setItem('yojoDeck', JSON.stringify(yojoDeck));
  }, [yojoDeck]);

  useEffect(() => {
    localStorage.setItem('sweetDeck', JSON.stringify(sweetDeck));
  }, [sweetDeck]);

  // カードが選択されたときの処理
  const handleCardSelect = (card1: CardInfo, card2: CardInfo) => {
    if (currentPhase === '幼女' && yojoDeck.length < 20) {
      const updatedYojoDeck = [...yojoDeck, card1, card2];
      setYojoDeck(updatedYojoDeck);
      localStorage.setItem('yojoDeck', JSON.stringify(updatedYojoDeck)); // 通常デッキに同期
    } else if (currentPhase === 'お菓子' && sweetDeck.length < 10) {
      const updatedSweetDeck = [...sweetDeck, card1, card2];
      setSweetDeck(updatedSweetDeck);
      localStorage.setItem('sweetDeck', JSON.stringify(updatedSweetDeck)); // 通常デッキに同期
    }

    setRound(round + 1);
    updateChoices();

    // 20枚選択したらお菓子を選択
    if (currentPhase === '幼女' && round >= 10) {
      setCurrentPhase('お菓子');
      setRound(1);
    }
  };

  // プレイアブルカード選択画面のカード選択処理
  const handlePlayableCardSelect = (card: CardInfo) => {
    setSelectedPlayableCard(card); // カードを拡大表示
  };

  // プレイアブルカード選択完了処理
  const handlePlayableCardConfirm = () => {
    setIsCardDisappearing(true); // アニメーションを開始
    setTimeout(() => {
      setSelectionPhase('cardSelection'); // カード選択画面に移行
      setSelectedPlayableCard(null); // 拡大表示を解除
      setIsCardDisappearing(false); // アニメーション状態をリセット
    }, 500); // アニメーションの時間に合わせてタイムアウトを設定
  };

  // デッキ確認ボタンの処理
  const showDeck = () => {
    setIsShowDeck(isShowDeck => !isShowDeck);
  };

  // フルーツ選択画面のフォーム送信処理
  const handleFruitSelectionSubmit = () => {
    setSelectionPhase('playableSelection'); // プレイアブルカード選択画面に移行
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

      {selectionPhase === 'fruitSelection' ? (
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
      ) : selectionPhase === 'playableSelection' ? (
        // プレイアブルカード選択画面
        <div className="mt-4 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4 text-center">プレイアブルカードを選択してください</h2>
          {!selectedPlayableCard && (
            <div>
              <div className="grid grid-cols-4 sm:grid-cols-3 gap-4">
                {currentChoices.map(card => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handlePlayableCardSelect(card)}
                    width={300}
                    height={450}
                  />
                ))}
              </div>
            </div>
          )}

          {/* スライド表示されたカード */}
          {selectedPlayableCard && (
            <article>
              <div
                className={`flex items-center justify-start w-full transform-slide ${
                  isCardDisappearing ? 'animate-disappear' : ''
                }`}
              >
                <Card
                  card={selectedPlayableCard}
                  width={340}
                  height={500}
                />
                <div className="description w-80 h-40 overflow-auto p-4 bg-gray-100 rounded-lg">
                  {selectedPlayableCard.description && (
                    <p className="text-sm break-words">{selectedPlayableCard.description}</p>
                  )}
                </div>
              </div>
              <button
                className="btn-secondary absolute top-30 left-5"
                onClick={() => setSelectedPlayableCard(null)}
              >
                ◀︎キャンセル
              </button>
              <div className="flex justify-end mt-6 pr-40">
                <button
                  className="btn-select relative top-1 left-20"
                  onClick={handlePlayableCardConfirm}
                >
                  選択 
                </button>
              </div>
            </article>
          )}
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
                  <>
                    {(() => {
                      console.log("Rendering left CardSelection with:", currentChoices[0], currentChoices[1]);
                      return null;
                    })()}
                    <CardSelection
                      card1={currentChoices[0]}
                      card2={currentChoices[1]}
                      onSelect={() => handleCardSelect(currentChoices[0], currentChoices[1])}
                    />
                  </>
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
                  <>
                    {(() => {
                      console.log("Rendering right CardSelection with:", currentChoices[2], currentChoices[3]);
                      return null;
                    })()}
                    <CardSelection
                      card1={currentChoices[2]}
                      card2={currentChoices[3]}
                      onSelect={() => handleCardSelect(currentChoices[2], currentChoices[3])}
                    />
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">デッキ構築完了！</h2>
              <p className="mb-4">選択したカードでデッキが完成しました。</p>
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