import { KeyboardEvent } from "react";

/**
 * テーブルセルのキーボードナビゲーションを提供するカスタムフック
 */
export const useTableKeyboardNavigation = () => {
  /**
   * シンプルなグリッド用のキーボードナビゲーションハンドラー
   * （行番号ベースのテーブル用）
   */
  const handleSimpleGridKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number,
    totalCols: number,
    addRowBelow?: (rowId: string) => void,
    deleteRow?: (rowId: string) => void
  ) => {
    const input = e.currentTarget;
    let nextRow = rowIndex;
    let nextCol = colIndex;

    // Ctrl + Shift + K で行を削除
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyK') {
      e.preventDefault();
      if (deleteRow) {
        deleteRow(String(rowIndex));
        // 削除後、次の行の同じ列にフォーカスを移動
        setTimeout(() => {
          const nextInput = document.querySelector(
            `input[data-row="${rowIndex}"][data-col="${colIndex}"]`
          ) as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
            nextInput.select();
          }
        }, 50);
      }
      return;
    }

    // Ctrl + Enter で行を追加
    if (e.ctrlKey && !e.shiftKey && e.code === 'Enter') {
      e.preventDefault();
      if (addRowBelow) {
        addRowBelow(String(rowIndex));
        // 新しい行の同じ列にフォーカスを移動
        setTimeout(() => {
          const nextInput = document.querySelector(
            `input[data-row="${rowIndex + 1}"][data-col="${colIndex}"]`
          ) as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
            nextInput.select();
          }
        }, 50);
      }
      return;
    }

    switch (e.key) {
      case "ArrowRight":
        // カーソルが文字列の末尾にいて、選択範囲がない場合のみセル移動
        if (
          input.selectionStart === input.value.length &&
          input.selectionStart === input.selectionEnd &&
          nextCol < totalCols - 1
        ) {
          nextCol++;
          e.preventDefault();
        } else {
          return; // デフォルトのカーソル移動を許可
        }
        break;
      case "ArrowLeft":
        // カーソルが文字列の先頭にいて、選択範囲がない場合のみセル移動
        if (
          input.selectionStart === 0 &&
          input.selectionStart === input.selectionEnd &&
          nextCol > 0
        ) {
          nextCol--;
          e.preventDefault();
        } else {
          return; // デフォルトのカーソル移動を許可
        }
        break;
      case "ArrowDown":
      case "Enter":
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

  /**
   * 複雑なグリッド用のキーボードナビゲーションハンドラー
   * （rowIdベースのテーブル用、階層構造にも対応）
   */
  const handleComplexGridKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    rowId: string,
    colIndex: number,
    totalCols: number,
    addRowBelow?: (rowId: string) => void,
    deleteRow?: (rowId: string) => void
  ) => {
    const input = e.currentTarget;
    let nextColIndex = colIndex;

    // Ctrl + Shift + K で行を削除
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyK') {
      e.preventDefault();
      if (deleteRow) {
        deleteRow(rowId);
        // 削除後、次の行の同じ列にフォーカスを移動
        setTimeout(() => {
          const allInputs = Array.from(
            document.querySelectorAll("input[data-row-id][data-col]")
          ) as HTMLInputElement[];
          const currentIndex = allInputs.findIndex(
            (input) => input.dataset.rowId === rowId && input.dataset.col === String(colIndex)
          );
          if (currentIndex !== -1 && allInputs[currentIndex]) {
            for (let i = currentIndex; i < allInputs.length; i++) {
              if (allInputs[i].dataset.col === String(colIndex) && !allInputs[i].disabled) {
                allInputs[i].focus();
                allInputs[i].select();
                break;
              }
            }
          }
        }, 50);
      }
      return;
    }

    // Ctrl + Enter で行を追加
    if (e.ctrlKey && !e.shiftKey && e.code === 'Enter') {
      e.preventDefault();
      if (addRowBelow) {
        addRowBelow(rowId);
        // 新しい行の同じ列にフォーカスを移動
        setTimeout(() => {
          const allInputs = Array.from(
            document.querySelectorAll("input[data-row-id][data-col]")
          ) as HTMLInputElement[];
          const currentIndex = allInputs.findIndex(
            (input) => input.dataset.rowId === rowId && input.dataset.col === String(colIndex)
          );
          if (currentIndex !== -1 && allInputs[currentIndex + 1]) {
            for (let i = currentIndex + 1; i < allInputs.length; i++) {
              if (allInputs[i].dataset.col === String(colIndex) && !allInputs[i].disabled) {
                allInputs[i].focus();
                allInputs[i].select();
                break;
              }
            }
          }
        }, 50);
      }
      return;
    }

    switch (e.key) {
      case "ArrowRight":
        // カーソルが文字列の末尾にいて、選択範囲がない場合のみセル移動
        if (
          input.selectionStart === input.value.length &&
          input.selectionStart === input.selectionEnd &&
          nextColIndex < totalCols - 1
        ) {
          nextColIndex++;
          e.preventDefault();
        } else {
          return; // デフォルトのカーソル移動を許可
        }
        break;
      case "ArrowLeft":
        // カーソルが文字列の先頭にいて、選択範囲がない場合のみセル移動
        if (
          input.selectionStart === 0 &&
          input.selectionStart === input.selectionEnd &&
          nextColIndex > 0
        ) {
          nextColIndex--;
          e.preventDefault();
        } else {
          return; // デフォルトのカーソル移動を許可
        }
        break;
      case "ArrowDown":
      case "Enter":
      case "ArrowUp": {
        e.preventDefault();
        // 現在の行の次/前の行を探す
        const allInputs = Array.from(
          document.querySelectorAll("input[data-row-id][data-col]")
        ) as HTMLInputElement[];

        const currentIndex = allInputs.findIndex(
          (input) => input.dataset.rowId === rowId && input.dataset.col === String(colIndex)
        );

        if (currentIndex === -1) return;

        // 同じ列で次/前の行を探す（非活性セルをスキップ）
        let targetIndex = currentIndex;
        if (e.key === "ArrowDown" || e.key === "Enter") {
          // 次の同じ列の有効なセルを探す
          for (let i = currentIndex + 1; i < allInputs.length; i++) {
            if (allInputs[i].dataset.col === String(colIndex) && !allInputs[i].disabled) {
              targetIndex = i;
              break;
            }
          }
        } else {
          // 前の同じ列の有効なセルを探す
          for (let i = currentIndex - 1; i >= 0; i--) {
            if (allInputs[i].dataset.col === String(colIndex) && !allInputs[i].disabled) {
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

  return {
    handleSimpleGridKeyDown,
    handleComplexGridKeyDown,
  };
};
