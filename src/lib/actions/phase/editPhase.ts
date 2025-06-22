"use server"

import { prisma } from "@/lib/prisma"

export async function editPhase(phaseId: string, name: string) {
  await prisma.phase.update({
    where: { id: phaseId },
    data: { name },
  })
}
