"use client";

import { Phase } from "@prisma/client";
import { PHASE_TASK_HEIGHT, DATE_HEIGHT, PHASE_WIDTH } from "@/constants/scheduleLayout"

type PhaseListProps = {
  phases: Phase[];
};

export function PhaseList({ phases }: PhaseListProps) {
  return (
    <div
      className="overflow-hidden border-r border-gray-300 bg-gray-50"
      style={{ width: PHASE_WIDTH }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center justify-center border-b border-gray-300 text-sm font-semibold bg-white sticky top-0 z-10"
        style={{ height: DATE_HEIGHT }}
      >
        フェーズ
      </div>

      {/* 各フェーズを縦に表示 */}
      {phases.map((phase) => (
        <div
          key={phase.id}
          className="flex items-center px-4 border-b border-gray-200 text-sm text-gray-800"
          style={{ height: PHASE_TASK_HEIGHT }}
        >
          {phase.name}
        </div>
      ))}
    </div>
  );
}
