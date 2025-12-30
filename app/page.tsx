"use client";

import { Sidebar } from "@/src/components/layout/Sidebar";
import { Grid } from "@/src/components/layout/Grid";
import { Preview } from "@/src/components/layout/Preview";
import { SidebarProvider, useSidebar } from "@/src/contexts/SidebarContext";
import { GridProvider, useGrid } from "@/src/contexts/GridContext";

const MainLayout = () => {
  return (
    // h-screen: 画面の高さいっぱいに広げる
    // overflow-hidden: 画面全体のスクロールを禁止（各ペインの中でスクロールさせるため）
    <main className="flex h-screen w-full overflow-hidden bg-white text-slate-800">
      {/* 1. サイドバー */}
      <Sidebar />

      {/* 2. 入力グリッド */}
      <Grid />

      {/* 3. チャートプレビュー */}
      <Preview />
    </main>
  );
};

export default function Home() {
  return (
    <SidebarProvider>
      <GridProvider>
        <MainLayout />
      </GridProvider>
    </SidebarProvider>
  );
}