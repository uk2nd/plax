"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createPhase(formData: FormData, projectId: string) {
  const name = formData.get("name")?.toString().trim()
  if (!name) throw new Error("フェーズ名が空です")

  const count = await prisma.phase.count({ where: { projectId } })

  await prisma.phase.create({
    data: {
      name,
      projectId,
      sortOrder: count,
    },
  })

  revalidatePath(`/dashboard/${projectId}/schedule`)
}
