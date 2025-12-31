"use client";

import { useGridStore } from "@/src/stores/gridStore";
import { MilestoneTable } from "@/src/components/tables/MilestoneTable";
import { LaneTable } from "@/src/components/tables/LaneTable";

export const Grid = () => {
  const { isGridVisible, toggle } = useGridStore();

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
        <div className="space-y-6">
          {/* マイルストーンテーブル */}
          <div>
            <MilestoneTable />
          </div>

          {/* プロジェクトレーンテーブル */}
          <div>
            <LaneTable />
          </div>

          {/* ショートカットキーの説明 */}
          <div className="mt-4 text-xs text-gray-600 px-2 border-t pt-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Ctrl + Enter: 下に行を追加</li>
              <li>Ctrl + Shift + K: 行を削除</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};