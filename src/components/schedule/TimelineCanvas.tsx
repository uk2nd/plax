"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Stage, Layer, Line, Text } from "react-konva";
import { ScheduleProps, MonthLabel, DayLabel } from "@/types/schedule";

export function TimelineCanvas({ project, phases, tasks }: ScheduleProps) {
  const startYear = 2025;
  const [totalYears, setTotalYears] = useState(2); // 初期表示する年数
  const dayWidth = 30;
  const dateHeight = 15;
  const taskHeight = 50;
  const canvasHeight = 1000; // タスク数に応じて要変更

  const containerRef = useRef<HTMLDivElement>(null); // スクロール可能なDIVの参照
  const [scrollLeft, setScrollLeft] = useState(0); // 現在のスクロール位置（左方向）
  const [viewportWidth, setViewportWidth] = useState(1000); // 表示領域の幅（初期は仮）

  // ✅ ウィンドウサイズが変更された時に表示領域の幅を更新
  useEffect(() => {
    const updateWidth = () => {
      setViewportWidth(window.innerWidth * 0.9); // ウィンドウ幅の90%を使用
    };

    updateWidth(); // 初期値を設定

    window.addEventListener("resize", updateWidth); // リサイズ時に更新
    return () => window.removeEventListener("resize", updateWidth); // クリーンアップ
  }, []);

  // ✅ スクロールイベントに応じて状態を更新（パフォーマンスを考慮してrequestAnimationFrameを使用）
  useEffect(() => {
    let ticking = false; // イベント連打による負荷を防ぐフラグ

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      if (!ticking) {
        // ブラウザの次の描画タイミングで実行
        window.requestAnimationFrame(() => {
          const { scrollLeft, scrollWidth, clientWidth } = container;
          setScrollLeft(scrollLeft); // 現在のスクロール位置を保存

          const nearEnd = scrollLeft + clientWidth >= scrollWidth - 30; // 右端近くまでスクロールしたか
          if (nearEnd) {
            setTotalYears((prev) => prev + 1); // 年数を1年分追加（無限スクロール）
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll); // スクロール監視
    return () => container?.removeEventListener("scroll", handleScroll); // クリーンアップ
  }, []);

  // 閏年の判定関数
  const isLeapYear = (year: number) =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  // 各月の日数を返す関数（閏年対応）
  const getMonthDays = (year: number): number[] => [
    31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
  ];

  // ✅ 月・日ラベルおよびキャンバスの総幅を計算（必要なときのみ再計算）
  const { monthLabels, dayLabels, canvasWidth } = useMemo(() => {
    const monthLabels: MonthLabel[] = []; // 月ラベル（1月〜12月）
    const dayLabels: DayLabel[] = []; // 日ラベル（1日〜31日）
    let currentX = 0; // ラベルの描画位置（横方向）

    for (let y = 0; y < totalYears; y++) {
      const year = startYear + y;
      const months = getMonthDays(year); // 月ごとの日数

      months.forEach((days, m) => {
        // 月ラベルを追加
        monthLabels.push({ year, month: m + 1, x: currentX });

        // 日ラベルを追加
        for (let d = 1; d <= days; d++) {
          dayLabels.push({
            year,
            month: m + 1,
            day: d,
            x: currentX + (d - 1) * dayWidth,
          });
        }

        // 次の月のX座標を更新
        currentX += days * dayWidth;
      });
    }

    return { monthLabels, dayLabels, canvasWidth: currentX };
  }, [totalYears]);

  // 現在のスクロール位置に基づいて、表示すべき領域の開始と終了位置を計算
  const visibleStart = scrollLeft;
  const visibleEnd = scrollLeft + viewportWidth;

  // ✅ 表示領域に入っている月のみをフィルタリング（描画コストを削減）
  const visibleMonths = monthLabels.filter(
    ({ x }) => x < visibleEnd && x + 30 * dayWidth > visibleStart
  );

  // ✅ 表示領域に入っている日だけを表示（不要な描画を回避）
  const visibleDays = dayLabels.filter(
    ({ x }) => x < visibleEnd && x + dayWidth > visibleStart
  );

  return (
    // ✅ キャンバスを包むスクロール可能なコンテナ
    <div ref={containerRef} className="w-[90vw] h-[90vh] overflow-scroll">
      {/* Konvaのキャンバス要素（Stage） */}
      <Stage width={canvasWidth} height={canvasHeight}>
        <Layer>
          {/* 月ラベルと日ラベルの下線 */}
          <Line points={[0, 15, canvasWidth, 15]} stroke="gray" strokeWidth={1} />
          <Line points={[0, 30, canvasWidth, 30]} stroke="gray" strokeWidth={1} />

          {/* 月のラベル（例：2025/4）を表示 */}
          {visibleMonths.map(({ year, month, x }) => (
            <Text
              key={`month-${year}-${month}`}
              text={`${year}/${month}`}
              x={x + 4}
              y={17}
              fontSize={12}
              fill="black"
            />
          ))}

          {/* 日付のラベル（例：15）を表示 */}
          {visibleDays.map(({ year, month, day, x }) => (
            <Text
              key={`day-${year}-${month}-${day}`}
              text={`${day}`}
              x={x + 2}
              y={32}
              fontSize={10}
              fill="black"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
