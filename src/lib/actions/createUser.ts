'use server'

import { registerSchema } from "@/validations/user" // 入力バリデーションスキーマ
import bcryptjs from "bcryptjs"                     // パスワードのハッシュ化ライブラリ
import { prisma } from "@/lib/prisma"               // Prismaクライアント（DB操作）
import { redirect } from "next/navigation"          // リダイレクト機能
import { signIn } from "@/auth"                      // 認証機能（next-authなど）
import { ZodError } from "zod"

// ユーザー作成処理の返却用型定義
type ActionState = {
    success: boolean
    errors: Record<string, string[]>
}

// バリデーションエラー発生時の処理
function handleValidationError(error: ZodError): ActionState {
    const { fieldErrors, formErrors } = error.flatten()

    // fieldErrorsにundefinedが入らないようにキャスト
    const castedFieldErrors = fieldErrors as Record<string, string[]>;

    // zodの仕様で confirmPassword の一致エラーは formErrors に格納される
    if (formErrors.length > 0) {
    return {
        success: false,
        errors: {
        ...fieldErrors,
        confirmPassword: formErrors, // confirmPassword フィールドとして追加
        },
    }
    }

    return {
    success: false,
    errors: castedFieldErrors,
    }
}

// カスタムエラー（例えば、既存メールなど）を返す関数
function handleError(customErrors: Record<string, string[]>): ActionState {
    return {
    success: false,
    errors: customErrors,
    }
}

// ユーザー登録処理本体
export async function createUser(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    // フォームデータをオブジェクトに変換
    const rawFormData = Object.fromEntries(
    ["name", "email", "password", "confirmPassword"].map((field) => [
        field,
        formData.get(field) as string,
    ])
) as Record<string, string>

    // 入力バリデーションを実行
    const validationResult = registerSchema.safeParse(rawFormData)
    if (!validationResult.success) {
    return handleValidationError(validationResult.error)
    }

    // 同一メールアドレスのユーザーが既に存在するか確認
    const existingUser = await prisma.user.findUnique({
    where: { email: rawFormData.email },
    })
    if (existingUser) {
    return handleError({
        email: ["このメールアドレスはすでに登録されています"],
    })
    }

    // パスワードをハッシュ化（セキュリティ対策）
    const hashedPassword = await bcryptjs.hash(rawFormData.password, 12)

    // データベースに新規ユーザーを作成
    await prisma.user.create({
    data: {
        name: rawFormData.name,
        email: rawFormData.email,
        password: hashedPassword,
    },
    })

    // サインイン処理（自動ログイン）
    await signIn("credentials", {
    ...Object.fromEntries(formData), // フォームデータを展開
    redirect: false, // 自動リダイレクトを無効化（明示的にredirect関数を使用する）
    })

    // ダッシュボードページへリダイレクト
    redirect("/dashboard")
}
