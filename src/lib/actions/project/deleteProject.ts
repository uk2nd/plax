'use server'

import { prisma } from "@/lib/prisma"

export async function deleteProject(projectId: string) {
  await prisma.project.delete({
    where: { id: projectId },
  })
}
