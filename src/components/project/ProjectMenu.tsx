"use client"

import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { ProjectMenuProps } from "@/types/project"
import EditProject from "@/components/project/EditProject"
import DeleteProject from "@/components/project/DeleteProject"

export default function ProjectMenu({
  projectId,
  projectName
}: ProjectMenuProps ) {
  const [editOpen, setEditOpen] = useState(false)
  const [open, setOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <MoreHorizontal className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setTimeout(() => setEditOpen(true), 0)
            }}>
            編集
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setTimeout(() => setOpen(true), 0)
            }}
          >
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditProject
        open={editOpen}
        onOpenChange={setEditOpen}
        projectId={projectId}
        currentName={projectName}
      />
      <DeleteProject
        open={open}
        onOpenChange={setOpen}
        projectId={projectId}
      />
    </>
  )
}
