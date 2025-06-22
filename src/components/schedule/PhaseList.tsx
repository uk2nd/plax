"use client";

import { PHASE_TASK_HEIGHT, DATE_HEIGHT, PHASE_WIDTH } from "@/constants/scheduleLayout"
import { Phase } from "@prisma/client"
import PhaseMenu from "@/components/phase/PhaseMenu"
import CreatePhase from "@/components/phase/CreatePhase"

type PhaseListProps = {
  phases: Phase[];
  projectId: string;
};

export function PhaseList({ phases, projectId }: PhaseListProps) {
  return (
    <div
      className="overflow-hidden border-r border-gray-300 bg-gray-50"
      style={{ width: PHASE_WIDTH }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-2 border-b border-gray-300 text-sm font-semibold bg-white sticky top-0 z-10"
        style={{ height: DATE_HEIGHT }}
      >
        <span>フェーズ</span>
        <CreatePhase projectId={projectId} />
      </div>

      {/* 各フェーズを縦に表示 */}
      {phases.length === 0 ? (
        <div className="px-2 py-4 text-sm text-gray-500">
          フェーズがまだ作成されていません
        </div>
      ) : (
        phases.map((phase) => (
          <div
            key={phase.id}
            className="flex items-center justify-between px-2 border-b border-gray-200 text-sm text-gray-800"
            style={{ height: PHASE_TASK_HEIGHT }}
          >
            <span className="truncate">{phase.name}</span>
            <PhaseMenu phaseId={phase.id} phaseName={phase.name} />
          </div>
        ))
      )}
    </div>
  );
}
