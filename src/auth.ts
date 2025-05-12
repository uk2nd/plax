// NextAuth の主機能をインポート（認証の初期化、関数提供など）
import NextAuth from 'next-auth';

// 認証設定（リダイレクト先やコールバックなど）をインポート
import { authConfig } from './auth.config';

// 認証プロバイダの一つである Credentials（メールアドレス＋パスワード認証）を使用
import Credentials from 'next-auth/providers/credentials';

// 入力のバリデーションに使用する Zod ライブラリをインポート
import { z } from 'zod';

// Prisma ORM を使用してデータベースにアクセス
import { prisma } from './lib/prisma';

// パスワードのハッシュ照合に使用する bcryptjs をインポート
import bcryptjs from 'bcryptjs';

// 指定されたメールアドレスに一致するユーザーをデータベースから取得する関数
async function getUser(email: string) {
    return await prisma.user.findUnique({
        where: { email: email }
    });
}

// NextAuth の初期化と各種関数のエクスポート
export const { auth, signIn, signOut, handlers } = NextAuth({
    // auth.config.ts の内容を展開（ページ設定・コールバックなど）
    ...authConfig,

    // 認証プロバイダの設定
    providers: [
        Credentials({
            // 認証処理（ログイン処理）を定義
            async authorize(credentials) {
                // 入力された認証情報（credentials）をZodでバリデーション
                const parsedCredentials = z
                    .object({
                        email: z.string().email(),      // 正しいメール形式か
                        password: z.string().min(8)     // パスワードは8文字以上
                    })
                    .safeParse(credentials);

                // バリデーションが成功した場合
                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    // メールアドレスからユーザーを取得
                    const user = await getUser(email);
                    if (!user) return null; // ユーザーが存在しなければ認証失敗

                    // 入力されたパスワードとDB内のハッシュを比較
                    const passwordsMatch = await bcryptjs.compare(password, user.password);
                    if (passwordsMatch) return user; // 一致すれば認証成功
                }

                // 認証失敗（バリデーション失敗またはユーザー不一致）
                return null;
            }
        })
    ],
});
