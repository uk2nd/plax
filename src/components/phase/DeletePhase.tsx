"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deletePhase } from "@/lib/actions/phase/deletePhase"
import { PhaseDeleteProps } from "@/types/phase"
import { useRouter } from 'next/navigation'

export default function DeletePhase({ open, onOpenChange, phaseId }: PhaseDeleteProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>フェーズの削除</DialogTitle>
          <DialogDescription>本当に削除しますか？</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="destructive" onClick={async () => {
            await deletePhase(phaseId)
            onOpenChange(false)
            router.refresh()
          }}>削除</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
