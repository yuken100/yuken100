# Sara Yoga | 動画販売サイト

ヨガインストラクター向けオンライン講座の動画販売プラットフォームです。単品購入と会員プラン(月額/年額)の両方に対応しています。

## 技術スタック

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS(ティファニーブルー基調のデザインシステム)
- Prisma + SQLite(開発用。本番では Postgres 等に切り替え可能)
- NextAuth.js(メール/パスワード認証)
- Stripe(カード決済・サブスクリプション)
- PayPal REST API(単品購入)

## 主な機能

- 講座一覧・カテゴリ絞り込み・講座詳細ページ
- 会員登録・ログイン(メール/パスワード)
- 単品購入(Stripe / PayPal)、会員プラン加入(Stripe サブスクリプション)
- マイページ(購入済み講座・会員プラン状況・解約)
- 購入/会員権限に応じた動画視聴ページのアクセス制御
- 管理画面(`/admin`)で動画の追加・編集・削除、売上・会員数の確認

## セットアップ

```bash
npm install
cp .env.example .env   # 値を編集(下記参照)
npx prisma db push
npx prisma db seed
npm run dev
```

http://localhost:3000 で起動します。

### デモアカウント(シード投入済み)

- 管理者: `admin@yoga-studio.example.com` / `admin1234`
- 一般会員: `demo@yoga-studio.example.com` / `demo1234`

## 環境変数(`.env`)

`.env.example` を参照してください。

| 変数 | 説明 |
| --- | --- |
| `DATABASE_URL` | Prisma接続文字列。開発は SQLite(`file:./dev.db`) |
| `NEXTAUTH_SECRET` | NextAuth用のランダム文字列(`openssl rand -base64 32`等で生成) |
| `NEXTAUTH_URL` | サイトのURL |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripeダッシュボードで取得 |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_ENV` | PayPal Developer Dashboardで取得(`sandbox` / `live`) |
| `NEXT_PUBLIC_SITE_URL` | 決済完了後のリダイレクト先に使用するサイトURL |

決済関連の環境変数を未設定のまま運用した場合、購入ボタンを押すと
「決済設定が完了していません」という案内が表示されるだけで、アプリ自体は問題なく動作します。
決済を有効化する際は上記の値を設定してください。

### Stripe連携の設定手順(概要)

1. Stripeダッシュボードで `STRIPE_SECRET_KEY` を取得し `.env` に設定
2. Webhookエンドポイント `https://<your-domain>/api/webhooks/stripe` を登録し、`checkout.session.completed` と `customer.subscription.deleted` イベントを購読
3. Webhookの署名シークレットを `STRIPE_WEBHOOK_SECRET` に設定

### PayPal連携の設定手順(概要)

1. PayPal Developer Dashboardでアプリを作成し、Client ID / Secretを取得
2. `.env` に `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` を設定(検証中は `PAYPAL_ENV=sandbox`)
3. 現状PayPalは単品購入のみ対応(会員プランのサブスクリプションはStripeのみ)

## 動画の追加方法

管理者アカウントでログイン後、`/admin` → 「新しい動画を追加」から追加できます。
`videoUrl` には実際の動画ファイル(mp4)のURLを指定してください
(Vimeo/Mux/S3など、外部の動画ホスティングサービスとの組み合わせを想定しています)。

## 本番運用に向けて

- データベースをSQLiteからPostgres等に切り替え、`DATABASE_URL` を変更
- Next.jsを最新の安定バージョンへアップグレード(既知の脆弱性対応。App Router APIの破壊的変更に注意)
- 動画ファイルの配信をCDN/専用の動画ホスティング(Vimeo, Mux, Cloudflare Streamなど)に移行
- メール認証やパスワードリセットなど、認証まわりの拡張
