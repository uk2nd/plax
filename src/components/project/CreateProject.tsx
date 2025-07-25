"use client"

import { createProject } from "@/lib/actions/project/createProject"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"
import { Plus } from "lucide-react"

export default function CreateProject() {
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const ref = useRef<HTMLFormElement>(null)

  return (
    <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" className="cursor-pointer">
          <Plus className="w-4 h-4 mr-1" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>プロジェクトの作成</DialogTitle>
          <DialogDescription>作成するプロジェクトの名称を入力してください。</DialogDescription>
        </DialogHeader>
        <form
          ref={ref}
          action={async (formData) => {
            await createProject(formData)
            ref.current?.reset()
            setCreateProjectOpen(false)
          }}
          className="flex justify-end space-x-2"
        >
          <Input name="name" placeholder="プロジェクトの名称を入力" required />
          <Button type="submit">作成</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
