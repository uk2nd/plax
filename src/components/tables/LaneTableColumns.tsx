import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { formatDateInput } from "@/src/utils/dateFormat";
import { useScheduleStore } from "@/src/stores/scheduleStore";
import { calculateLaneId } from "@/src/utils/laneCalculation";
import { TableInputCell } from "./TableInputCell";
import { FocusedCell } from "@/src/hooks/useCellMode";
import { KeyboardEvent } from "react";

export type TaskRow = {
  lane: string;
  task: string;
  startDate: string;
  duration: string;
  endDate: string;
  order?: number;
};

type LaneColumnOptions = {
  updateData: (rowId: string, columnId: string, value: string) => void;
  handleComplexGridKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowId: string,
    colIndex: number,
    totalCols: number,
    addRowBelow?: (rowId: string) => void,
    deleteRow?: (rowId: string) => void
  ) => void;
  handleSelectModeKeyDown: (
    e: KeyboardEvent<HTMLInputElement>,
    rowId: string,
    colIndex: number,
    totalCols: number,
    onEnterEditMode: (clearContent: boolean, initialKey?: string) => void,
    onMove: (direction: 'up' | 'down' | 'left' | 'right') => void,
    addRowBelow?: (rowId: string) => void,
    deleteRow?: (rowId: string) => void
  ) => void;
  handleEditModeKeyDown: (
    e: KeyboardEvent<HTMLInputElement>,
    onConfirm: (direction: 'up' | 'down' | 'left' | 'right') => void,
    rowId?: string,
    addRowBelow?: (rowId: string) => void,
    deleteRow?: (rowId: string) => void
  ) => void;
  addRowBelow: (rowId: string) => void;
  deleteRow: (rowId: string) => void;
  focusedCell: FocusedCell | null;
  cellMode: 'select' | 'edit';
  isCellFocused: (rowId: string, colIndex: number) => boolean;
  focusCell: (rowId: string, colIndex: number, mode?: 'select' | 'edit') => void;
  setMode: (mode: 'select' | 'edit') => void;
};

