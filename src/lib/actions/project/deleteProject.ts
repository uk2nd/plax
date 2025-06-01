'use server'

import { db } from "@/lib/db"

export async function deleteProject(projectId: string) {
  await db.project.delete({
    where: { id: projectId },
  })
}
