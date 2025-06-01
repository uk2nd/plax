"use client"

import { createProject } from "@/lib/actions/project/createProject"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRef } from "react"

export default function CreateProject() {
  const ref = useRef<HTMLFormElement>(null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
          + プロジェクトを作成
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
          }}
          className="space-y-4"
        >
          <Input name="name" placeholder="プロジェクトの名称を入力" required />
          <Button type="submit">作成</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
