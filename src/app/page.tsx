"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* サイドバーと統一感のあるPlaxロゴ風スタイル */}
        <h1 className="text-3xl font-semibold text-slate-100 tracking-wide px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-800 rounded-lg shadow-md font-serif inline-block">
          Plaxへようこそ
        </h1>

        <p className="text-lg text-slate-600 mt-2 leading-relaxed">
          チームのスケジュールやタスクを効率的に管理できる<br />
          プロジェクト管理ツールです。
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link href="/login">
            <Button variant="default" className="w-full sm:w-auto cursor-pointer">
              ログイン
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="w-full sm:w-auto cursor-pointer">
              新規登録
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
