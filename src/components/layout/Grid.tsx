"use client";

import { useGrid } from "@/src/contexts/GridContext";

export const Grid = () => {
  const { isGridVisible, toggle } = useGrid();

  if (!isGridVisible) {
    return (
      <div className="w-8 border-r border-gray-200 flex flex-col h-full bg-white">
        <div className="flex justify-center p-2">
          <button onClick={toggle} className="text-gray-600 hover:text-gray-800 p-1">
            ＞
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-[400px] border-r border-gray-200 flex flex-col h-full bg-white">
      <div className="flex justify-end p-2">
        <button onClick={toggle} className="text-gray-600 hover:text-gray-800">
          ＜
        </button>
      </div>

      {/* グリッド本体（スクロール可能エリア） */}
      <div className="flex-1 overflow-auto p-4">
        {/* 仮のコンテンツ */}
        <div className="space-y-4">
          <p className="text-sm text-gray-400">ここにExcel風のグリッドが表示されます</p>
          <div className="h-[1000px] border border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50">
            スクロール確認用の長いスペース
          </div>
        </div>
      </div>
    </div>
  );
};