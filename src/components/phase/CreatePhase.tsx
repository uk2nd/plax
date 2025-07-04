"use client"

import { useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createPhase } from "@/lib/actions/phase/createPhase"
import { Plus } from "lucide-react"

export default function CreatePhase({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLFormElement>(null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" className="cursor-pointer">
          <Plus className="w-4 h-4 mr-1" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>フェーズの作成</DialogTitle>
          <DialogDescription>新しいフェーズ名を入力してください。</DialogDescription>
        </DialogHeader>
        <form
          ref={ref}
          action={async (formData) => {
            await createPhase(formData, projectId)
            ref.current?.reset()
            setOpen(false)
          }}
          className="flex justify-end space-x-2"
        >
          <Input name="name" placeholder="フェーズ名" required />
          <Button type="submit">作成</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
