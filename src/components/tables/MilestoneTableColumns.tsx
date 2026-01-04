import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { formatDateInput } from "@/src/utils/dateFormat";
import { TABLE_INPUT_CLASSES } from "@/src/constants/tableStyles";
import { useScheduleStore } from "@/src/stores/scheduleStore";

export type Milestone = {
  name: string;
  date: string;
  order?: number;
};

type MilestoneColumnOptions = {
  updateData: (rowIndex: number, columnId: string, value: string) => void;
  handleSimpleGridKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number,
    totalCols: number,
    addRowBelow?: (rowId: string) => void,
    deleteRow?: (rowId: string) => void
  ) => void;
  addRowBelow: (rowId: string) => void;
  deleteRow: (rowId: string) => void;
};

export const createMilestoneColumns = ({
  updateData,
  handleSimpleGridKeyDown,
  addRowBelow,
  deleteRow,
}: MilestoneColumnOptions): ColumnDef<Milestone, any>[] => {
  const columnHelper = createColumnHelper<Milestone>();

  return [
    columnHelper.accessor("name", {
      header: "マイルストン",
      cell: (info) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const updateMilestoneName = useScheduleStore((state) => state.updateMilestoneName);
        
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
          // フォーカス時に現在の値を保存
          e.currentTarget.dataset.initialValue = e.currentTarget.value;
        };
        
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          const row = info.row.original;
          const currentValue = row.name;
          const initialValue = e.currentTarget.dataset.initialValue || '';
          
          console.log('[Milestone Name] Initial:', initialValue, 'Current:', currentValue, 'Changed:', currentValue !== initialValue);
          
          // 値が変更された場合のみStoreに送信
          if (currentValue !== initialValue) {
            const order = row.order ?? info.row.index;
            console.log('[Milestone Name] Sending to Store - Order:', order, 'Name:', row.name);
            updateMilestoneName(order, row.name);
          }
        };
        
        return (
          <input
            type="text"
            value={info.getValue()}
            onChange={(e) =>
              updateData(info.row.index, info.column.id, e.target.value)
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(e) => handleSimpleGridKeyDown(e, info.row.index, 0, 2, addRowBelow, deleteRow)}
            data-row={info.row.index}
            data-col={0}
            className={TABLE_INPUT_CLASSES}
          />
        );
      },
    }),
    columnHelper.accessor("date", {
      header: "日付",
      cell: (info) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const updateMilestoneDate = useScheduleStore((state) => state.updateMilestoneDate);
        
        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
          // フォーカス時に現在の値を保存
          e.currentTarget.dataset.initialValue = e.currentTarget.value;
        };
        
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
          const formatted = formatDateInput(e.target.value);
          if (formatted !== e.target.value) {
            updateData(info.row.index, info.column.id, formatted);
          }
          
          const row = info.row.original;
          const currentValue = formatted || row.date;
          const initialValue = e.currentTarget.dataset.initialValue || '';
          
          console.log('[Milestone Date] Initial:', initialValue, 'Current:', currentValue, 'Changed:', currentValue !== initialValue);
          
          // 値が変更された場合のみStoreに送信
          if (currentValue !== initialValue) {
            const order = row.order ?? info.row.index;
            console.log('[Milestone Date] Sending to Store - Order:', order, 'Date:', currentValue);
            updateMilestoneDate(order, currentValue);
          }
        };
        
        return (
          <input
            type="text"
            value={info.getValue()}
            onChange={(e) =>
              updateData(info.row.index, info.column.id, e.target.value)
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
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
        );
      },
    }),
  ];
};
