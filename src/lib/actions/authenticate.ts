'use server';

// 認証用の signIn 関数をインポート（NextAuth の関数）
import { signIn } from '@/auth';

// 認証エラーを扱うための型（エラー判定に使用）
import { AuthError } from 'next-auth';

// フォームから送信されたデータをもとにユーザーを認証するサーバーアクション
export async function authenticate(
    prevState: string | undefined,  // 前回のエラーメッセージ（または状態）
    formData: FormData,             // フォーム送信されたデータ（email, passwordなど）
) {
    try {
        // 'credentials' プロバイダを使って認証を試みる（ログイン処理）
        await signIn('credentials', formData);
    }

    catch (error) {
        // 認証エラーの場合の処理（AuthErrorのインスタンスか確認）
        if (error instanceof AuthError) {
            // エラーメッセージが 'CredentialsSignin'（＝認証失敗）の場合
            if (error.message === 'CredentialsSignin') {
                // ログインフォームに表示するエラーメッセージを返す
                return 'メールアドレスまたはパスワードが正しくありません。';
            }
            // その他の認証エラー（例えばサーバー側の問題）
            return 'エラーが発生しました。';
        }

        // 予期しないエラーはそのまま上に投げる（デバッグやログに活用）
        throw error;
    }
}
