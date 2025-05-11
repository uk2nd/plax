// NextAuthConfig 型をインポート（型安全のため）
import type { NextAuthConfig } from 'next-auth';

// 認証設定を定義するオブジェクト
export const authConfig = {
    // サインインページのパスをカスタマイズ（未認証時にリダイレクトされる）
    pages: { signIn: '/login' },

    // 認証状態に応じてアクセス制御を行うコールバック
    callbacks: {
        // アクセス制御ロジックを記述
        authorized({ auth, request: { nextUrl } }) {
            // auth?.user が存在すればログイン済みと判断
            const isLoggedIn = !!auth?.user;

            // アクセスしようとしているURLが管理画面系かどうかを判定
            const isOnDashboard =
                nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/manage');

            // 管理画面へのアクセスの場合
            if (isOnDashboard) {
                // ログイン済みならアクセス許可
                if (isLoggedIn) return true;

                // 未ログインならアクセス拒否（NextAuthがsignInページにリダイレクト）
                return false;
            }

            // ログイン済みユーザーが login ページにアクセスした場合
            else if (isLoggedIn && nextUrl.pathname === '/login') {
                // ダッシュボードにリダイレクト（ログイン後にloginページに戻らないようにする）
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            // 上記に該当しない場合はアクセス許可（例: publicページなど）
            return true;
        },
    },

    // 認証プロバイダーはauth/index.tsで定義（例: Google, GitHubなど）
    providers: [],

// authConfig が NextAuthConfig 型であることを保証（型安全にするための構文）
} satisfies NextAuthConfig;
