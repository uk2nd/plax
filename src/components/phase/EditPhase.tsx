"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { editPhase } from "@/lib/actions/phase/editPhase"
import { PhaseEditProps } from "@/types/phase"
import { useRouter } from "next/navigation"

export default function EditPhase({ open, onOpenChange, phaseId, currentName }: PhaseEditProps) {
  const [name, setName] = useState(currentName)
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>フェーズ名の編集</DialogTitle>
          <DialogDescription>新しい名前を入力してください。</DialogDescription>
        </DialogHeader>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={async () => {
            await editPhase(phaseId, name)
            onOpenChange(false)
            router.refresh()
          }}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
