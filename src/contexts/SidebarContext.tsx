"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// サイドバーの表示状態を管理するコンテキスト
interface SidebarContextType {
  isSidebarVisible: boolean;
  toggle: () => void; // void：関数が何も値を返さないことを示す型
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// プロバイダーコンポーネント
interface SidebarProviderProps {
  children: ReactNode; // ReactNode：Reactの子要素として有効なすべての型
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggle = () => {
    setIsSidebarVisible(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarVisible, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};

// カスタムフック
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};