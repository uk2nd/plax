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
import { useScheduleStore } from "@/src/stores/scheduleStore";
import { calculateLaneId } from "@/src/utils/laneCalculation";

type TaskRowWithOrder = TaskRow & { order: number };

const createEmptyRow = (order: number): TaskRowWithOrder => ({
  lane: "",
  task: "",
  startDate: "",
  duration: "",
  endDate: "",
  order,
});

const initialData: TaskRowWithOrder[] = [createEmptyRow(0)];

export const LaneTable = () => {
  const [data, setData] = useState<TaskRowWithOrder[]>(initialData);
  const { handleComplexGridKeyDown } = useTableKeyboardNavigation();
  const updateLaneTaskOrder = useScheduleStore((state) => state.updateLaneTaskOrder);

  // 行を追加する関数
  const addRowBelow = (rowId: string) => {
    setData((old) => {
      const rowIndex = parseInt(rowId);
      // 追加先の上下の行のorderの中間値を計算
      const currentOrder = old[rowIndex].order;
      const nextOrder = old[rowIndex + 1]?.order ?? currentOrder + 2;
      const newOrder = (currentOrder + nextOrder) / 2;
      const newRow = createEmptyRow(newOrder);
      return addRowBelowUtil(old, rowId, () => newRow);
    });
  };

  // 行を削除する関数
  const deleteRow = (rowId: string) => {
    setData((old) => {
      const rowIndex = parseInt(rowId);
      const rowToDelete = old[rowIndex];
      
      // Storeから該当のデータを削除
      if (rowToDelete && rowToDelete.order !== undefined) {
        useScheduleStore.getState().deleteRowData(rowToDelete.order);
      }
      
      return deleteRowUtil(old, rowId);
    });
  };

  // 行を移動する関数（order値を更新）
  const moveRow = (fromIndex: number, toIndex: number) => {
    setData((old) => {
      const result = moveRowUtil(old, fromIndex, toIndex);
      const movedRow = result[toIndex];
      const oldOrder = movedRow.order;
      
      // 移動先の上下の行のorderの中間値を計算
      const prevOrder = result[toIndex - 1]?.order ?? (result[toIndex + 1]?.order ?? 1) - 2;
      const nextOrder = result[toIndex + 1]?.order ?? (result[toIndex - 1]?.order ?? 0) + 2;
      const newOrder = (prevOrder + nextOrder) / 2;
      
      // 移動した行のorderを更新
      result[toIndex] = { ...movedRow, order: newOrder };
      
      // Storeのorder値を更新
      updateLaneTaskOrder(oldOrder, newOrder);
      
      return result;
    });
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
        const beforeRow = { ...newData[rowIndex] };
        newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
        
        // 日付自動補完ロジックを適用
        applyDateAutoCompletion(newData[rowIndex], columnId, value);
        
        // 日付が自動算出された場合、Storeに送信
        const afterRow = newData[rowIndex];
        const order = afterRow.order ?? rowIndex;
        const store = useScheduleStore.getState();
        const lanes = store.lanes;
        const laneId = calculateLaneId(rowIndex, lanes);
        
        // 開始日が自動算出された場合
        if (columnId !== 'startDate' && beforeRow.startDate !== afterRow.startDate) {
          console.log('[Auto-calculated StartDate] Order:', order, 'StartDate:', afterRow.startDate, 'LaneId:', laneId);
          store.updateTaskStartDate(order, afterRow.startDate, laneId);
        }
        
        // 終了日が自動算出された場合
        if (columnId !== 'endDate' && beforeRow.endDate !== afterRow.endDate) {
          console.log('[Auto-calculated EndDate] Order:', order, 'EndDate:', afterRow.endDate, 'LaneId:', laneId);
          store.updateTaskEndDate(order, afterRow.endDate, laneId);
        }
        
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
          () => createEmptyRow(Math.max(...newData.map(r => r.order)) + 1)
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
