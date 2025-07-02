"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { editTask } from "@/lib/actions/task/editTask";
import { Task } from "@prisma/client";
import { Pencil } from "lucide-react";

type Props = {
  task: Task;
  projectId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function EditTask({ task, projectId, open: controlledOpen, onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;

  const actualOpen = isControlled ? controlledOpen : open;
  const setActualOpen = isControlled ? onOpenChange! : setOpen;

  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLFormElement>(null);

  return (
    <Dialog open={actualOpen} onOpenChange={(v) => {
      setActualOpen(v);
      if (!v) setError(null);
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>タスクの編集</DialogTitle>
          <DialogDescription>タスク名と期間を更新できます。</DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-red-500 px-1 mb-2">
            {error}
          </p>
        )}

        <form
          ref={ref}
          action={async (formData) => {
            const name = formData.get("name")?.toString().trim();
            const startDateStr = formData.get("startDate")?.toString();
            const endDateStr = formData.get("endDate")?.toString();

            if (!name || !startDateStr || !endDateStr) {
              setError("全ての項目を入力してください");
              return;
            }

            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);

            if (startDate > endDate) {
              setError("終了日は開始日より後に設定してください");
              return;
            }

            await editTask(task.id, formData, projectId);
            ref.current?.reset();
            setActualOpen(false);
          }}
          className="flex flex-col gap-2"
        >
          <Input name="name" defaultValue={task.name} placeholder="タスク名" required maxLength={30} />
          <Input name="startDate" type="date" defaultValue={task.startDate.toISOString().split("T")[0]} required />
          <Input name="endDate" type="date" defaultValue={task.endDate.toISOString().split("T")[0]} required />
          <div className="flex justify-end">
            <Button type="submit">保存</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
