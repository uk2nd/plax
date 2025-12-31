"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const input = e.currentTarget;
    const totalCols = 2; // name, date
    let nextRow = rowIndex;
    let nextCol = colIndex;

    switch (e.key) {
      case "ArrowRight":
        // カーソルが文字列の末尾にいる場合のみセル移動
        if (input.selectionStart === input.value.length && nextCol < totalCols - 1) {
          nextCol++;
          e.preventDefault();
        } else {
          return; // デフォルトのカーソル移動を許可
        }
        break;
      case "ArrowLeft":
        // カーソルが文字列の先頭にいる場合のみセル移動
        if (input.selectionStart === 0 && nextCol > 0) {
          nextCol--;
          e.preventDefault();
        } else {
          return; // デフォルトのカーソル移動を許可
        }
        break;
      case "ArrowDown":
        nextRow++;
        e.preventDefault();
        break;
      case "ArrowUp":
        if (nextRow > 0) {
          nextRow--;
          e.preventDefault();
        }
        break;
      default:
        return;
    }

    // 次のセルを探してフォーカス
    const nextInput = document.querySelector(
      `input[data-row="${nextRow}"][data-col="${nextCol}"]`
    ) as HTMLInputElement;
    
    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    }
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
            onKeyDown={(e) => handleKeyDown(e, info.row.index, 0)}
            data-row={info.row.index}
            data-col={0}
            className="w-full border-none outline-none bg-transparent px-0 focus:ring-0"
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
            onKeyDown={(e) => handleKeyDown(e, info.row.index, 1)}
            data-row={info.row.index}
            data-col={1}
            className="w-full border-none outline-none bg-transparent px-0 focus:ring-0"
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
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border border-gray-300 px-4 py-2"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              <td className="border border-gray-300 px-2 py-2 text-center">
                <button className="text-gray-500 hover:text-gray-700">⋮</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
