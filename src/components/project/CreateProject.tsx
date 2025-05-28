"use client"

import { createProject } from "@/lib/actions/createProject"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
          <DialogTitle>プロジェクトを作成</DialogTitle>
        </DialogHeader>
        <form
          ref={ref}
          action={async (formData) => {
            await createProject(formData)
            ref.current?.reset()
          }}
          className="space-y-4"
        >
          <Input name="name" placeholder="プロジェクト名を入力" required />
          <Button type="submit">作成</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
