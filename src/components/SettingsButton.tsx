'use client';

import React from 'react';
import { useSettings } from '@/app/SettingsProvider';
import { useDarkMode } from '@/app/DarkModeProvider';

export default function SettingsButton() {
  const { 
    showSettings, 
    setShowSettings,
    isTwoCardLimit,
    setIsTwoCardLimit
  } = useSettings();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="relative">
      <button
        className="btn-settings"
        onClick={() => setShowSettings(!showSettings)}
      >
        ⚙️
      </button>
      {showSettings && (
        <article className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            {/* ダークモード設定 */}
            <div className="flex items-center justify-between">
              <button
                onClick={toggleDarkMode}
                className="reverse-color text-lg"
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>
            </div>

            {/* 2枚制限設定 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="twoCardLimit"
                checked={isTwoCardLimit}
                onChange={(e) => setIsTwoCardLimit(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <label htmlFor="twoCardLimit" className="text-sm">
                2枚制限
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isTwoCardLimit ? "同じカードは最大2枚まで" : "同じカードを何枚でも追加可能"}
            </p>
          </div>
        </article>
      )}
    </div>
  );
} 