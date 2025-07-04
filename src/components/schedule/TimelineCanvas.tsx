"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Stage, Layer, Line, Text, Rect } from "react-konva";
import { ScheduleProps, MonthLabel, DayLabel } from "@/types/schedule";
import {
  PHASE_TASK_HEIGHT,
  DATE_HEIGHT,
  DAY_WIDTH,
  MONTH_LINE_Y,
  DAY_LINE_Y,
} from "@/constants/scheduleLayout";
import { Fragment } from "react";
import EditTask from "@/components/task/EditTask";
import { Task } from "@prisma/client";

export function TimelineCanvas({ phases, tasks }: ScheduleProps) {
  const startYear = 2025;
  const [totalYears, setTotalYears] = useState(2);
  const canvasHeight = phases.length * PHASE_TASK_HEIGHT + DATE_HEIGHT;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1000);

  useEffect(() => {
    const updateWidth = () => {
      setViewportWidth(window.innerWidth * 0.9);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { scrollLeft, scrollWidth, clientWidth } = container;
          setScrollLeft(scrollLeft);
          const nearEnd = scrollLeft + clientWidth >= scrollWidth - 30;
          if (nearEnd) {
            setTotalYears((prev) => prev + 1);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  const isLeapYear = (year: number) =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  const getMonthDays = (year: number): number[] => [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  const { monthLabels, dayLabels, canvasWidth } = useMemo(() => {
    const monthLabels: MonthLabel[] = [];
    const dayLabels: DayLabel[] = [];
    let currentX = 0;

    for (let y = 0; y < totalYears; y++) {
      const year = startYear + y;
      const months = getMonthDays(year);

      months.forEach((days, m) => {
        monthLabels.push({ year, month: m + 1, x: currentX });
        for (let d = 1; d <= days; d++) {
          dayLabels.push({
            year,
            month: m + 1,
            day: d,
            x: currentX + (d - 1) * DAY_WIDTH,
          });
        }
        currentX += days * DAY_WIDTH;
      });
    }

    return { monthLabels, dayLabels, canvasWidth: currentX };
  }, [totalYears]);

  const visibleStart = scrollLeft;
  const visibleEnd = scrollLeft + viewportWidth;

  const visibleMonths = monthLabels.filter(
    ({ x }) => x < visibleEnd && x + 30 * DAY_WIDTH > visibleStart
  );

  const visibleDays = dayLabels.filter(
    ({ x }) => x < visibleEnd && x + DAY_WIDTH > visibleStart
  );

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <div ref={containerRef} className="flex-1 overflow-scroll">
      <Stage width={canvasWidth} height={canvasHeight}>
        <Layer>
          {/* グリッド線 */}
          <Line points={[0, 15, canvasWidth, MONTH_LINE_Y]} stroke="gray" strokeWidth={1} />
          <Line points={[0, 30, canvasWidth, DAY_LINE_Y]} stroke="gray" strokeWidth={1} />

          {visibleDays.map(({ x }, index) => (
            <Line
              key={`vline-${index}`}
              points={[x, DATE_HEIGHT, x, canvasHeight]}
              stroke="#e0e0e0"
              strokeWidth={1}
              dash={[2, 2]}
            />
          ))}

          {phases.map((_, index) => {
            const y = DATE_HEIGHT + index * PHASE_TASK_HEIGHT;
            return (
              <Line
                key={`hline-${index}`}
                points={[0, y, canvasWidth, y]}
                stroke="#d0d0d0"
                strokeWidth={1}
              />
            );
          })}

          <Line
            key="hline-last"
            points={[
              0,
              DATE_HEIGHT + phases.length * PHASE_TASK_HEIGHT,
              canvasWidth,
              DATE_HEIGHT + phases.length * PHASE_TASK_HEIGHT,
            ]}
            stroke="#d0d0d0"
            strokeWidth={1}
          />

          {/* 月・日付ラベル */}
          {visibleMonths.map(({ year, month, x }) => (
            <Text
              key={`month-${year}-${month}`}
              text={`${year}/${month}`}
              x={x + 4}
              y={MONTH_LINE_Y + 2}
              fontSize={12}
              fill="black"
            />
          ))}

          {visibleDays.map(({ day, x, year, month }) => (
            <Text
              key={`day-${year}-${month}-${day}`}
              text={`${day}`}
              x={x + 2}
              y={DAY_LINE_Y + 2}
              fontSize={10}
              fill="black"
            />
          ))}

          {/* タスクの描画 */}
          {tasks.map((task) => {
            const phaseIndex = phases.findIndex((p) => p.id === task.phaseId);
            if (phaseIndex === -1) return null;

            const start = new Date(task.startDate);
            const end = new Date(task.endDate);

            const startLabel = dayLabels.find(
              (d) =>
                d.year === start.getFullYear() &&
                d.month === start.getMonth() + 1 &&
                d.day === start.getDate()
            );
            const endLabel = dayLabels.find(
              (d) =>
                d.year === end.getFullYear() &&
                d.month === end.getMonth() + 1 &&
                d.day === end.getDate()
            );

            if (!startLabel || !endLabel) return null;

            const startX = startLabel.x;
            const endX = endLabel.x + DAY_WIDTH;

            if (startX > visibleEnd || endX < visibleStart) return null;

            const y = DATE_HEIGHT + phaseIndex * PHASE_TASK_HEIGHT + 5;

            return (
              <Fragment key={task.id}>
                <Rect
                  x={startX}
                  y={y}
                  width={Math.max(endX - startX, DAY_WIDTH)}
                  height={PHASE_TASK_HEIGHT - 10}
                  fill="#60a5fa"
                  cornerRadius={4}
                  shadowBlur={2}
                  onClick={() => {
                    setSelectedTask(task);
                    setEditDialogOpen(true);
                  }}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = "pointer";
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = "default";
                  }}
                />
                <Text
                  text={task.name}
                  x={startX + 4}
                  y={y + 6}
                  fontSize={12}
                  fill="white"
                  wrap="none"
                />
              </Fragment>
            );
          })}
        </Layer>
      </Stage>
      {selectedTask && (
        <EditTask
          task={selectedTask}
          projectId={phases[0]?.projectId ?? ""}
          open={editDialogOpen}
          onOpenChange={(v) => {
            setEditDialogOpen(v);
            if (!v) setSelectedTask(null); // 閉じたときに状態リセット
          }}
        />
      )}
    </div>
  );
}
