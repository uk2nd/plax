import { useState, useCallback } from 'react';

type CellMode = 'select' | 'edit';

export interface FocusedCell {
  rowId: string;
  colIndex: number;
}

export const useCellMode = () => {
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);
  const [cellMode, setCellMode] = useState<CellMode>('select');

  const isCellFocused = useCallback((rowId: string, colIndex: number) => {
    return focusedCell?.rowId === rowId && focusedCell?.colIndex === colIndex;
  }, [focusedCell]);

  const focusCell = useCallback((rowId: string, colIndex: number, mode: CellMode = 'select') => {
    setFocusedCell({ rowId, colIndex });
    setCellMode(mode);
  }, []);

  const setMode = useCallback((mode: CellMode) => {
    setCellMode(mode);
  }, []);

  const clearFocus = useCallback(() => {
    setFocusedCell(null);
    setCellMode('select');
  }, []);

  return {
    focusedCell,
    cellMode,
    isCellFocused,
    focusCell,
    setMode,
    clearFocus,
  };
};
