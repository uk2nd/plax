import { PrismaClient } from "@prisma/client"

// グローバルスコープに Prisma クライアントを保存するための変数
// Next.js の開発環境ではファイルが何度も評価されるため、クライアントの多重生成を防止
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// PrismaClient のインスタンスを作成（すでに存在する場合はそれを使う）
// ログ出力オプションは必要に応じて削除・調整可能
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"], // デバッグ用のログ設定（不要であれば削除可）
  })

// 本番環境でなければグローバルに Prisma クライアントを保存して再利用
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
