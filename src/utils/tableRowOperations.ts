/**
 * テーブル行の操作（追加・削除・移動）に関するユーティリティ関数
 */

/**
 * 行を追加する関数（指定した行の下に空行を追加）
 */
export const addRowBelow = <T>(
  data: T[],
  rowId: string,
  createEmptyRow: () => T
): T[] => {
  const newData = [...data];
  const rowIndex = parseInt(rowId);
  
  if (!isNaN(rowIndex) && rowIndex >= 0 && rowIndex < newData.length) {
    newData.splice(rowIndex + 1, 0, createEmptyRow());
  }
  
  return newData;
};

/**
 * 行を削除する関数（最低1行は残す）
 */
export const deleteRow = <T>(data: T[], rowId: string): T[] => {
  const newData = [...data];
  const rowIndex = parseInt(rowId);
  
  if (!isNaN(rowIndex) && rowIndex >= 0 && rowIndex < newData.length && newData.length > 1) {
    newData.splice(rowIndex, 1);
  }
  
  return newData;
};

/**
 * 行を移動する関数
 */
export const moveRow = <T>(data: T[], fromIndex: number, toIndex: number): T[] => {
  const newData = [...data];
  const [movedRow] = newData.splice(fromIndex, 1);
  newData.splice(toIndex, 0, movedRow);
  return newData;
};

/**
 * 最後の行にデータがあるかチェックし、必要に応じて新しい空行を追加
 */
export const addEmptyRowIfNeeded = <T>(
  data: T[],
  updatedRowIndex: number,
  hasDataChecker: (row: T) => boolean,
  createEmptyRow: () => T
): T[] => {
  const lastRowIndex = data.length - 1;
  
  if (updatedRowIndex === lastRowIndex) {
    const lastRow = data[lastRowIndex];
    
    if (hasDataChecker(lastRow)) {
      return [...data, createEmptyRow()];
    }
  }
  
  return data;
};
