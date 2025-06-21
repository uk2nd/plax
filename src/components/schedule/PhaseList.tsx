"use client";

import { Phase } from "@prisma/client";

type PhaseListProps = {
  phases: Phase[];
};

export function PhaseList({ phases }: PhaseListProps) {
  return (
    <div
      className="w-[300px] h-[90vh] overflow-hidden border-r border-gray-300 bg-gray-50"
    >
      {/* ヘッダー */}
      <div className="h-[45px] flex items-center justify-center border-b border-gray-300 text-sm font-semibold bg-white sticky top-0 z-10">
        フェーズ
      </div>

      {/* 各フェーズを縦に表示 */}
      {phases.map((phase) => (
        <div
          key={phase.id}
          className="h-[50px] flex items-center px-4 border-b border-gray-200 text-sm text-gray-800"
        >
          {phase.name}
        </div>
      ))}
    </div>
  );
}
