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
import { 
  formatDateInput, 
  calculateDaysBetween, 
  calculateEndDate, 
  calculateStartDate 
} from "@/src/utils/dateFormat";
import { useTableKeyboardNavigation } from "@/src/hooks/useTableKeyboardNavigation";
import { TABLE_INPUT_CLASSES } from "@/src/constants/tableStyles";

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

export const LaneTable = () => {
  const [data, setData] = useState<TaskRow[]>(initialData);
  const { handleComplexGridKeyDown } = useTableKeyboardNavigation();

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

  const updateData = (rowId: string, columnId: string, value: string) => {
    setData((old) => {
      const newData = [...old];
      let updatedRowIndex = -1;
      
      const updateRow = (rows: TaskRow[], targetId: string): TaskRow | null => {
        for (let i = 0; i < rows.length; i++) {
          const currentId = `${i}`;
          if (currentId === targetId) {
            rows[i] = { ...rows[i], [columnId]: value };
            updatedRowIndex = i;
            return rows[i];
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
                return rows[i].subRows![subIndex];
              }
            }
          }
        }
        return null;
      };
      
      const currentRow = updateRow(newData, rowId);

      // レーンに文字が入力された場合（「┗」以外）、矢羽根・開始日・期間・終了日を空欄にする
      if (currentRow && columnId === 'lane' && value.trim() !== '' && value.trim() !== '┗') {
        currentRow.arrow = '';
        currentRow.startDate = '';
        currentRow.duration = '';
        currentRow.endDate = '';
      }

      // 矢羽根・開始日・期間・終了日に文字が入力された場合、レーンに「┗」を自動入力
      if (currentRow && ['arrow', 'startDate', 'duration', 'endDate'].includes(columnId) && value.trim() !== '') {
        if (currentRow.lane.trim() === '') {
          currentRow.lane = '┗';
        }
      }

      // 日付自動補完処理
      if (currentRow) {
        const { startDate, duration, endDate } = currentRow;

        // 期間を編集した場合の処理
        if (columnId === 'duration') {
          // 1. 期間を空欄にした場合、終了日も空欄にする
          if (!duration || duration.trim() === '') {
            currentRow.endDate = '';
          }
          // 2. 開始日と期間から終了日を計算（終了日があっても上書き）
          else if (startDate && startDate.includes('/')) {
            const calculatedEndDate = calculateEndDate(startDate, duration);
            if (calculatedEndDate) {
              currentRow.endDate = calculatedEndDate;
              // 終了日が自動算出された後、期間を日単位に修正
              const daysDuration = calculateDaysBetween(startDate, calculatedEndDate);
              if (daysDuration) {
                currentRow.duration = daysDuration;
              }
            }
          }
          // 3. 終了日と期間から開始日を計算（開始日がない場合のみ）
          else if (endDate && !startDate && endDate.includes('/')) {
            const calculatedStartDate = calculateStartDate(endDate, duration);
            if (calculatedStartDate) {
              currentRow.startDate = calculatedStartDate;
              // 開始日が自動算出された後、期間を日単位に修正
              const daysDuration = calculateDaysBetween(calculatedStartDate, endDate);
              if (daysDuration) {
                currentRow.duration = daysDuration;
              }
            }
          }
        }

        // 開始日を編集した場合の処理
        if (columnId === 'startDate') {
          // 1. 開始日を空欄にした場合、期間も空欄にする
          if (!startDate || startDate.trim() === '') {
            currentRow.duration = '';
          }
          // 2. 開始日と終了日がある場合、期間を計算
          else if (endDate && startDate.includes('/') && endDate.includes('/')) {
            const calculatedDuration = calculateDaysBetween(startDate, endDate);
            if (calculatedDuration) {
              currentRow.duration = calculatedDuration;
            }
          }
          // 3. 期間だけがある状態で開始日を入力した場合、終了日を算出
          else if (duration && !endDate && startDate.includes('/')) {
            const calculatedEndDate = calculateEndDate(startDate, duration);
            if (calculatedEndDate) {
              currentRow.endDate = calculatedEndDate;
              // 終了日が自動算出された後、期間を日単位に修正
              const daysDuration = calculateDaysBetween(startDate, calculatedEndDate);
              if (daysDuration) {
                currentRow.duration = daysDuration;
              }
            }
          }
        }

        // 終了日を編集した場合の処理
        if (columnId === 'endDate') {
          // 1. 終了日を空欄にした場合、期間も空欄にする
          if (!endDate || endDate.trim() === '') {
            currentRow.duration = '';
          }
          // 2. 開始日と終了日がある場合、期間を計算
          else if (startDate && startDate.includes('/') && endDate.includes('/')) {
            const calculatedDuration = calculateDaysBetween(startDate, endDate);
            if (calculatedDuration) {
              currentRow.duration = calculatedDuration;
            }
          }
          // 3. 期間だけがある状態で終了日を入力した場合、開始日を算出
          else if (duration && !startDate && endDate.includes('/')) {
            const calculatedStartDate = calculateStartDate(endDate, duration);
            if (calculatedStartDate) {
              currentRow.startDate = calculatedStartDate;
              // 開始日が自動算出された後、期間を日単位に修正
              const daysDuration = calculateDaysBetween(calculatedStartDate, endDate);
              if (daysDuration) {
                currentRow.duration = daysDuration;
              }
            }
          }
        }
      }

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

  const columnHelper = createColumnHelper<TaskRow>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("lane", {
        header: "レーン",
        cell: ({ row, getValue }) => {
          const laneValue = getValue();
          const hasLaneText = laneValue.trim() !== '';
          
          return (
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
                value={laneValue}
                onChange={(e) => updateData(row.id, "lane", e.target.value)}
                onKeyDown={(e) => handleComplexGridKeyDown(e, row.id, 0, 5, addRowBelow, deleteRow)}
                data-row-id={row.id}
                data-col={0}
                className={`flex-1 border-none outline-none bg-transparent px-0 focus:ring-0 ${row.depth === 0 ? "font-semibold" : ""}`}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor("arrow", {
        header: "矢羽根",
        cell: (info) => {
          const laneValue = info.row.original.lane;
          const hasLaneText = laneValue.trim() !== '' && laneValue.trim() !== '┗';
          const isDisabled = hasLaneText;
          
          return (
            <input
              type="text"
              value={info.getValue()}
              onChange={(e) => updateData(info.row.id, "arrow", e.target.value)}
              onKeyDown={(e) => handleComplexGridKeyDown(e, info.row.id, 1, 5, addRowBelow, deleteRow)}
              data-row-id={info.row.id}
              data-col={1}
              disabled={isDisabled}
              className={`w-full border-none outline-none px-0 focus:ring-0 text-blue-600 font-semibold ${isDisabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-transparent'}`}
            />
          );
        },
      }),
      columnHelper.accessor("startDate", {
        header: "開始日",
        cell: (info) => {
          const laneValue = info.row.original.lane;
          const hasLaneText = laneValue.trim() !== '' && laneValue.trim() !== '┗';
          const isDisabled = hasLaneText;
          
          return (
            <input
              type="text"
              value={info.getValue()}
              onChange={(e) => updateData(info.row.id, "startDate", e.target.value)}
              onBlur={(e) => {
                const formatted = formatDateInput(e.target.value);
                if (formatted !== e.target.value) {
                  updateData(info.row.id, "startDate", formatted);
                }
              }}
              onKeyDown={(e) => handleComplexGridKeyDown(e, info.row.id, 2, 5, addRowBelow, deleteRow)}
              data-row-id={info.row.id}
              data-col={2}
              disabled={isDisabled}
              className={`w-full border-none outline-none px-0 focus:ring-0 ${isDisabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-transparent'}`}
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
          
          return (
            <input
              type="text"
              value={info.getValue()}
              onChange={(e) => updateData(info.row.id, "duration", e.target.value)}
              onKeyDown={(e) => handleComplexGridKeyDown(e, info.row.id, 3, 5, addRowBelow, deleteRow)}
              data-row-id={info.row.id}
              data-col={3}
              disabled={isDisabled}
              className={`w-full border-none outline-none px-0 focus:ring-0 ${isDisabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-transparent'}`}
            />
          );
        },
      }),
      columnHelper.accessor("endDate", {
        header: "終了日",
        cell: (info) => {
          const laneValue = info.row.original.lane;
          const hasLaneText = laneValue.trim() !== '' && laneValue.trim() !== '┗';
          const isDisabled = hasLaneText;
          
          return (
            <input
              type="text"
              value={info.getValue()}
              onChange={(e) => updateData(info.row.id, "endDate", e.target.value)}
              onBlur={(e) => {
                const formatted = formatDateInput(e.target.value);
                if (formatted !== e.target.value) {
                  updateData(info.row.id, "endDate", formatted);
                }
              }}
              onKeyDown={(e) => handleComplexGridKeyDown(e, info.row.id, 4, 5, addRowBelow, deleteRow)}
              data-row-id={info.row.id}
              data-col={4}
              disabled={isDisabled}
              className={`w-full border-none outline-none px-0 focus:ring-0 ${isDisabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-transparent'}`}
            />
          );
        },
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
