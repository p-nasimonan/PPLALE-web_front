'use client';

import React from 'react';

/**
 * @JSDoc
 * @description タブボタンのタブ定義
 * @property {string} key - タブの一意なキー
 * @property {string} label - タブに表示されるラベル
 */
export interface TabDefinition {
  key: string;
  label: string;
}

/**
 * @JSDoc
 * @description TabButtonsコンポーネントのProps
 * @property {TabDefinition[]} tabs - 表示するタブの定義配列
 * @property {string} activeTabKey - 現在アクティブなタブのキー
 * @property {(tabKey: string) => void} onTabClick - タブがクリックされたときのコールバック関数
 * @property {'default' | 'cardList'} [variant='default'] - タブのスタイルバリアント
 */
interface TabButtonsProps {
  tabs: TabDefinition[];
  activeTabKey: string;
  onTabClick: (tabKey: string) => void;
  variant?: 'default' | 'cardList';
}

/**
 * @JSDoc
 * @description 汎用的なタブボタンコンポーネント
 * @param {TabButtonsProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} タブボタンコンポーネント
 */
const TabButtons: React.FC<TabButtonsProps> = ({
  tabs,
  activeTabKey,
  onTabClick,
  variant = 'default',
}) => {

  const getButtonColor = (tabKey: string) => {
    if (tabKey === 'yojo') {
      return 'yojo-deck-color';
    } else if (tabKey === 'sweet') {
      return 'sweet-deck-color';
    } else if (tabKey === 'playable') {
      return 'playable-deck-color';
    }
    return 'deck-color';
  };

  const getButtonClassName = (tabKey: string) => {
    const isActive = tabKey === activeTabKey;
    if (variant === 'cardList') {
      return `px-4 py-2 rounded-t-md text-sm font-medium 
              ${isActive 
                ? `yojo-deck-border-color border-b-transparent border-2 ${getButtonColor(tabKey)}` 
                : `border-transparent text-gray-500 hover:text-gray-700`}
              `;
    }
    // default variant (DeckList用)
    return `px-4 py-2 rounded ${isActive ? 'bg-blue-500 text-white' : 'lgiht-color'}`;
  };


  return (
    <div className={`flex `}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabClick(tab.key)}
          className={`${getButtonClassName(tab.key)} `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabButtons; 