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
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none"  aria-label={`プロジェクト操作メニュー: ${projectName}`}>
          <MoreHorizontal className="w-4 h-4 cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setTimeout(() => setEditProjectOpen(true), 0)
            }}>
            編集
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setTimeout(() => setDeleteProjectOpen(true), 0)
            }}
          >
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditProject
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        projectId={projectId}
        currentName={projectName}
      />
      <DeleteProject
        open={deleteProjectOpen}
        onOpenChange={setDeleteProjectOpen}
        projectId={projectId}
      />
    </>
  )
}
