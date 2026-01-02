"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useTableKeyboardNavigation } from "@/src/hooks/useTableKeyboardNavigation";
import { useTableReordering } from "@/src/hooks/useTableReordering";
import {
  addRowBelow as addRowBelowUtil,
  deleteRow as deleteRowUtil,
  moveRow as moveRowUtil,
  addEmptyRowIfNeeded,
} from "@/src/utils/tableRowOperations";
import { applyDateAutoCompletion } from "@/src/utils/laneTableDateLogic";
import { TaskRow, createLaneColumns } from "./LaneTableColumns";

const createEmptyRow = (): TaskRow => ({
  lane: "",
  task: "",
  startDate: "",
  duration: "",
  endDate: "",
});

const initialData: TaskRow[] = [createEmptyRow()];

export const LaneTable = () => {
  const [data, setData] = useState<TaskRow[]>(initialData);
  const { handleComplexGridKeyDown } = useTableKeyboardNavigation();

  // 行を追加する関数
  const addRowBelow = (rowId: string) => {
    setData((old) => addRowBelowUtil(old, rowId, createEmptyRow));
  };

  // 行を削除する関数
  const deleteRow = (rowId: string) => {
    setData((old) => deleteRowUtil(old, rowId));
  };

  // 行を移動する関数
  const moveRow = (fromIndex: number, toIndex: number) => {
    setData((old) => moveRowUtil(old, fromIndex, toIndex));
  };

  // 並び替え・ドラッグ&ドロップのロジック
  const {
    reorderMode,
    dragState,
    handleReorderKeyDown,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useTableReordering(moveRow, data.length);

  const updateData = (rowId: string, columnId: string, value: string) => {
    setData((old) => {
      const newData = [...old];
      const rowIndex = parseInt(rowId);
      
      if (rowIndex >= 0 && rowIndex < newData.length) {
        newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
        
        // 日付自動補完ロジックを適用
        applyDateAutoCompletion(newData[rowIndex], columnId, value);
        
        // 最下行に入力があった場合のみ、新しい空行を追加
        return addEmptyRowIfNeeded(
          newData,
          rowIndex,
          (row) =>
            row.lane.trim() !== "" ||
            row.task.trim() !== "" ||
            row.startDate.trim() !== "" ||
            row.duration.trim() !== "" ||
            row.endDate.trim() !== "",
          createEmptyRow
        );
      }
      
      return newData;
    });
  };

  const columns = useMemo(
    () => createLaneColumns({
      updateData,
      handleComplexGridKeyDown,
      addRowBelow,
      deleteRow,
    }),
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <thead className="bg-gray-800 text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border border-gray-400 px-4 py-2 text-left font-medium"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
              <th className="border border-gray-400 px-4 py-2 w-12"></th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isEmptyRow = row.original.lane === "-";
            const isReorderSource = reorderMode?.sourceIndex === row.index;
            const isReorderTarget = reorderMode?.targetIndex === row.index;
            const isDragSource = dragState?.isDragging && dragState.sourceIndex === row.index;
            const isDragTarget = dragState?.targetIndex === row.index && dragState.sourceIndex !== row.index;

            return (
              <tr
                key={row.id}
                className={`${
                  isReorderSource
                    ? "bg-gray-200"
                    : isReorderTarget || isDragTarget
                    ? "bg-blue-100"
                    : isEmptyRow
                    ? "bg-white"
                    : "bg-white hover:bg-gray-50"
                } ${isDragSource || isReorderSource ? 'opacity-50' : ''}`}
                onDragOver={(e) => handleDragOver(e, row.index)}
                onDrop={(e) => handleDrop(e, row.index)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="border border-gray-300 px-2 py-2 text-center">
                  {!isEmptyRow && (
                    <button 
                      className="text-gray-500 hover:text-gray-700 cursor-move"
                      draggable
                      onDragStart={(e) => handleDragStart(e, row.index)}
                      onDragEnd={handleDragEnd}
                      onKeyDown={(e) => {
                        // 左矢印で最後の有効な列に戻る
                        if (e.key === "ArrowLeft" && !reorderMode) {
                          e.preventDefault();
                          const currentRow = e.currentTarget.closest('tr');
                          // 後ろから順に有効なinputを探す
                          for (let col = 4; col >= 0; col--) {
                            const input = currentRow?.querySelector(`input[data-col="${col}"]`) as HTMLInputElement;
                            if (input && !input.disabled) {
                              input.focus();
                              input.setSelectionRange(input.value.length, input.value.length);
                              break;
                            }
                          }
                          return;
                        }
                        // 上下矢印で他の行の並び替えボタンに移動
                        if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !reorderMode) {
                          e.preventDefault();
                          const currentRow = e.currentTarget.closest('tr');
                          const allRows = Array.from(currentRow?.parentElement?.querySelectorAll('tr') || []);
                          const currentIndex = allRows.indexOf(currentRow as HTMLTableRowElement);
                          
                          if (e.key === "ArrowUp" && currentIndex > 0) {
                            for (let i = currentIndex - 1; i >= 0; i--) {
                              const prevButton = allRows[i]?.querySelector('button[data-reorder-row]') as HTMLButtonElement;
                              if (prevButton) {
                                prevButton.focus();
                                break;
                              }
                            }
                          } else if (e.key === "ArrowDown" && currentIndex < allRows.length - 1) {
                            for (let i = currentIndex + 1; i < allRows.length; i++) {
                              const nextButton = allRows[i]?.querySelector('button[data-reorder-row]') as HTMLButtonElement;
                              if (nextButton) {
                                nextButton.focus();
                                break;
                              }
                            }
                          }
                          return;
                        }
                        handleReorderKeyDown(e, row.index);
                      }}
                      tabIndex={0}
                      data-reorder-row={row.index}
                    >
                      ≡
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
