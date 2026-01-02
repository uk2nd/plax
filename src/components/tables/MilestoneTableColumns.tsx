import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { formatDateInput } from "@/src/utils/dateFormat";
import { TABLE_INPUT_CLASSES } from "@/src/constants/tableStyles";

export type Milestone = {
  name: string;
  date: string;
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
  ];
};
