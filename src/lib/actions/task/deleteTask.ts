"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteTask(taskId: string, projectId: string) {
  await prisma.task.delete({
    where: { id: taskId },
  });

  revalidatePath(`/dashboard/${projectId}/schedule`);
}
