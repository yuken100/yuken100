# Sara Yoga | 動画販売サイト

ヨガインストラクター向けオンライン講座の動画販売プラットフォームです。単品購入と会員プラン(月額/年額)の両方に対応しています。

## 技術スタック

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS(ティファニーブルー基調のデザインシステム)
- Prisma + PostgreSQL
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

## セットアップ(ローカル開発)

PostgreSQLが必要です。[Neon](https://neon.tech)や[Supabase](https://supabase.com)の無料枠で数分で用意できます。

```bash
npm install
cp .env.example .env   # DATABASE_URLを用意したPostgresの接続文字列に置き換える
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
| `DATABASE_URL` | PostgreSQLの接続文字列 |
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

## Vercelへのデプロイ手順

1. [vercel.com/new](https://vercel.com/new) からGitHubリポジトリ `yuken100/yuken100` をImport
2. **Root Directory** を `video-sales-site` に設定(リポジトリ直下ではなくサブフォルダにアプリがあるため)
3. プロジェクトの **Storage** タブから Postgres(Neon)を作成し、プロジェクトに接続する
   → `DATABASE_URL` が自動的に環境変数として設定されます
4. 残りの環境変数を設定(Project Settings → Environment Variables)
   - `NEXTAUTH_SECRET`(ランダム文字列。`openssl rand -base64 32`で生成)
   - `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL`(デプロイ後に発行されるURL、例: `https://xxxx.vercel.app`)
   - Stripe / PayPal のキー(後から追加でも可)
5. Deploy
6. 初回デプロイ後、Vercelのプロジェクト設定からTerminal機能か、ローカルから本番の`DATABASE_URL`を指定して以下を一度だけ実行し、テーブル作成とシードデータ投入を行う
   ```bash
   DATABASE_URL="<本番のDATABASE_URL>" npx prisma db push
   DATABASE_URL="<本番のDATABASE_URL>" npx prisma db seed
   ```

## 動画の追加方法

管理者アカウントでログイン後、`/admin` → 「新しい動画を追加」から追加できます。
`videoUrl` には実際の動画ファイル(mp4)のURLを指定してください
(Vimeo/Mux/S3など、外部の動画ホスティングサービスとの組み合わせを想定しています)。

## 本番運用に向けて

- Next.jsを最新の安定バージョンへアップグレード(既知の脆弱性対応。App Router APIの破壊的変更に注意)
- 動画ファイルの配信をCDN/専用の動画ホスティング(Vimeo, Mux, Cloudflare Streamなど)に移行
- メール認証やパスワードリセットなど、認証まわりの拡張
