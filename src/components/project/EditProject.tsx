"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { editProject } from "@/lib/actions/project/editProject"
import { ProjectEditProps } from "@/types/project"
import { useRouter } from "next/navigation"

export default function EditProject({
  open,
  onOpenChange,
  projectId,
  currentName,
}: ProjectEditProps ) {
  const [name, setName] = useState(currentName)
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>プロジェクト名の編集</DialogTitle>
          <DialogDescription>プロジェクトの新しい名前を入力してください。</DialogDescription>
        </DialogHeader>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="新しいプロジェクト名"
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            onClick={async () => {
              await editProject(projectId, name)
              onOpenChange(false)
              router.refresh()
            }}
          >
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
