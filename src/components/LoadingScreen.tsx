import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  progress: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'linear-gradient(135deg, #fbeee6 0%, #f7d6e0 40%, #d6f7f0 80%, #e6e6fb 100%)'
      }}
    >
      <div className="p-8 rounded-3xl shadow-2xl text-center max-w-md w-full mx-4"
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '3px solid #f7d6e0',
          boxShadow: '0 8px 32px 0 rgba(150, 120, 200, 0.15)'
        }}
      >
        <h2 className="text-2xl font-bold mb-4" style={{color: '#c49ac7', letterSpacing: '0.1em'}}>幼女集合中...</h2>
        <div className="w-full rounded-full h-4 mb-4"
          style={{background: '#fbeee6', border: '1.5px solid #e6e6fb'}}
        >
          <div
            className="h-4 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #f7d6e0 0%, #d6f7f0 100%)'
            }}
          />
        </div>
        <p className="text-sm" style={{color: '#a88fc7'}}>
          {progress === 100 ? '準備完了！' : 'カードデータを読み込んでいます...'}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen; 