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
- 販売代理店(修了生)プログラム: Stripe Connectを使ったレベニューシェア型の再販機能(詳細は下記)

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

## 販売代理店(修了生)プログラム — フェーズ1

「修了生」に自社の動画講座を再販してもらい、売上の一部(既定10%)を自動的に受け取る仕組みです。
Stripe Connectの **Direct Charges** 方式を採用しており、決済の当事者はエンドユーザーと修了生になります
(売上金は修了生のStripeアカウントに直接入金され、返金対応・特定商取引法上の責任も修了生側が負います)。
このサイト自身が保有する動画のみを対象とした、2者間のレベニューシェアです
(修了生が独自コンテンツを販売できるようにするマーケットプレイス化は将来のフェーズです)。

### 使い方

1. 管理者が `/admin/resellers` で対象ユーザーを「修了生」に設定する(初回設定時に紹介リンク用のスラッグを自動発行)
2. 同じ画面から、その修了生の特定商取引法に基づく表記(事業者名・住所・電話番号・連絡先)を入力する
3. 修了生は自分のマイページ(`/dashboard`)からStripeアカウントを連携する(Stripe Connect Expressのオンボーディング画面へ遷移)
4. 連携完了後、マイページに紹介リンク(`https://<サイトURL>/?ref=<スラッグ>`)が表示される
5. このリンク経由でアクセスしたユーザーが講座を購入すると、代金は修了生のStripeアカウントに入金され、
   `application_fee`(既定10%)だけがプラットフォーム側のStripeアカウントに自動的に入る
6. 紹介リンク経由の講座ページには、修了生の特定商取引法表記が動的に表示される(PayPalボタンは非表示になる。Direct Charge方式に対応していないため)

### Stripe Connect側で必要な設定(あなた自身の対応が必要)

1. Stripeダッシュボードで [Connect](https://dashboard.stripe.com/connect/accounts/overview) を有効化(事業者情報の登録・審査が必要)
2. Webhookエンドポイントの設定画面で、**「Listen to events on Connected accounts」** を有効にした上で
   `checkout.session.completed` イベントを購読(通常のプラットフォーム側Webhookと同じエンドポイント・同じ署名シークレットで共通化できます)

### DBスキーマの反映

このブランチでは`prisma/schema.prisma`に`User`(修了生関連フィールド)と`Purchase`(`resellerId`, `applicationFeeJpy`)への追加があります。
既存の本番DBに反映する場合は、`npx prisma db push` を実行するか、以下のSQLを直接実行してください。

```sql
ALTER TABLE "User" ADD COLUMN     "businessAddress" TEXT,
ADD COLUMN     "businessEmail" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessPhone" TEXT,
ADD COLUMN     "isReseller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resellerSlug" TEXT,
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Purchase" ADD COLUMN     "applicationFeeJpy" INTEGER,
ADD COLUMN     "resellerId" TEXT;

CREATE UNIQUE INDEX "User_resellerSlug_key" ON "User"("resellerSlug");

ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

### 既知の制約(フェーズ1のスコープ)

- 対象は単品購入のみ(会員プラン/サブスクリプションは非対応)
- PayPalは非対応(紹介リンク経由の購入ではStripeのみ表示)
- 修了生の認定は管理者による手動設定(オンライン受講からの自動認定は将来のフェーズ)
- 修了生が独自コンテンツを販売する仕組み・複数者への収益分配は未対応(将来のフェーズ)

## 動画の追加方法

管理者アカウントでログイン後、`/admin` → 「新しい動画を追加」から追加できます。
`videoUrl` には実際の動画ファイル(mp4)のURLを指定してください
(Vimeo/Mux/S3など、外部の動画ホスティングサービスとの組み合わせを想定しています)。

## 本番運用に向けて

- Next.jsを最新の安定バージョンへアップグレード(既知の脆弱性対応。App Router APIの破壊的変更に注意)
- 動画ファイルの配信をCDN/専用の動画ホスティング(Vimeo, Mux, Cloudflare Streamなど)に移行
- メール認証やパスワードリセットなど、認証まわりの拡張
