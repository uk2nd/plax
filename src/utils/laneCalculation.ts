import { Lane } from "@/src/stores/scheduleStore";

/**
 * 指定されたorderに対して、そのタスクが属するレーンのIDを計算する
 * レーンテーブルのorderとレーンのデータから、一番近い上のレーンを探す
 * 
 * @param taskOrder タスクのorder
 * @param lanes すべてのレーン情報（orderでソート済み推奨）
 * @returns レーンID、見つからない場合は空文字列
 */
export const calculateLaneId = (taskOrder: number, lanes: Lane[]): string => {
  // orderでソートしたレーンを作成
  const sortedLanes = [...lanes].sort((a, b) => a.order - b.order);
  
  // taskOrderより小さいorderのレーンを探す（降順）
  for (let i = sortedLanes.length - 1; i >= 0; i--) {
    if (sortedLanes[i].order < taskOrder) {
      return sortedLanes[i].id;
    }
  }
  
  // 見つからない場合は空文字列
  return '';
};
