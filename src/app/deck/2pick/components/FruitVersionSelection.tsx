/**
 * フルーツとプレイアブルカードバージョン選択コンポーネント
 * 
 * 2Pickモードでプレイするフルーツとプレイアブルカードのバージョンを選択する機能を提供します。
 * 
 * @packageDocumentation
 */

'use client';

import React from 'react';
import { Controller, Control, UseFormHandleSubmit, ControllerRenderProps } from 'react-hook-form';
import { FruitType } from '@/types/card';
import Image from 'next/image';

/**
 * フルーツとバージョン選択コンポーネントのProps
 * 
 * @interface
 * @property {Control<FormData>} control - react-hook-formのコントロール
 * @property {UseFormHandleSubmit<FormData>} handleSubmit - フォーム送信ハンドラ
 * @property {FruitType[]} selectedFruits - 選択されているフルーツの配列
 * @property {string[]} selectedPlayableVersions - 選択されているプレイアブルカードのバージョンの配列
 * @property {() => void} onSubmit - フォーム送信時のコールバック関数
 */
interface FruitVersionSelectionProps {
  /** react-hook-formのコントロール */
  control: Control<FormData>;
  /** フォーム送信ハンドラ */
  handleSubmit: UseFormHandleSubmit<FormData>;
  /** 選択されているフルーツの配列 */
  selectedFruits: FruitType[];
  /** 選択されているプレイアブルカードのバージョンの配列 */
  selectedPlayableVersions: string[];
  /** フォーム送信時のコールバック関数 */
  onSubmit: () => void;
}

/** フォームデータの型定義 */
interface FormData {
  /** 選択されたフルーツの配列 */
  fruits: FruitType[];
  /** 選択されたプレイアブルカードのバージョンの配列 */
  playableVersions: string[];
}

/**
 * フルーツとバージョン選択コンポーネント
 * 
 * @param {FruitVersionSelectionProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} フルーツとバージョン選択画面
 */
const FruitVersionSelection: React.FC<FruitVersionSelectionProps> = ({
  control,
  handleSubmit,
  selectedFruits,
  selectedPlayableVersions,
  onSubmit,
}) => {
  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-xl font-bold mb-8">カードのフルーツを選択してください</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 w-full max-w-4xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(['いちご', 'ぶどう', 'めろん', 'おれんじ'] as FruitType[]).map(fruit => (
            <Controller
              key={fruit}
              name="fruits"
              control={control}
              render={({ field }: { field: ControllerRenderProps<FormData, 'fruits'> }) => (
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
                    <div className="w-full h-32 relative" style={{ backgroundColor: fruit === 'いちご' ? '#9B4341' : fruit === 'ぶどう' ? '#6E25AB' : fruit === 'めろん' ? '#40923D' : '#E5872C' }}>
                      <Image
                        src="/pupu_game.webp"
                        alt="background"
                        width={500}
                        height={281}
                        className="w-full h-full object-cover"
                      />
                    </div>
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
              render={({ field }: { field: ControllerRenderProps<FormData, 'playableVersions'> }) => (
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
                      src={`/images/versions/${version}.webp`}
                      alt={version}
                      className="w-full h-48 object-cover"
                      width={200}
                      height={200}
                      priority
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
  );
};

export default FruitVersionSelection;