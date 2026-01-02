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
import { Milestone, createMilestoneColumns } from "./MilestoneTableColumns";

const createEmptyRow = (): Milestone => ({
  name: "",
  date: "",
});

const initialData: Milestone[] = [createEmptyRow()];

export const MilestoneTable = () => {
  const [data, setData] = useState<Milestone[]>(initialData);
  const { handleSimpleGridKeyDown } = useTableKeyboardNavigation();

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

  const updateData = (rowIndex: number, columnId: string, value: string) => {
    setData((old) => {
      const newData = old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...row,
            [columnId]: value,
          };
        }
        return row;
      });

      // 最下行に入力があった場合のみ、新しい空行を追加
      return addEmptyRowIfNeeded(
        newData,
        rowIndex,
        (row) => row.name.trim() !== "" || row.date.trim() !== "",
        createEmptyRow
      );
    });
  };

  const columns = useMemo(
    () => createMilestoneColumns({
      updateData,
      handleSimpleGridKeyDown,
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
            const isReorderSource = reorderMode?.sourceIndex === row.index;
            const isReorderTarget = reorderMode?.targetIndex === row.index;
            const isDragSource = dragState?.isDragging && dragState.sourceIndex === row.index;
            const isDragTarget = dragState?.targetIndex === row.index && dragState.sourceIndex !== row.index;
            
            return (
              <tr 
                key={row.id} 
                className={`hover:bg-gray-50 ${isReorderSource ? 'bg-gray-200' : ''} ${(isReorderTarget && !isReorderSource) || isDragTarget ? 'bg-blue-100' : ''} ${isDragSource || isReorderSource ? 'opacity-50' : ''}`}
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
                  <button 
                    className="text-gray-500 hover:text-gray-700 cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, row.index)}
                    onDragEnd={handleDragEnd}
                    onKeyDown={(e) => {
                      // 左矢印で最後の列に戻る
                      if (e.key === "ArrowLeft" && !reorderMode) {
                        e.preventDefault();
                        const lastInput = document.querySelector(`input[data-row="${row.index}"][data-col="1"]`) as HTMLInputElement;
                        if (lastInput) {
                          lastInput.focus();
                          lastInput.setSelectionRange(lastInput.value.length, lastInput.value.length);
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
                          const prevButton = allRows[currentIndex - 1]?.querySelector('button[data-reorder-row]') as HTMLButtonElement;
                          if (prevButton) prevButton.focus();
                        } else if (e.key === "ArrowDown" && currentIndex < allRows.length - 1) {
                          const nextButton = allRows[currentIndex + 1]?.querySelector('button[data-reorder-row]') as HTMLButtonElement;
                          if (nextButton) nextButton.focus();
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
