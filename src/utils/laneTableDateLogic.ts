import {
  calculateDaysBetween,
  calculateEndDate,
  calculateStartDate,
} from "@/src/utils/dateFormat";
import { TaskRow } from "../components/tables/LaneTableColumns";

/**
 * レーンテーブルの日付自動補完ロジック
 */
export const applyDateAutoCompletion = (
  currentRow: TaskRow,
  columnId: string,
  value: string
): void => {
  // レーンに文字が入力された場合（「┗」以外）、タスク・開始日・期間・終了日を空欄にする
  if (columnId === 'lane' && value.trim() !== '' && value.trim() !== '┗') {
    currentRow.task = '';
    currentRow.startDate = '';
    currentRow.duration = '';
    currentRow.endDate = '';
  }

  // タスク・開始日・期間・終了日に文字が入力された場合、レーンに「┗」を自動入力
  if (['task', 'startDate', 'duration', 'endDate'].includes(columnId) && value.trim() !== '') {
    if (currentRow.lane.trim() === '') {
      currentRow.lane = '┗';
    }
  }

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
};
