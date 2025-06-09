'use server'

import { prisma } from "@/lib/prisma"

export async function editProject(projectId: string, name: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { name },
  })
}
