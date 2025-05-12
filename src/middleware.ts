// NextAuthのミドルウェア機能をインポート
import NextAuth from 'next-auth';

// 認証設定ファイル（auth.config.ts）をインポート
import { authConfig } from './auth.config';

// NextAuth のミドルウェア関数をエクスポート
// これにより、認証制御がルートごとに適用される
export default NextAuth(authConfig).auth;

// ミドルウェアを適用するルートのパターンを指定
export const config = {
    // matcher: ミドルウェアを適用する対象のURLパスを定義
    // 下記は以下のようなルートを除外して、他すべてに認証ミドルウェアを適用する設定
    // 除外対象: /api, /_next/static, /_next/image, .pngファイルなど
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
