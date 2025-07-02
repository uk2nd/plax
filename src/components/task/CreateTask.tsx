"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTask } from "@/lib/actions/task/createTask";
import { Plus } from "lucide-react";

type Props = {
  phaseId: string;
  projectId: string;
};

export default function CreateTask({ phaseId, projectId }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLFormElement>(null);

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (!v) setError(null); // ダイアログを閉じたらエラーリセット
    }}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" className="cursor-pointer">
          <Plus className="w-4 h-4 mr-1" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>タスクの作成</DialogTitle>
          <DialogDescription>タスク名と期間を入力してください。</DialogDescription>
        </DialogHeader>

        {/* ✅ エラーメッセージ表示 */}
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

            setError(null); // エラーをリセット

            await createTask(formData, phaseId, projectId);
            ref.current?.reset();
            setOpen(false);
          }}
          className="flex flex-col gap-2"
        >
          <Input name="name" placeholder="タスク名" required maxLength={30} />
          <Input name="startDate" type="date" required />
          <Input name="endDate" type="date" required />
          <div className="flex justify-end">
            <Button type="submit">作成</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
