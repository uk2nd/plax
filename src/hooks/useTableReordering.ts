import { useState } from "react";

interface ReorderMode {
  active: boolean;
  sourceIndex: number;
  targetIndex: number;
}

interface DragState {
  isDragging: boolean;
  sourceIndex: number;
  targetIndex: number | null;
}

export const useTableReordering = (
  moveRow: (fromIndex: number, toIndex: number) => void,
  dataLength: number
) => {
  const [reorderMode, setReorderMode] = useState<ReorderMode | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const handleReorderButtonClick = (rowIndex: number) => {
    setReorderMode({
      active: true,
      sourceIndex: rowIndex,
      targetIndex: rowIndex,
    });
  };

  const handleReorderKeyDown = (e: React.KeyboardEvent, rowIndex: number) => {
    if (!reorderMode) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleReorderButtonClick(rowIndex);
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setReorderMode((prev) => {
        if (!prev) return null;
        const newTargetIndex = Math.max(0, prev.targetIndex - 1);
        return { ...prev, targetIndex: newTargetIndex };
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setReorderMode((prev) => {
        if (!prev) return null;
        const newTargetIndex = Math.min(dataLength - 1, prev.targetIndex + 1);
        return { ...prev, targetIndex: newTargetIndex };
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (reorderMode.sourceIndex !== reorderMode.targetIndex) {
        moveRow(reorderMode.sourceIndex, reorderMode.targetIndex);
      }
      setReorderMode(null);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setReorderMode(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, rowIndex: number) => {
    setDragState({ isDragging: true, sourceIndex: rowIndex, targetIndex: null });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(rowIndex));
  };

  const handleDragOver = (e: React.DragEvent, rowIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragState && dragState.sourceIndex !== rowIndex) {
      setDragState(prev => prev ? { ...prev, targetIndex: rowIndex } : null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragState && dragState.sourceIndex !== targetIndex) {
      moveRow(dragState.sourceIndex, targetIndex);
    }
    setDragState(null);
  };

  const handleDragEnd = () => {
    setDragState(null);
  };

  return {
    reorderMode,
    dragState,
    handleReorderButtonClick,
    handleReorderKeyDown,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