export const createLaneColumns = ({
  updateData,
  handleComplexGridKeyDown,
  handleSelectModeKeyDown,
  handleEditModeKeyDown,
  addRowBelow,
  deleteRow,
  focusedCell,
  cellMode,
  isCellFocused,
  focusCell,
  setMode,
}: LaneColumnOptions): ColumnDef<TaskRow, any>[] => {
  const columnHelper = createColumnHelper<TaskRow>();

  // セル移動処理のヘルパー関数
  const moveToCell = (currentRowId: string, currentCol: number, direction: 'up' | 'down' | 'left' | 'right') => {
    const allInputs = Array.from(
      document.querySelectorAll("input[data-row-id][data-col], div[data-row-id][data-col]")
    ) as (HTMLInputElement | HTMLDivElement)[];

    const currentIndex = allInputs.findIndex(
      (el) => el.dataset.rowId === currentRowId && el.dataset.col === String(currentCol)
    );

    if (currentIndex === -1) return;

    let targetIndex = -1;

    if (direction === 'up' || direction === 'down') {
      // 同じ列で上下に移動
      const step = direction === 'down' ? 1 : -1;
      for (let i = currentIndex + step; i >= 0 && i < allInputs.length; i += step) {
        const el = allInputs[i];
        if (el.dataset.col === String(currentCol) && !(el as HTMLInputElement).disabled) {
          targetIndex = i;
          break;
        }
      }
    } else {
      // 同じ行で左右に移動
      const currentRowId = allInputs[currentIndex].dataset.rowId;
      const targetCol = direction === 'right' ? currentCol + 1 : currentCol - 1;
      
      for (let i = 0; i < allInputs.length; i++) {
        const el = allInputs[i];
        if (el.dataset.rowId === currentRowId && el.dataset.col === String(targetCol) && !(el as HTMLInputElement).disabled) {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex !== -1) {
      const targetEl = allInputs[targetIndex];
      const targetRowId = targetEl.dataset.rowId!;
      const targetCol = parseInt(targetEl.dataset.col!);
      focusCell(targetRowId, targetCol, 'select');
    }
  };

  return [
    columnHelper.accessor("lane", {
      header: "レーン",
      cell: ({ row, getValue }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const updateLaneName = useScheduleStore((state) => state.updateLaneName);
        const laneValue = getValue();
        const rowId = row.id;
        const colIndex = 0;
        const isFocused = isCellFocused(rowId, colIndex);
        
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
          e.currentTarget.dataset.initialValue = e.currentTarget.value;
        };
        
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          const rowIndex = parseInt(row.id);
          const rowData = row.original;
          const initialValue = e.currentTarget.dataset.initialValue || '';
          
          if (rowData.lane !== initialValue) {
            const order = rowData.order ?? rowIndex;
            const isLane = laneValue.trim() !== '' && laneValue.trim() !== '┋';
            
            if (isLane) {
              updateLaneName(order, rowData.lane);
            }
          }
        };

        const handleEnterEditMode = (clearContent: boolean, initialKey?: string) => {
          if (initialKey !== undefined) {
            // 文字入力の場合：値を入力された文字で置き換え
            updateData(rowId, "lane", initialKey);
          }
          // initialKeyがない場合（F2キー）：値はそのまま
          setMode('edit');
        };

        const handleCellClick = () => {
          focusCell(rowId, colIndex, 'select');
        };

        const handleCellDoubleClick = () => {
          focusCell(rowId, colIndex, 'edit');
        };

        return (
          <TableInputCell
            value={laneValue}
            rowId={rowId}
            colIndex={colIndex}
            isFocused={isFocused}
            mode={cellMode}
            onChange={(value) => updateData(rowId, "lane", value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelectModeKeyDown={(e) => 
              handleSelectModeKeyDown(e, rowId, colIndex, 5, handleEnterEditMode, (dir) => moveToCell(rowId, colIndex, dir), addRowBelow, deleteRow)
            }
            onEditModeKeyDown={(e) => 
              handleEditModeKeyDown(e, (dir) => {
                setMode('select');
                moveToCell(rowId, colIndex, dir);
              }, rowId, addRowBelow, deleteRow)
            }
            onCellClick={handleCellClick}
            onCellDoubleClick={handleCellDoubleClick}
          />
        );
      },
    }),
    columnHelper.accessor("task", {
      header: "タスク",
      cell: (info) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const updateTaskName = useScheduleStore((state) => state.updateTaskName);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const lanes = useScheduleStore((state) => state.lanes);
        const laneValue = info.row.original.lane;
        const hasLaneText = laneValue.trim() !== '' && laneValue.trim() !== '┗';
        const isDisabled = hasLaneText;
        const rowId = info.row.id;
        const colIndex = 1;
        const isFocused = isCellFocused(rowId, colIndex);
        
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
          e.currentTarget.dataset.initialValue = e.currentTarget.value;
        };
        
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          const rowIndex = parseInt(info.row.id);
          const rowData = info.row.original;
          const initialValue = e.currentTarget.dataset.initialValue || '';
          
          if (rowData.task !== initialValue) {
            const order = rowData.order ?? rowIndex;
            const laneId = calculateLaneId(rowIndex, lanes);
            updateTaskName(order, rowData.task, laneId);
          }
        };

        const handleEnterEditMode = (clearContent: boolean, initialKey?: string) => {
          if (initialKey !== undefined) {
            // 文字入力の場合：値を入力された文字で置き換え
            updateData(rowId, "task", initialKey);
          }
          // initialKeyがない場合（F2キー）：値はそのまま
          setMode('edit');
        };

        const handleCellClick = () => {
          if (!isDisabled) {
            focusCell(rowId, colIndex, 'select');
          }
        };

        const handleCellDoubleClick = () => {
          if (!isDisabled) {
            focusCell(rowId, colIndex, 'edit');
          }
        };

        return (
          <TableInputCell
            value={info.getValue()}
            rowId={rowId}
            colIndex={colIndex}
            isFocused={isFocused}
            mode={cellMode}
            disabled={isDisabled}
            className="text-blue-600 font-semibold"
            onChange={(value) => updateData(rowId, "task", value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelectModeKeyDown={(e) => 
              handleSelectModeKeyDown(e, rowId, colIndex, 5, handleEnterEditMode, (dir) => moveToCell(rowId, colIndex, dir), addRowBelow, deleteRow)
            }
            onEditModeKeyDown={(e) => 
              handleEditModeKeyDown(e, (dir) => {
                setMode('select');
                moveToCell(rowId, colIndex, dir);
              }, rowId, addRowBelow, deleteRow)
            }
            onCellClick={handleCellClick}
            onCellDoubleClick={handleCellDoubleClick}
          />
        );
      },
    }),
    columnHelper.accessor("startDate", {
      header: "開始日",
      cell: (info) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const updateTaskStartDate = useScheduleStore((state) => state.updateTaskStartDate);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const lanes = useScheduleStore((state) => state.lanes);
        const laneValue = info.row.original.lane;
        const hasLaneText = laneValue.trim() !== '' && laneValue.trim() !== '┗';
        const isDisabled = hasLaneText;
        const rowId = info.row.id;
        const colIndex = 2;
        const isFocused = isCellFocused(rowId, colIndex);
        
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
          e.currentTarget.dataset.initialValue = e.currentTarget.value;
        };
        
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          const formatted = formatDateInput(e.target.value);
          if (formatted !== e.target.value) {
            updateData(info.row.id, "startDate", formatted);
          }
          
          const rowIndex = parseInt(info.row.id);
          const rowData = info.row.original;
          const currentValue = formatted || rowData.startDate;
          const initialValue = e.currentTarget.dataset.initialValue || '';
          
          if (currentValue !== initialValue) {
            const order = rowData.order ?? rowIndex;
            const laneId = calculateLaneId(rowIndex, lanes);
            updateTaskStartDate(order, currentValue, laneId);
          }
        };

        const handleEnterEditMode = (clearContent: boolean, initialKey?: string) => {
          if (initialKey !== undefined) {
            // 文字入力の場合：値を入力された文字で置き換え
            updateData(rowId, "startDate", initialKey);
          }
          // initialKeyがない場合（F2キー）：値はそのまま
          setMode('edit');
        };

        const handleCellClick = () => {
          if (!isDisabled) {
            focusCell(rowId, colIndex, 'select');
          }
        };

        const handleCellDoubleClick = () => {
          if (!isDisabled) {
            focusCell(rowId, colIndex, 'edit');
          }
        };

        return (
          <TableInputCell
            value={info.getValue()}
            rowId={rowId}
            colIndex={colIndex}
            isFocused={isFocused}
            mode={cellMode}
            disabled={isDisabled}
            onChange={(value) => updateData(rowId, "startDate", value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelectModeKeyDown={(e) => 
              handleSelectModeKeyDown(e, rowId, colIndex, 5, handleEnterEditMode, (dir) => moveToCell(rowId, colIndex, dir), addRowBelow, deleteRow)
            }
            onEditModeKeyDown={(e) => 
              handleEditModeKeyDown(e, (dir) => {
                // Enter/Shift+Enter/Tab/Shift+Tabで日付を自動補完
                const currentValue = e.currentTarget.value;
                const formatted = formatDateInput(currentValue);
                if (formatted !== currentValue) {
                  updateData(rowId, "startDate", formatted);
                }
                setMode('select');
                moveToCell(rowId, colIndex, dir);
              }, rowId, addRowBelow, deleteRow)
            }
            onCellClick={handleCellClick}
            onCellDoubleClick={handleCellDoubleClick}
          />
        );
      },
    }),
    columnHelper.accessor("duration", {
      header: () => (
        <div>
          期間
          <div className="text-xs font-normal">(d:日、w:週、m:月)</div>
        </div>
      ),
      cell: (info) => {
        const laneValue = info.row.original.lane;
        const hasLaneText = laneValue.trim() !== '' && laneValue.trim() !== '┗';
        const isDisabled = hasLaneText;
        const rowId = info.row.id;
        const colIndex = 3;
        const isFocused = isCellFocused(rowId, colIndex);

        const handleEnterEditMode = (clearContent: boolean, initialKey?: string) => {
          if (initialKey !== undefined) {
            // 文字入力の場合：値を入力された文字で置き換え
            updateData(rowId, "duration", initialKey);
          }
          // initialKeyがない場合（F2キー）：値はそのまま
          setMode('edit');
        };

        const handleCellClick = () => {
          if (!isDisabled) {
            focusCell(rowId, colIndex, 'select');
          }
        };

        const handleCellDoubleClick = () => {
          if (!isDisabled) {
            focusCell(rowId, colIndex, 'edit');
          }
        };
        
        return (
          <TableInputCell
            value={info.getValue()}
            rowId={rowId}
            colIndex={colIndex}
            isFocused={isFocused}
            mode={cellMode}
            disabled={isDisabled}
            onChange={(value) => updateData(rowId, "duration", value)}
            onFocus={() => {}}
            onBlur={() => {}}
            onSelectModeKeyDown={(e) => 
              handleSelectModeKeyDown(e, rowId, colIndex, 5, handleEnterEditMode, (dir) => moveToCell(rowId, colIndex, dir), addRowBelow, deleteRow)
            }
            onEditModeKeyDown={(e) => 
              handleEditModeKeyDown(e, (dir) => {
                setMode('select');
                moveToCell(rowId, colIndex, dir);
              }, rowId, addRowBelow, deleteRow)
            }
            onCellClick={handleCellClick}
            onCellDoubleClick={handleCellDoubleClick}
          />
        );
      },
    }),
    columnHelper.accessor("endDate", {
      header: "終了日",
      cell: (info) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const updateTaskEndDate = useScheduleStore((state) => state.updateTaskEndDate);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const lanes = useScheduleStore((state) => state.lanes);
        const laneValue = info.row.original.lane;
        const hasLaneText = laneValue.trim() !== '' && laneValue.trim() !== '┗';
        const isDisabled = hasLaneText;
        const rowId = info.row.id;
        const colIndex = 4;
        const isFocused = isCellFocused(rowId, colIndex);
        
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
          e.currentTarget.dataset.initialValue = e.currentTarget.value;
        };
        
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          const formatted = formatDateInput(e.target.value);
          if (formatted !== e.target.value) {
            updateData(info.row.id, "endDate", formatted);
          }
          
          const rowIndex = parseInt(info.row.id);
          const rowData = info.row.original;
          const currentValue = formatted || rowData.endDate;
          const initialValue = e.currentTarget.dataset.initialValue || '';
          
          if (currentValue !== initialValue) {
            const order = rowData.order ?? rowIndex;
            const laneId = calculateLaneId(rowIndex, lanes);
            updateTaskEndDate(order, currentValue, laneId);
          }
        };

        const handleEnterEditMode = (clearContent: boolean, initialKey?: string) => {
          if (initialKey !== undefined) {
            // 文字入力の場合：値を入力された文字で置き換え
            updateData(rowId, "endDate", initialKey);
          }
          // initialKeyがない場合（F2キー）：値はそのまま
          setMode('edit');
        };

        const handleCellClick = () => {
          if (!isDisabled) {
            focusCell(rowId, colIndex, 'select');
          }
        };

        const handleCellDoubleClick = () => {
          if (!isDisabled) {
            focusCell(rowId, colIndex, 'edit');
          }
        };

        return (
          <TableInputCell
            value={info.getValue()}
            rowId={rowId}
            colIndex={colIndex}
            isFocused={isFocused}
            mode={cellMode}
            disabled={isDisabled}
            onChange={(value) => updateData(rowId, "endDate", value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelectModeKeyDown={(e) => 
              handleSelectModeKeyDown(e, rowId, colIndex, 5, handleEnterEditMode, (dir) => moveToCell(rowId, colIndex, dir), addRowBelow, deleteRow)
            }
            onEditModeKeyDown={(e) => 
              handleEditModeKeyDown(e, (dir) => {
                // Enter/Shift+Enter/Tab/Shift+Tabで日付を自動補完
                const currentValue = e.currentTarget.value;
                const formatted = formatDateInput(currentValue);
                if (formatted !== currentValue) {
                  updateData(rowId, "endDate", formatted);
                }
                setMode('select');
                moveToCell(rowId, colIndex, dir);
              }, rowId, addRowBelow, deleteRow)
            }
            onCellClick={handleCellClick}
            onCellDoubleClick={handleCellDoubleClick}
          />
        );
      },
    }),
  ];
};
