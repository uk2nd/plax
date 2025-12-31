import { format, parse } from "date-fns";

/**
 * 日付入力を yyyy/MM/dd 形式に補完する関数
 * 
 * 対応フォーマット:
 * - m/d → yyyy/MM/dd (現在年を補完)
 * - yyyy/m/d → yyyy/MM/dd (ゼロ埋め)
 * - yyyy/MM/dd → yyyy/MM/dd (そのまま)
 * 
 * @param input - 入力された日付文字列
 * @returns フォーマットされた日付文字列、またはパース失敗時は元の入力
 */
export const formatDateInput = (input: string): string => {
  if (!input || input.trim() === "") return "";

  const trimmed = input.trim();
  const currentYear = new Date().getFullYear();

  try {
    // 既に正しい形式の場合はそのまま返す
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
      const date = parse(trimmed, "yyyy/MM/dd", new Date());
      if (!isNaN(date.getTime())) {
        return format(date, "yyyy/MM/dd");
      }
    }

    // m/d 形式の場合
    if (/^\d{1,2}\/\d{1,2}$/.test(trimmed)) {
      const [month, day] = trimmed.split("/");
      const date = new Date(currentYear, parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return format(date, "yyyy/MM/dd");
      }
    }

    // yyyy/m/d 形式の場合
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("/");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return format(date, "yyyy/MM/dd");
      }
    }
  } catch (error) {
    // パース失敗時は元の値を返す
    return input;
  }

  // パースできない場合は元の値を返す
  return input;
};

/**
 * 期間文字列をパースして日数を返す
 * 
 * @param duration - 期間文字列（例: "3d", "5w", "7m"）
 * @returns 日数、またはパース失敗時は null
 */
export const parseDuration = (duration: string): number | null => {
  if (!duration || duration.trim() === "") return null;

  const trimmed = duration.trim();
  const match = trimmed.match(/^(\d+)(d|w|m)$/i);
  
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'd':
      return value;
    case 'w':
      return value * 7;
    case 'm':
      return value * 30;
    default:
      return null;
  }
};

/**
 * 2つの日付の差を日数で計算する
 * 
 * @param startDate - 開始日（yyyy/MM/dd 形式）
 * @param endDate - 終了日（yyyy/MM/dd 形式）
 * @returns 日数文字列（例: "7d"）、またはパース失敗時は null
 */
export const calculateDaysBetween = (startDate: string, endDate: string): string | null => {
  try {
    const start = parse(startDate, "yyyy/MM/dd", new Date());
    const end = parse(endDate, "yyyy/MM/dd", new Date());

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays}d`;
  } catch (error) {
    return null;
  }
};

/**
 * 開始日と期間から終了日を計算する
 * 
 * @param startDate - 開始日（yyyy/MM/dd 形式）
 * @param duration - 期間（例: "3d", "5w", "7m"）
 * @returns 終了日（yyyy/MM/dd 形式）、またはパース失敗時は null
 */
export const calculateEndDate = (startDate: string, duration: string): string | null => {
  try {
    const start = parse(startDate, "yyyy/MM/dd", new Date());
    const days = parseDuration(duration);

    if (isNaN(start.getTime()) || days === null) {
      return null;
    }

    const end = new Date(start);
    end.setDate(end.getDate() + days);

    return format(end, "yyyy/MM/dd");
  } catch (error) {
    return null;
  }
};

/**
 * 終了日と期間から開始日を計算する
 * 
 * @param endDate - 終了日（yyyy/MM/dd 形式）
 * @param duration - 期間（例: "3d", "5w", "7m"）
 * @returns 開始日（yyyy/MM/dd 形式）、またはパース失敗時は null
 */
export const calculateStartDate = (endDate: string, duration: string): string | null => {
  try {
    const end = parse(endDate, "yyyy/MM/dd", new Date());
    const days = parseDuration(duration);

    if (isNaN(end.getTime()) || days === null) {
      return null;
    }

    const start = new Date(end);
    start.setDate(start.getDate() - days);

    return format(start, "yyyy/MM/dd");
  } catch (error) {
    return null;
  }
};
