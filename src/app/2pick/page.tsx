'use client';

import React, { useState, useEffect, useCallback} from 'react'; 
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import { CardInfo, CardType, FruitType } from '@/types/card';
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards'; // 通常構築のデータをインポート
import Link from 'next/link';
import { useSettings } from "../SettingsProvider";
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

  const { isTwoCardLimit } = useSettings();
  
  const [isShowDeck, setIsShowDeck] = useState(false); // デッキ確認ポップアップの表示状態
  const [round, setRound] = useState(1); // 現在のラウンド
  const [showExportPopup, setShowExportPopup] = useState(false);

  const { control, handleSubmit, watch } = useForm<{ fruits: FruitType[]; playableVersions: string[] }>({
    defaultValues: {
      fruits: ['いちご', 'ぶどう'], // 初期選択
      playableVersions: ['通常', 'β'], // プレイアブルカードの初期選択
    },
  });

  const selectedFruits = watch('fruits'); // フルーツ選択の監視
  const selectedPlayableVersions = watch('playableVersions'); // プレイアブルバージョン選択の監視
  const [selectedPlayableCard, setSelectedPlayableCard] = useState<CardInfo | null>(null); // 選択されたプレイアブルカード
  const [isCardDisappearing, setIsCardDisappearing] = useState(false); // カードが消えるアニメーションの状態

  const [selectionPhase, setSelectionPhase] = useState<'fruitSelection' | 'playablePreview' | 'CardSelection' | 'playableSelection' | 'end'>('fruitSelection'); // 選択フェーズ

  const [playableChoices, setPlayableChoices] = useState<CardInfo[]>([]); // プレイアブルカードの選択肢を保持

  // 選択肢を更新する関数
  const updateChoices = useCallback(() => {
    const availableCards =
      currentPhase === '幼女'
        ? yojoCards.filter(card => selectedFruits.includes(card.fruit))
        : sweetCards.filter(card => selectedFruits.includes(card.fruit));

    // 2枚制限が有効な場合、すでに2枚選択されているカードを除外
    const filteredCards = isTwoCardLimit
      ? availableCards.filter(card => {
          const cardCount = currentPhase === '幼女'
            ? yojoDeck.filter(c => c.id === card.id).length
            : sweetDeck.filter(c => c.id === card.id).length;
          return cardCount < 2;
        })
      : availableCards;

    // 動物さんソーダタイプのカードが1枚しか追加できないように制限
    const filteredSweetCards = currentPhase === 'お菓子'
      ? filteredCards.filter(card => {
          if (card.sweetType === '動物さんソーダ') {
            // 既にデッキに含まれている動物さんソーダの種類を取得
            const existingAnimalSodas = new Set(sweetDeck
              .filter(c => c.sweetType === '動物さんソーダ')
              .map(c => c.id));
            // 現在のカードが既にデッキに含まれている場合は除外
            return !existingAnimalSodas.has(card.id);
          }
          return true;
        })
      : filteredCards;

    const shuffled = [...filteredSweetCards].sort(() => Math.random() - 0.5);
    setCurrentChoices(shuffled.slice(0, 4));
  }, [yojoCards, sweetCards, currentPhase, selectedFruits, isTwoCardLimit, yojoDeck, sweetDeck]);

  // プレイアブルカード選択肢を更新する関数
  const updatePlayableChoices = useCallback(() => {
    const filteredPlayableCards = playableCards.filter(card =>
      card.version && selectedPlayableVersions.includes(card.version)
    );
    const shuffled = [...filteredPlayableCards].sort(() => Math.random() - 0.5);
    setPlayableChoices(shuffled.slice(0, 3)); // ランダムに3枚選択
  }, [playableCards, selectedPlayableVersions]);

  // ラウンドが変わったときに選択肢を更新
  useEffect(() => {
    if (selectionPhase === 'CardSelection' ) {
      updateChoices();
    }
  }, [currentPhase, updateChoices, selectionPhase]);

  // デッキ確認を消して集中させる場所
  useEffect(() => {
    if (selectionPhase === 'playableSelection' || selectionPhase === 'playablePreview' || selectedPlayableCard) {
      setIsShowDeck(false); // デッキ確認ポップアップを非表示
    }
  }, [selectionPhase, selectedPlayableCard]);

  // 初期化
  useEffect(() => {
    restart();
  }, []);



  // デッキが更新されたときに localStorage に保存
  useEffect(() => {
    localStorage.setItem('yojoDeck', JSON.stringify(yojoDeck));
  }, [yojoDeck]);

  useEffect(() => {
    localStorage.setItem('sweetDeck', JSON.stringify(sweetDeck));
  }, [sweetDeck]);

  useEffect(() => {
    localStorage.setItem('selectedPlayableCard', JSON.stringify(selectedPlayableCard));
  }, [selectedPlayableCard]);

  // カードが選択されたときの処理
  const handleCardSelect = (card1: CardInfo, card2: CardInfo) => {
    if (yojoDeck.length >= 20 && sweetDeck.length >= 10) {
      setSelectionPhase('playableSelection'); // プレイアブルカード選択画面に移行
    }

    if (currentPhase === '幼女' && yojoDeck.length < 20) {
      const newDeck = [...yojoDeck, card1, card2].sort((a, b) => parseInt(a.id) - parseInt(b.id));
      setYojoDeck(newDeck);
      localStorage.setItem('yojoDeck', JSON.stringify(newDeck));
    } else if (currentPhase === 'お菓子' && sweetDeck.length < 10) {
      const newDeck = [...sweetDeck, card1, card2].sort((a, b) => parseInt(a.id) - parseInt(b.id));
      setSweetDeck(newDeck);
      localStorage.setItem('sweetDeck', JSON.stringify(newDeck));
    } 

    setRound(round + 1);
    updateChoices();

    // 20枚選択したらお菓子を選択
    if (currentPhase === '幼女' && round >= 10) {
      setCurrentPhase('お菓子');
      setRound(1);
    } else if (currentPhase === 'お菓子' && round >= 5) {
      setSelectionPhase('playableSelection'); // プレイアブルカード選択画面に移行
    }
  };

  const restart = () => {
    setYojoDeck([]);
    setSweetDeck([]);
    setSelectionPhase('fruitSelection'); // フルーツ選択画面に戻す
    setSelectedPlayableCard(null); // 拡大表示を解除
    setRound(1); // ラウンドをリセット
    setIsShowDeck(false); // デッキ確認ポップアップを非表示
  }

  // プレイアブルカード選択完了処理
  const handlePlayableCardConfirm = () => {
    setIsCardDisappearing(true); // アニメーションを開始
    setTimeout(() => {
      setSelectionPhase('end'); // 終了に移行
      setIsCardDisappearing(false); // アニメーション状態をリセット
    }, 500); // アニメーションの時間に合わせてタイムアウトを設定
  };

  // デッキ確認ボタンの処理
  const showDeck = () => {
    setIsShowDeck(isShowDeck => !isShowDeck);
  };

  // フルーツ選択画面のフォーム送信処理
  const handleFruitSelectionSubmit = () => {
    setYojoDeck([]);
    setSweetDeck([]);
    updatePlayableChoices(); // プレイアブルカード選択肢を更新
    setSelectionPhase('playablePreview'); // プレイアブル確認フェーズに移行
    setSelectedPlayableCard(null); // 拡大表示を解除
    setRound(1); // ラウンドをリセット
    setIsShowDeck(false); // デッキ確認ポップアップを非表示
  };

  // プレイアブル確認フェーズでの次へボタン処理
  const handlePlayablePreviewSubmit = () => {
    setSelectionPhase('CardSelection'); // カード選択へ
    setCurrentPhase('幼女'); // 初期は幼女カードから選択
    setSelectedPlayableCard(null); // 拡大表示を解除
  };

  return (
  <div>
    <div className={showExportPopup ? 'blur-sm ' : '"container relative"'}>
      <header>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-center">2pick デッキ構築</h1>
          <Link href="/" className="text-1xl text-center">
            通常構築に戻る
          </Link>
        </div>
      </header>

      {selectionPhase === 'fruitSelection' ? (
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
                  render={({ field }: { field: ControllerRenderProps<{ fruits: FruitType[]; playableVersions: string[] }, 'fruits'> }) => (
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
            <h2 className="text-xl font-bold mb-4 mt-6">プレイアブルカードのバージョンを選択してください</h2>
            <div className="space-y-2">
              {(['通常', 'β'] as string[]).map(version => (
                <Controller
                  key={version}
                  name="playableVersions"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<{ fruits: FruitType[]; playableVersions: string[] }, 'playableVersions'> }) => (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        value={version}
                        checked={field.value.includes(version)}
                        onChange={e => {
                          const newValue = e.target.checked
                            ? [...field.value, version]
                            : field.value.filter(v => v !== version);
                          field.onChange(newValue);
                        }}
                        className="mr-2"
                      />
                      {version}
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
      ) : selectionPhase === 'playablePreview' ? (
        <div className="flex flex-col items-center mt-8">
          <h2 className="text-xl font-bold mb-4">プレイアブルカードを確認してください</h2>
          <div className="flex gap-4">
            {playableChoices.map(card => (
              <Card
                key={card.id}
                card={card}
                onClick={() => setSelectedPlayableCard(card)}
                width={300}
                height={450}
              />
            ))}
          </div>
          <button onClick={handlePlayablePreviewSubmit} className="btn-primary mt-4">
            次へ
          </button>
        </div>
      ) : selectionPhase === 'CardSelection' ? (  
        <div className="mt-4 flex flex-col items-center">
          <>
            <h2 className="text-xl font-bold mb-4 text-center">
              {round} / {currentPhase === "幼女" ? 10 : 5}: {currentPhase}カードを選択してください
            </h2>
            <div className="flex justify-between w-full max-w-4xl items-center">

              {/* 左側のカード選択 */}
              {currentChoices.length >= 2 && (
                <>
                  {(() => {
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
        </div>
      ) : selectionPhase === 'playableSelection' ? (
        <div className="mt-4 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4 text-center">プレイアブルカードを選択してください</h2>
          {!selectedPlayableCard && (
            <div>
              <div className="flex gap-4">
                {playableChoices.map(card => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => setSelectedPlayableCard(card)}
                    width={300}
                    height={450}
                  />
                ))}
              </div>
            </div>
          )}

          {/* スライド表示されたカード */}
          {selectedPlayableCard && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="relative w-full max-w-4xl mx-auto">
                <div
                  className={`flex items-center justify-center w-full transform-slide ${
                    isCardDisappearing ? 'animate-disappear' : ''
                  }`}
                >
                  <Card
                    card={selectedPlayableCard}
                    width={340}
                    height={500}
                  />
                  <div className="description w-96 h-96 overflow-auto p-4 bg-gray-100 rounded-lg ml-4">
                    {selectedPlayableCard.description && (
                      <div className="mt-4">
                      <p className="text-lg font-semibold text-gray-800 mt-1 whitespace-pre-line">{selectedPlayableCard.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between mt-8 px-20">
                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedPlayableCard(null)}
                  >
                    ◀︎キャンセル
                  </button>
                  <button
                    className="btn-select"
                    onClick={handlePlayableCardConfirm}
                  >
                    選択
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
      {/* デッキ確認 */}
      {isShowDeck && (
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-2 mt-2">
            {selectedPlayableCard && (
              <div className="flex justify-center">
                
                <Card
                  card={selectedPlayableCard}
                  width={340}
                  height={500}
                />
              </div>
            )}
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