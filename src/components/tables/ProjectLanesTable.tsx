"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getExpandedRowModel,
  Row,
} from "@tanstack/react-table";

type TaskRow = {
  lane: string;
  arrow: string;
  startDate: string;
  duration: string;
  endDate: string;
  subRows?: TaskRow[];
};

const createEmptyRow = (): TaskRow => ({
  lane: "",
  arrow: "",
  startDate: "",
  duration: "",
  endDate: "",
});

const initialData: TaskRow[] = [createEmptyRow()];

export const ProjectLanesTable = () => {
  const [data, setData] = useState<TaskRow[]>(initialData);

  const updateData = (rowId: string, columnId: string, value: string) => {
    setData((old) => {
      const newData = [...old];
      let updatedRowIndex = -1;
      
      const updateRow = (rows: TaskRow[], targetId: string): boolean => {
        for (let i = 0; i < rows.length; i++) {
          const currentId = `${i}`;
          if (currentId === targetId) {
            rows[i] = { ...rows[i], [columnId]: value };
            updatedRowIndex = i;
            return true;
          }
          if (rows[i].subRows) {
            const subRowIds = targetId.split('.');
            if (subRowIds[0] === currentId && subRowIds.length > 1) {
              const subIndex = parseInt(subRowIds[1]);
              if (rows[i].subRows![subIndex]) {
                rows[i].subRows![subIndex] = {
                  ...rows[i].subRows![subIndex],
                  [columnId]: value,
                };
                return true;
              }
            }
          }
        }
        return false;
      };
      updateRow(newData, rowId);

      // 最下行に入力があった場合のみ、新しい空行を追加
      const lastRowIndex = newData.length - 1;
      if (updatedRowIndex === lastRowIndex) {
        const lastRow = newData[lastRowIndex];
        const lastRowHasData =
          lastRow.lane.trim() !== "" ||
          lastRow.arrow.trim() !== "" ||
          lastRow.startDate.trim() !== "" ||
          lastRow.duration.trim() !== "" ||
          lastRow.endDate.trim() !== "";

        if (lastRowHasData) {
          newData.push(createEmptyRow());
        }
      }

      return newData;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowId: string, colIndex: number) => {
    const input = e.currentTarget;
    const totalCols = 5; // lane, arrow, startDate, duration, endDate
    let nextColIndex = colIndex;

    switch (e.key) {
      case "ArrowRight":
        // カーソルが文字列の末尾にいる場合のみセル移動
        if (input.selectionStart === input.value.length && nextColIndex < totalCols - 1) {
          nextColIndex++;
          e.preventDefault();
        } else {
          return; // デフォルトのカーソル移動を許可
        }
        break;
      case "ArrowLeft":
        // カーソルが文字列の先頭にいる場合のみセル移動
        if (input.selectionStart === 0 && nextColIndex > 0) {
          nextColIndex--;
          e.preventDefault();
        } else {
          return; // デフォルトのカーソル移動を許可
        }
        break;
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        // 現在の行の次/前の行を探す
        const allInputs = Array.from(
          document.querySelectorAll('input[data-row-id][data-col]')
        ) as HTMLInputElement[];
        
        const currentIndex = allInputs.findIndex(
          input => input.dataset.rowId === rowId && input.dataset.col === String(colIndex)
        );
        
        if (currentIndex === -1) return;
        
        // 同じ列で次/前の行を探す
        let targetIndex = currentIndex;
        if (e.key === "ArrowDown") {
          // 次の同じ列のセルを探す
          for (let i = currentIndex + 1; i < allInputs.length; i++) {
            if (allInputs[i].dataset.col === String(colIndex)) {
              targetIndex = i;
              break;
            }
          }
        } else {
          // 前の同じ列のセルを探す
          for (let i = currentIndex - 1; i >= 0; i--) {
            if (allInputs[i].dataset.col === String(colIndex)) {
              targetIndex = i;
              break;
            }
          }
        }
        
        if (targetIndex !== currentIndex && allInputs[targetIndex]) {
          allInputs[targetIndex].focus();
          allInputs[targetIndex].select();
        }
        return;
      }
      default:
        return;
    }

    // 左右の場合は同じ行内で移動
    const nextInput = document.querySelector(
      `input[data-row-id="${rowId}"][data-col="${nextColIndex}"]`
    ) as HTMLInputElement;
    
    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    }
  };

  const columnHelper = createColumnHelper<TaskRow>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("lane", {
        header: "レーン",
        cell: ({ row, getValue }) => (
          <div
            style={{
              paddingLeft: `${row.depth * 1}rem`,
            }}
            className="flex items-center gap-2"
          >
            {row.getCanExpand() && (
              <button
                onClick={row.getToggleExpandedHandler()}
                className="cursor-pointer"
              >
                {row.getIsExpanded() ? "▼" : "▶"}
              </button>
            )}
            <input
              type="text"
              value={getValue()}
              onChange={(e) => updateData(row.id, "lane", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, row.id, 0)}
              data-row-id={row.id}
              data-col={0}
              className={`flex-1 border-none outline-none bg-transparent px-0 focus:ring-0 ${row.depth === 0 ? "font-semibold" : ""}`}
            />
          </div>
        ),
      }),
      columnHelper.accessor("arrow", {
        header: "矢羽根",
        cell: (info) => (
          <input
            type="text"
            value={info.getValue()}
            onChange={(e) => updateData(info.row.id, "arrow", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, info.row.id, 1)}
            data-row-id={info.row.id}
            data-col={1}
            className="w-full border-none outline-none bg-transparent px-0 focus:ring-0 text-blue-600 font-semibold"
          />
        ),
      }),
      columnHelper.accessor("startDate", {
        header: "開始日",
        cell: (info) => (
          <input
            type="text"
            value={info.getValue()}
            onChange={(e) => updateData(info.row.id, "startDate", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, info.row.id, 2)}
            data-row-id={info.row.id}
            data-col={2}
            className="w-full border-none outline-none bg-transparent px-0 focus:ring-0"
          />
        ),
      }),
      columnHelper.accessor("duration", {
        header: () => (
          <div>
            期間
            <div className="text-xs font-normal">(d:日、w:週、m:月)</div>
          </div>
        ),
        cell: (info) => (
          <input
            type="text"
            value={info.getValue()}
            onChange={(e) => updateData(info.row.id, "duration", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, info.row.id, 3)}
            data-row-id={info.row.id}
            data-col={3}
            className="w-full border-none outline-none bg-transparent px-0 focus:ring-0"
          />
        ),
      }),
      columnHelper.accessor("endDate", {
        header: "終了日",
        cell: (info) => (
          <input
            type="text"
            value={info.getValue()}
            onChange={(e) => updateData(info.row.id, "endDate", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, info.row.id, 4)}
            data-row-id={info.row.id}
            data-col={4}
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
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.subRows,
    initialState: {
      expanded: true,
    },
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
            const isPhaseRow = row.depth === 0 && row.original.subRows;
            const isEmptyRow = row.original.lane === "-";

            return (
              <tr
                key={row.id}
                className={`${
                  isPhaseRow
                    ? "bg-gray-200"
                    : isEmptyRow
                    ? "bg-white"
                    : "bg-white hover:bg-gray-50"
                }`}
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
                    <button className="text-gray-500 hover:text-gray-700">
                      ⋮
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
