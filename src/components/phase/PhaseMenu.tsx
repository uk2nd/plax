"use client"

import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import EditPhase from "@/components/phase/EditPhase"
import DeletePhase from "@/components/phase/DeletePhase"
import { PhaseMenuProps } from "@/types/phase"

export default function PhaseMenu({ phaseId, phaseName }: PhaseMenuProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label={`フェーズ操作メニュー: ${phaseName}`}>
          <MoreHorizontal className="w-4 h-4 cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setTimeout(() => setEditOpen(true), 0)}>編集</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTimeout(() => setDeleteOpen(true), 0)}>削除</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditPhase open={editOpen} onOpenChange={setEditOpen} phaseId={phaseId} currentName={phaseName} />
      <DeletePhase open={deleteOpen} onOpenChange={setDeleteOpen} phaseId={phaseId} />
    </>
  )
}
