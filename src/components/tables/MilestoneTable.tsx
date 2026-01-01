"use client";

import { useState, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { formatDateInput } from "@/src/utils/dateFormat";
import { useTableKeyboardNavigation } from "@/src/hooks/useTableKeyboardNavigation";
import { TABLE_INPUT_CLASSES } from "@/src/constants/tableStyles";

type Milestone = {
  name: string;
  date: string;
};

const createEmptyRow = (): Milestone => ({
  name: "",
  date: "",
});

const initialData: Milestone[] = [createEmptyRow()];

export const MilestoneTable = () => {
  const [data, setData] = useState<Milestone[]>(initialData);
  const [reorderMode, setReorderMode] = useState<{
    active: boolean;
    sourceIndex: number;
    targetIndex: number;
  } | null>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    sourceIndex: number;
    targetIndex: number | null;
  } | null>(null);
  const { handleSimpleGridKeyDown } = useTableKeyboardNavigation();

  // 行を追加する関数（カーソル位置の下に追加）
  const addRowBelow = (rowId: string) => {
    setData((old) => {
      const newData = [...old];
      const rowIndex = parseInt(rowId);
      
      if (!isNaN(rowIndex) && rowIndex >= 0 && rowIndex < newData.length) {
        // 指定した行の下に空行を追加
        newData.splice(rowIndex + 1, 0, createEmptyRow());
      }
      
      return newData;
    });
  };

  // 行を削除する関数
  const deleteRow = (rowId: string) => {
    setData((old) => {
      const newData = [...old];
      const rowIndex = parseInt(rowId);
      
      // 最後の1行は削除しない（最低1行は残す）
      if (!isNaN(rowIndex) && rowIndex >= 0 && rowIndex < newData.length && newData.length > 1) {
        newData.splice(rowIndex, 1);
      }
      
      return newData;
    });
  };

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
      const lastRowIndex = newData.length - 1;
      if (rowIndex === lastRowIndex) {
        const lastRow = newData[lastRowIndex];
        const lastRowHasData =
          lastRow.name.trim() !== "" || lastRow.date.trim() !== "";

        if (lastRowHasData) {
          newData.push(createEmptyRow());
        }
      }

      return newData;
    });
  };

  const moveRow = (fromIndex: number, toIndex: number) => {
    setData((old) => {
      const newData = [...old];
      const [movedRow] = newData.splice(fromIndex, 1);
      newData.splice(toIndex, 0, movedRow);
      return newData;
    });
  };

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
        const newTargetIndex = Math.min(data.length - 1, prev.targetIndex + 1);
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

  const columnHelper = createColumnHelper<Milestone>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "マイルストン",
        cell: (info) => (
          <input
            type="text"
            value={info.getValue()}
            onChange={(e) =>
              updateData(info.row.index, info.column.id, e.target.value)
            }
            onKeyDown={(e) => handleSimpleGridKeyDown(e, info.row.index, 0, 2, addRowBelow, deleteRow)}
            data-row={info.row.index}
            data-col={0}
            className={TABLE_INPUT_CLASSES}
          />
        ),
      }),
      columnHelper.accessor("date", {
        header: "日付",
        cell: (info) => (
          <input
            type="text"
            value={info.getValue()}
            onChange={(e) =>
              updateData(info.row.index, info.column.id, e.target.value)
            }
            onBlur={(e) => {
              const formatted = formatDateInput(e.target.value);
              if (formatted !== e.target.value) {
                updateData(info.row.index, info.column.id, formatted);
              }
            }}
            onKeyDown={(e) => {
              handleSimpleGridKeyDown(e, info.row.index, 1, 2, addRowBelow, deleteRow);
              // 右矢印で並び替えボタンに移動
              if (e.key === "ArrowRight" && e.currentTarget.selectionStart === e.currentTarget.value.length) {
                const currentCell = e.currentTarget.closest('td');
                const currentRow = currentCell?.closest('tr');
                const button = currentRow?.querySelector('button[data-reorder-row]') as HTMLButtonElement;
                if (button) {
                  e.preventDefault();
                  button.focus();
                }
              }
            }}
            data-row={info.row.index}
            data-col={1}
            className={TABLE_INPUT_CLASSES}
          />
        ),
      }),
    ],
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
