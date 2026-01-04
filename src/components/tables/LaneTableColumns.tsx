import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { formatDateInput } from "@/src/utils/dateFormat";
import { useScheduleStore } from "@/src/stores/scheduleStore";
import { calculateLaneId } from "@/src/utils/laneCalculation";

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
  addRowBelow: (rowId: string) => void;
  deleteRow: (rowId: string) => void;
};

export const createLaneColumns = ({
  updateData,
  handleComplexGridKeyDown,
  addRowBelow,
  deleteRow,
}: LaneColumnOptions): ColumnDef<TaskRow, any>[] => {
  const columnHelper = createColumnHelper<TaskRow>();

  return [
    columnHelper.accessor("lane", {
      header: "レーン",
      cell: ({ row, getValue }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const updateLaneName = useScheduleStore((state) => state.updateLaneName);
        const laneValue = getValue();
        
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
          // フォーカス時に現在の値を保存
          e.currentTarget.dataset.initialValue = e.currentTarget.value;
        };
        
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          const rowIndex = parseInt(row.id);
          const rowData = row.original;
          const initialValue = e.currentTarget.dataset.initialValue || '';
          
          console.log('[Lane] Initial:', initialValue, 'Current:', rowData.lane, 'Changed:', rowData.lane !== initialValue);
          
          // 値が変更された場合のみStoreに送信
          if (rowData.lane !== initialValue) {
            const order = rowData.order ?? rowIndex;
            const isLane = laneValue.trim() !== '' && laneValue.trim() !== '┋';
            
            if (isLane) {
              console.log('[Lane] Sending to Store - Order:', order, 'Lane Name:', rowData.lane);
              updateLaneName(order, rowData.lane);
            }
          }
        };
        
        return (
          <input
            type="text"
            value={laneValue}
            onChange={(e) => updateData(row.id, "lane", e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              handleComplexGridKeyDown(e, row.id, 0, 5, addRowBelow, deleteRow);
              // 右矢印で次の列が非活性なら並び替えボタンに移動
              if (e.key === "ArrowRight" && e.currentTarget.selectionStart === e.currentTarget.value.length) {
                const currentCell = e.currentTarget.closest('td');
                const currentRow = currentCell?.closest('tr');
                const nextInput = currentRow?.querySelector('input[data-col="1"]') as HTMLInputElement;
                if (nextInput && nextInput.disabled) {
                  const button = currentRow?.querySelector('button[data-reorder-row]') as HTMLButtonElement;
                  if (button) {
                    e.preventDefault();
                    button.focus();
                  }
                }
              }
            }}
            data-row-id={row.id}
            data-col={0}
            className="w-full border-none outline-none bg-transparent px-0 focus:ring-0"
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
        
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
          // フォーカス時に現在の値を保存
          e.currentTarget.dataset.initialValue = e.currentTarget.value;
        };
        
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          const rowIndex = parseInt(info.row.id);
          const rowData = info.row.original;
          const initialValue = e.currentTarget.dataset.initialValue || '';
          
          console.log('[Task] Initial:', initialValue, 'Current:', rowData.task, 'Changed:', rowData.task !== initialValue);
          
          // 値が変更された場合のみStoreに送信
          if (rowData.task !== initialValue) {
            const order = rowData.order ?? rowIndex;
            const laneId = calculateLaneId(rowIndex, lanes);
            
            console.log('[Task] Sending to Store - Order:', order, 'Task Name:', rowData.task, 'LaneId:', laneId);
            updateTaskName(order, rowData.task, laneId);
          }
        };
        
        return (
          <input
            type="text"
            value={info.getValue()}
            onChange={(e) => updateData(info.row.id, "task", e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              handleComplexGridKeyDown(e, info.row.id, 1, 5, addRowBelow, deleteRow);
              // 右矢印で次の列が非活性なら並び替えボタンに移動
              if (e.key === "ArrowRight" && e.currentTarget.selectionStart === e.currentTarget.value.length) {
                const currentCell = e.currentTarget.closest('td');
                const currentRow = currentCell?.closest('tr');
                const nextInput = currentRow?.querySelector('input[data-col="2"]') as HTMLInputElement;
                if (nextInput && nextInput.disabled) {
                  const button = currentRow?.querySelector('button[data-reorder-row]') as HTMLButtonElement;
                  if (button) {
                    e.preventDefault();
                    button.focus();
                  }
                }
              }
            }}
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
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const updateTaskStartDate = useScheduleStore((state) => state.updateTaskStartDate);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const lanes = useScheduleStore((state) => state.lanes);
        const laneValue = info.row.original.lane;
        const hasLaneText = laneValue.trim() !== '' && laneValue.trim() !== '┗';
        const isDisabled = hasLaneText;
        
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
          // フォーカス時に現在の値を保存
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
          
          console.log('[StartDate] Initial:', initialValue, 'Current:', currentValue, 'Changed:', currentValue !== initialValue);
          
          // 値が変更された場合のみStoreに送信
          if (currentValue !== initialValue) {
            const order = rowData.order ?? rowIndex;
            const laneId = calculateLaneId(rowIndex, lanes);
            
            console.log('[StartDate] Sending to Store - Order:', order, 'StartDate:', currentValue, 'LaneId:', laneId);
            updateTaskStartDate(order, currentValue, laneId);
          }
        };
        
        return (
          <input
            type="text"
            value={info.getValue()}
            onChange={(e) => updateData(info.row.id, "startDate", e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              handleComplexGridKeyDown(e, info.row.id, 2, 5, addRowBelow, deleteRow);
              // 右矢印で次の列が非活性なら並び替えボタンに移動
              if (e.key === "ArrowRight" && e.currentTarget.selectionStart === e.currentTarget.value.length) {
                const currentCell = e.currentTarget.closest('td');
                const currentRow = currentCell?.closest('tr');
                const nextInput = currentRow?.querySelector('input[data-col="3"]') as HTMLInputElement;
                if (nextInput && nextInput.disabled) {
                  const button = currentRow?.querySelector('button[data-reorder-row]') as HTMLButtonElement;
                  if (button) {
                    e.preventDefault();
                    button.focus();
                  }
                }
              }
            }}
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
            onKeyDown={(e) => {
              handleComplexGridKeyDown(e, info.row.id, 3, 5, addRowBelow, deleteRow);
              // 右矢印で次の列が非活性なら並び替えボタンに移動
              if (e.key === "ArrowRight" && e.currentTarget.selectionStart === e.currentTarget.value.length) {
                const currentCell = e.currentTarget.closest('td');
                const currentRow = currentCell?.closest('tr');
                const nextInput = currentRow?.querySelector('input[data-col="4"]') as HTMLInputElement;
                if (nextInput && nextInput.disabled) {
                  const button = currentRow?.querySelector('button[data-reorder-row]') as HTMLButtonElement;
                  if (button) {
                    e.preventDefault();
                    button.focus();
                  }
                }
              }
            }}
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
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const updateTaskEndDate = useScheduleStore((state) => state.updateTaskEndDate);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const lanes = useScheduleStore((state) => state.lanes);
        const laneValue = info.row.original.lane;
        const hasLaneText = laneValue.trim() !== '' && laneValue.trim() !== '┗';
        const isDisabled = hasLaneText;
        
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
          // フォーカス時に現在の値を保存
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
          
          console.log('[EndDate] Initial:', initialValue, 'Current:', currentValue, 'Changed:', currentValue !== initialValue);
          
          // 値が変更された場合のみStoreに送信
          if (currentValue !== initialValue) {
            const order = rowData.order ?? rowIndex;
            const laneId = calculateLaneId(rowIndex, lanes);
            
            console.log('[EndDate] Sending to Store - Order:', order, 'EndDate:', currentValue, 'LaneId:', laneId);
            updateTaskEndDate(order, currentValue, laneId);
          }
        };
        
        return (
          <input
            type="text"
            value={info.getValue()}
            onChange={(e) => updateData(info.row.id, "endDate", e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              handleComplexGridKeyDown(e, info.row.id, 4, 5, addRowBelow, deleteRow);
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
            data-row-id={info.row.id}
            data-col={4}
            disabled={isDisabled}
            className={`w-full border-none outline-none px-0 focus:ring-0 ${isDisabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-transparent'}`}
          />
        );
      },
    }),
  ];
};
