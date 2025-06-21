import { prisma } from "@/lib/prisma";
import { ScheduleProps } from "@/types/schedule";

export async function fetchScheduleData(projectId: string): Promise<ScheduleProps> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) throw new Error("Project not found");

  const phases = await prisma.phase.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
  });

  const tasks = await prisma.task.findMany({
    where: {
      phase: {
        projectId: projectId,
      },
    },
  });

  return {
    project,
    phases,
    tasks,
  };
}
