"use server"

import { prisma } from "@/lib/prisma"

export async function deletePhase(phaseId: string) {
  await prisma.phase.delete({
    where: { id: phaseId },
  })
}
