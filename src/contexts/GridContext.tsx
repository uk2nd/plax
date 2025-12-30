"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// サイドバーの表示状態を管理するコンテキスト
interface GridContextType {
  isGridVisible: boolean;
  toggle: () => void; // void：関数が何も値を返さないことを示す型
}

const GridContext = createContext<GridContextType | undefined>(undefined);

// プロバイダーコンポーネント
interface GridProviderProps {
  children: ReactNode; // ReactNode：Reactの子要素として有効なすべての型
}

export const GridProvider: React.FC<GridProviderProps> = ({ children }) => {
  const [isGridVisible, setIsGridVisible] = useState(true);

  const toggle = () => {
    setIsGridVisible(prev => !prev);
  };

  return (
    <GridContext.Provider value={{ isGridVisible, toggle }}>
      {children}
    </GridContext.Provider>
  );
};

// カスタムフック
export const useGrid = () => {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error('useGrid must be used within a GridProvider');
  }
  return context;
};