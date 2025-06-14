"use server" // Server Action として動作することを明示（Next.js の機能）

import { auth } from "@/auth" // 認証セッション情報を取得するための関数
import { prisma } from "@/lib/prisma" // Prisma Client をインポート
import { revalidatePath } from "next/cache" // キャッシュされたページを再検証するための関数
import { UserRole } from "@prisma/client" // enum型（admin, editor, viewer）をインポート

// プロジェクト作成処理を行う Server Action 関数
export async function createProject(formData: FormData) {
  // フォームから送信されたプロジェクト名を取得・整形
  const name = formData.get("name")?.toString().trim()

  // 現在のセッション情報（ログインユーザー）を取得
  const session = await auth()

  // ユーザーがログインしていない、またはプロジェクト名が空ならエラー
  if (!session?.user?.email || !name) {
    throw new Error("認証または入力エラー")
  }

  // メールアドレスをもとにDBからユーザー情報を取得
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  // 万が一ユーザーが見つからない場合はエラー
  if (!user) throw new Error("ユーザーが存在しません")

  // プロジェクトを作成し、同時に UserProject テーブルに関連レコードを追加
  const project = await prisma.project.create({
    data: {
      name,
      userProjects: {
        create: {
          userId: user.id,         // プロジェクト作成者のID
          role: UserRole.admin,    // 自動的にadmin権限を付与
        },
      },
    },
  })

  // プロジェクト一覧が表示されるパスを再検証し、最新情報を反映
  revalidatePath("/dashboard") // 必要に応じてパスを変更可能
}
