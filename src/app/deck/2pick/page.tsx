/**
 * 2Pickモードのメインページコンポーネント
 * 
 * カードの選択からデッキ構築までの全プロセスを管理し、各フェーズに応じた
 * コンポーネントを表示します。
 * 
 * @packageDocumentation
 */

'use client';

import React, { useState, useEffect, useCallback} from 'react'; 
import { useForm } from 'react-hook-form';
import { CardInfo, CardType, FruitType } from '@/types/card';
import { allYojoCards, allSweetCards, allPlayableCards } from '@/data/cards';
import { useSettings } from "../../SideMenuProvider";
import ExportPopup from '@/components/ExportPopup';
import { useAuth } from '@/lib/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// 分割したコンポーネントをインポート
import FruitVersionSelection from './components/FruitVersionSelection';
import PlayableCardPreview from './components/PlayableCardPreview';
import DeckCardSelection from './components/DeckCardSelection';
import PlayableCardFinalSelection from './components/PlayableCardFinalSelection';
import TwoPickResult from './components/TwoPickResult';
import DeckViewPopup from './components/DeckViewPopup';

/**
 * 2Pickモードのメインページコンポーネント
 * 
 * @returns {JSX.Element} 2Pickページ
 */
export default function TwoPick() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isTwoCardLimit: defaultIsTwoCardLimit } = useSettings();
  const isTwoCardLimitParam = searchParams.get('twoCardLimit');
  const isTwoCardLimit = isTwoCardLimitParam !== null
    ? isTwoCardLimitParam === 'true'
    : defaultIsTwoCardLimit;
  const initialFruits = searchParams.get('fruits')?.split(',') || ['いちご'];
  const initialPlayableVersions = searchParams.get('playableVersions')?.split(',') || ['通常'];
  
  // 幼女カード、お菓子カード、プレイアブルカード
  const [yojoCards] = useState<CardInfo[]>(allYojoCards);
  const [sweetCards] = useState<CardInfo[]>(allSweetCards);
  const [playableCards] = useState<CardInfo[]>(allPlayableCards);
  
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
      fruits: initialFruits as FruitType[],
      playableVersions: initialPlayableVersions,
    },
  });

  const selectedFruits = watch('fruits');
  const selectedPlayableVersions = watch('playableVersions');
  const [selectedPlayableCard, setSelectedPlayableCard] = useState<CardInfo | null>(null);
  const [isCardDisappearing, setIsCardDisappearing] = useState(false);

  const [selectionPhase, setSelectionPhase] = useState<'fruitSelection' | 'playablePreview' | 'CardSelection' | 'playableSelection' | 'end'>('fruitSelection');

  const [playableChoices, setPlayableChoices] = useState<CardInfo[]>([]);

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
    if (selectionPhase === 'CardSelection') {
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
        {/* フルーツとバージョン選択画面 */}
        {selectionPhase === 'fruitSelection' && (
          <FruitVersionSelection
            control={control}
            handleSubmit={handleSubmit}
            selectedFruits={selectedFruits}
            selectedPlayableVersions={selectedPlayableVersions}
            onSubmit={handleFruitSelectionSubmit}
          />
        )}

        {/* プレイアブルカードプレビュー画面 */}
        {selectionPhase === 'playablePreview' && (
          <PlayableCardPreview
            playableChoices={playableChoices}
            onCardClick={setSelectedPlayableCard}
            onSubmit={handlePlayablePreviewSubmit}
          />
        )}

        {/* カード選択画面 */}
        {selectionPhase === 'CardSelection' && (
          <DeckCardSelection
            currentChoices={currentChoices}
            onSelect={handleCardSelect}
            round={round}
            currentPhase={currentPhase}
            onShowDeckClick={showDeck}
            maxYojoRound={10}
            maxSweetRound={5}
          />
        )}

        {/* プレイアブルカード最終選択画面 */}
        {selectionPhase === 'playableSelection' && (
          <PlayableCardFinalSelection
            playableChoices={playableChoices}
            selectedPlayableCard={selectedPlayableCard}
            onCardClick={setSelectedPlayableCard}
            isCardDisappearing={isCardDisappearing}
            onConfirm={handlePlayableCardConfirm}
            onBack={() => setSelectedPlayableCard(null)}
          />
        )}

        {/* 結果表示画面 */}
        {selectionPhase === 'end' && (
          <TwoPickResult
            yojoDeck={yojoDeck}
            sweetDeck={sweetDeck}
            playableCard={selectedPlayableCard}
            user={user}
            onExport={() => setShowExportPopup(true)}
            onSave={handleSaveDeck}
            onShowDeck={showDeck}
          />
        )}

        {/* デッキ確認ポップアップ */}
      {isShowDeck && (
          <DeckViewPopup
            yojoDeck={yojoDeck}
            sweetDeck={sweetDeck}
            selectedPlayableCard={selectedPlayableCard}
            onClose={showDeck}
          />
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