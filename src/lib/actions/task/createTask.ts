"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createTask(formData: FormData, phaseId: string, projectId: string) {
  const name = formData.get("name")?.toString().trim()
  const startDateStr = formData.get("startDate")?.toString()
  const endDateStr = formData.get("endDate")?.toString()

  if (!name || !startDateStr || !endDateStr) throw new Error("必要な情報が不足しています")

  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)

  await prisma.task.create({
    data: {
      name,
      startDate,
      endDate,
      phaseId,
    },
  })

  revalidatePath(`/dashboard/${projectId}/schedule`)
}
