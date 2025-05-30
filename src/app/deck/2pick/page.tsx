'use client';

import React, { useState, useEffect, useCallback} from 'react'; 
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import { CardInfo, CardType, FruitType } from '@/types/card';
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards'; // 通常構築のデータをインポート
import { useSettings } from "../../SideMenuProvider";
import Deck from '@/components/Deck';
import CardSelection from './components/CardSelection';
import ExportPopup from '@/components/ExportPopup';
import Card from '@/components/Card';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import ShareButtons from '@/components/ShareButtons';

export default function TwoPick() {
  const { user } = useAuth();
  const router = useRouter();
  const { isTwoCardLimit } = useSettings();
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

  const [isShowDeck, setIsShowDeck] = useState(false); // デッキ確認ポップアップの表示状態
  const [round, setRound] = useState(1); // 現在のラウンド
  const [showExportPopup, setShowExportPopup] = useState(false);

  const { control, handleSubmit, watch } = useForm<{ fruits: FruitType[]; playableVersions: string[] }>({
    defaultValues: {
      fruits: ['いちご'], // 初期選択を1つに変更
      playableVersions: ['通常'], // 初期選択を1つに変更
    },
  });

  const selectedFruits = watch('fruits');
  const selectedPlayableVersions = watch('playableVersions');
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
    if (selectedFruits.length === 0 || selectedPlayableVersions.length === 0) {
      return; // 最低1つ以上の選択が必要
    }
    setYojoDeck([]);
    setSweetDeck([]);
    updatePlayableChoices();
    setSelectionPhase('playablePreview');
    setSelectedPlayableCard(null);
    setRound(1);
    setIsShowDeck(false);
  };

  // プレイアブル確認フェーズでの次へボタン処理
  const handlePlayablePreviewSubmit = () => {
    setSelectionPhase('CardSelection'); // カード選択へ
    setCurrentPhase('幼女'); // 初期は幼女カードから選択
    setSelectedPlayableCard(null); // 拡大表示を解除
  };

  // デッキを保存する関数
  const handleSaveDeck = async () => {
    if (!user) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          // ログイン成功後、デッキを保存
          const deckId = Date.now().toString();
          
          // まずローカルストレージに保存
          localStorage.setItem(`deck_${deckId}_name`, '2pickデッキ');
          localStorage.setItem(`deck_${deckId}_yojo`, JSON.stringify(yojoDeck));
          localStorage.setItem(`deck_${deckId}_sweet`, JSON.stringify(sweetDeck));
          localStorage.setItem(`deck_${deckId}_playable`, JSON.stringify(selectedPlayableCard));

          // Firebaseに保存
          const deckRef = doc(db, 'users', result.user.uid, 'decks', deckId);
          await setDoc(deckRef, {
            name: '無名の2pickデッキ',
            yojoDeckIds: yojoDeck.map(card => card.id),
            sweetDeckIds: sweetDeck.map(card => card.id),
            playableCardId: selectedPlayableCard?.id || null,
            updatedAt: new Date(),
            is2pick: true
          });

          // 保存が完了したことを確認
          const savedDeck = await getDoc(deckRef);
          if (!savedDeck.exists()) {
            throw new Error('デッキの保存に失敗しました');
          }

          // 保存成功後、デッキページに遷移
          router.push(`/deck/${result.user.uid}/${deckId}`);
        }
      } catch (error) {
        console.error('ログインエラー:', error);
        alert('ログインに失敗しました');
      }
      return;
    }

    try {
      const deckId = Date.now().toString();
      
      // まずローカルストレージに保存
      localStorage.setItem(`deck_${deckId}_name`, '2pickデッキ');
      localStorage.setItem(`deck_${deckId}_yojo`, JSON.stringify(yojoDeck));
      localStorage.setItem(`deck_${deckId}_sweet`, JSON.stringify(sweetDeck));
      localStorage.setItem(`deck_${deckId}_playable`, JSON.stringify(selectedPlayableCard));

      // Firebaseに保存
      const deckRef = doc(db, 'users', user.uid, 'decks', deckId);
      await setDoc(deckRef, {
        name: '無名の2pickデッキ',
        yojoDeckIds: yojoDeck.map(card => card.id),
        sweetDeckIds: sweetDeck.map(card => card.id),
        playableCardId: selectedPlayableCard?.id || null,
        updatedAt: new Date(),
        is2pick: true
      });

      // 保存が完了したことを確認
      const savedDeck = await getDoc(deckRef);
      if (!savedDeck.exists()) {
        throw new Error('デッキの保存に失敗しました');
      }

      // 保存成功後、デッキページに遷移
      router.push(`/deck/${user.uid}/${deckId}`);
    } catch (error) {
      console.error('デッキの保存に失敗しました:', error);
      if (error instanceof Error) {
        console.error('エラーの詳細:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      alert(`デッキの保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  return (
  <div>
    <div className={showExportPopup ? 'blur-sm ' : '"container relative"'}>
      {selectionPhase === 'fruitSelection' ? (
        <div className="flex flex-col items-center mt-8">
          <h2 className="text-xl font-bold mb-8">カードのフルーツを選択してください</h2>
          <form
            onSubmit={handleSubmit(handleFruitSelectionSubmit)}
            className="space-y-8 w-full max-w-4xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(['いちご', 'ぶどう', 'めろん', 'おれんじ'] as FruitType[]).map(fruit => (
                <Controller
                  key={fruit}
                  name="fruits"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<{ fruits: FruitType[]; playableVersions: string[] }, 'fruits'> }) => (
                    <label className="relative cursor-pointer group">
                      <input
                        type="checkbox"
                        value={fruit}
                        checked={field.value.includes(fruit)}
                        onChange={e => {
                          const newValue = e.target.checked
                            ? [...field.value, fruit]
                            : field.value.length > 1 // 最低1つは残す
                              ? field.value.filter(f => f !== fruit)
                              : field.value;
                          field.onChange(newValue);
                        }}
                        className="hidden"
                      />
                      <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                        field.value.includes(fruit) ? 'ring-4 ring-special' : 'ring-2 ring-gray-200'
                      }`}>
                        <Image
                          src={`/images/fruits/${fruit}.png`}
                          alt={fruit}
                          width={200}
                          height={200}
                          className="w-full h-32 object-cover"
                        />
                        {field.value.includes(fruit) && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-12 h-12 bg-special rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-center mt-2 font-medium">{fruit}</p>
                    </label>
                  )}
                />
              ))}
            </div>

            <h2 className="text-xl font-bold mb-8 mt-12">プレイアブルカードのバージョンを選択してください</h2>
            <div className="grid grid-cols-2 gap-6">
              {(['通常', 'β'] as string[]).map(version => (
                <Controller
                  key={version}
                  name="playableVersions"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<{ fruits: FruitType[]; playableVersions: string[] }, 'playableVersions'> }) => (
                    <label className="relative cursor-pointer group">
                      <input
                        type="checkbox"
                        value={version}
                        checked={field.value.includes(version)}
                        onChange={e => {
                          const newValue = e.target.checked
                            ? [...field.value, version]
                            : field.value.length > 1 // 最低1つは残す
                              ? field.value.filter(v => v !== version)
                              : field.value;
                          field.onChange(newValue);
                        }}
                        className="hidden"
                      />
                      <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                        field.value.includes(version) ? 'ring-4 ring-special' : 'ring-2 ring-gray-200'
                      }`}>
                        <Image
                          src={`/images/versions/${version}.png`}
                          alt={version}
                          className="w-full h-48 object-cover"
                          width={200}
                          height={200}
                        />
                        {field.value.includes(version) && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-12 h-12 bg-special rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-center mt-2 font-medium">{version}</p>
                    </label>
                  )}
                />
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <button 
                type="submit" 
                className={`btn-primary text-lg px-8 py-3 ${
                  selectedFruits.length === 0 || selectedPlayableVersions.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                disabled={selectedFruits.length === 0 || selectedPlayableVersions.length === 0}
              >
                次へ
              </button>
            </div>
          </form>
        </div>
      ) : selectionPhase === 'playablePreview' ? (
        <div className="flex flex-col items-center mt-8">
          <h2 className="text-xl font-bold mb-4">プレイアブルカードを確認してください</h2>
          <div className="grid grid-cols-3 gap-4 w-full max-w-6xl mx-auto place-items-center">
            {playableChoices.map(card => (
              <Card
                key={card.id}
                card={card}
                onClick={() => setSelectedPlayableCard(card)}
                sizes={{
                  base: { width: 140, height: 210 },
                  sm: { width: 200, height: 300 },
                  md: { width: 280, height: 420 },
                  lg: { width: 300, height: 450 }
                }}
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
            <div className="flex justify-between items-center">

              {/* 左側のカード選択 */}
              {currentChoices.length >= 2 && (
                <>
                  {(() => {
                    return null;
                  })()}
                  <CardSelection
                    cards={[currentChoices[0],currentChoices[1]]}
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
                    cards={[currentChoices[2],currentChoices[3]]}
                    onSelect={() => handleCardSelect(currentChoices[2], currentChoices[3])}
                  />
                </>
              )}
            </div>
          </>
        </div>
      ) : selectionPhase === 'playableSelection' ? (
        <div className="mt-4 flex flex-col items-center ">
          <h2 className="text-xl font-bold mb-4 text-center">プレイアブルカードを選択してください</h2>
          {!selectedPlayableCard && (
            <div>
              <div className="flex gap-4">
                {playableChoices.map(card => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => setSelectedPlayableCard(card)}
                    sizes={{
                      base: { width: 140, height: 210 },
                      sm: { width: 200, height: 300 },
                      md: { width: 280, height: 420 },
                      lg: { width: 300, height: 450 }
                    }}
                    canShowDetail={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* スライド表示されたカード */}
          {selectedPlayableCard && (
              <div className="relative w-full max-w-4xl mx-auto p-4">
                <div className={`flex flex-col  items-center justify-center gap-6 w-full transform-slide ${
                  isCardDisappearing ? 'animate-disappear' : ''
                }`}>
                  <div className="w-full lg:w-1/2 flex justify-center">
                    <Card
                      card={selectedPlayableCard}
                      sizes={{
                        base: { width: 200, height: 300 },
                        sm: { width: 250, height: 375 },
                        md: { width: 300, height: 450 },
                        lg: { width: 500, height: 750 }
                      }}
                      canShowDetail={false}
                    />
                  </div>
                  <div className="w-full h-auto overflow-auto p-4 rounded-lg">
                    {selectedPlayableCard.description && (
                      <div className="mt-4">
                        <p className="text-lg font-semibold mt-1 whitespace-pre-line">{selectedPlayableCard.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                <button
                      className="btn-select absolute bottom-40 right-0"
                      onClick={handlePlayableCardConfirm}
                    >
                      選択
                </button>
                <button
                  className="btn-secondary absolute top-0 left-0"
                  onClick={() => setSelectedPlayableCard(null)}
                >
                  ◀︎戻る
                </button>
              </div>
          )}
        </div>
      ) : (
        <div className="text-center relative">
          <div className="absolute top-0 right-20">
            <ShareButtons
              share_url={window.location.href}
              share_text="2pickでデッキを作成しました！"
              isLocal={true}
              yojoDeck={yojoDeck}
              sweetDeck={sweetDeck}
              playableCard={selectedPlayableCard}
            />
          </div>
          <h2 className="text-2xl font-bold mb-4">デッキ構築完了！</h2>
          <p className="mb-4">選択したカードでデッキが完成しました。</p>
          <div className="flex justify-center gap-4 mb-4">
            <button
              className="btn-export"
              onClick={() => setShowExportPopup(true)}
            >
              エクスポート
            </button>
            {user?.uid === 'local' && (
              <button
                className="btn-primary"
                onClick={handleSaveDeck}
              >
                デッキを保存
              </button>
            )}
          </div>
          <div className="flex justify-center">
            <button
              className="btn-secondary"
              onClick={() => showDeck()}
            >
              デッキ確認
            </button>
          </div>
        </div>
      )}
      {/* デッキ確認ポップアップ */}
      {isShowDeck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">デッキ確認</h2>
            {/* 3つのデッキを同時に表示 */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 左側：幼女デッキ */}
              <div className="w-full lg:w-1/2">
                <Deck
                  cards={yojoDeck}
                  type="幼女"
                  readOnly={true}
                  showDuplicates={false}
                />
              </div>

              {/* 右側：お菓子デッキとプレイアブルカード */}
              <div className="flex flex-col gap-4 w-full lg:w-1/2">
                <Deck
                  cards={sweetDeck}
                  type="お菓子"
                  readOnly={true}
                  showDuplicates={false}
                />

                <Deck
                  cards={[selectedPlayableCard || null].filter(Boolean) as CardInfo[]}
                  type="プレイアブル"
                  readOnly={true}
                  showDuplicates={false}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="btn-primary"
                onClick={showDeck}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

          {/* エクスポートポップアップ */}
          {showExportPopup && (
        <ExportPopup
          yojoDeck={yojoDeck}
          sweetDeck={sweetDeck}
          playableCard={selectedPlayableCard}
          onClose={() => setShowExportPopup(false)}
        />
      )}

  </div>
  );
}