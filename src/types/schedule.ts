import { Project, Phase, Task } from "@prisma/client";

export type ScheduleProps = {
  project: Project;
  phases: Phase[];
  tasks: Task[];
};

export type MonthLabel = {
  year: number;
  month: number;
  x: number;
};

export type DayLabel = {
  year: number;
  month: number;
  day: number;
  x: number;
};