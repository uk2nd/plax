"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteProject } from "@/lib/actions/project/deleteProject"
import { ProjectDeleteProps } from "@/types/project"

export default function DeleteProject({ open, onOpenChange, projectId }: ProjectDeleteProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>プロジェクトの削除</DialogTitle>
          <DialogDescription>この操作は取り消すことが出来ません。本当に削除しますか？</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await deleteProject(projectId)
              onOpenChange(false)
            }}
          >
            削除
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
