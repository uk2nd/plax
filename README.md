This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## やりたいこと

複数選択の実装
---
1. Shift + ↓ / Shift + ↑ で複数行選択

キーボードで矢印キーを使いながらShiftキーを押すと、行が選択範囲に追加される
通常の矢印キー（Shiftなし）を押すと選択がクリアされる

2. Shift + クリックで範囲選択

最初にカーソルが当たっていた行から、Shiftを押しながらクリックした行までの全ての行が選択される

3. Ctrl + クリックで追加選択

現在の選択範囲を保持したまま、新しい行を選択に追加できる
既に選択されている行をCtrl+クリックすると選択から除外される

4. 視覚的なハイライト

選択された行は青色の背景（bg-blue-100）でハイライト表示される
---

コピペの実装
リファクタリング
一時的な保持はuseState、確定した内容はZustand保持　→確定したものだけを描画できる