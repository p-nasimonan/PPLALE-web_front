'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type DarkModeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  // 初期値をnullに設定し、初期化前の状態を表現
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    // ローカルストレージからダークモードの設定を読み込む
    const savedMode = localStorage.getItem('darkMode');
    setIsDarkMode(savedMode === 'true');
  }, []);

  useEffect(() => {
    // isDarkModeがnullの場合は何もしない（初期化前）
    if (isDarkMode === null) return;

    // ダークモードの状態が変更されたときにクラスを更新
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // 設定をローカルストレージに保存
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    // ダークモードの状態をトグルする
    setIsDarkMode(prev => !prev);
    // ローカルストレージに保存
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  // 初期化前は何も表示しない
  if (isDarkMode === null) {
    return null;
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}
