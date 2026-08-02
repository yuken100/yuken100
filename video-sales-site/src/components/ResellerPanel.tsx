type ResellerPanelProps = {
  resellerSlug: string | null;
  stripeOnboardingComplete: boolean;
  siteUrl: string;
  totalSales: number;
  totalEarnedJpy: number;
};

export default function ResellerPanel({
  resellerSlug,
  stripeOnboardingComplete,
  siteUrl,
  totalSales,
  totalEarnedJpy,
}: ResellerPanelProps) {
  const referralLink = resellerSlug ? `${siteUrl}/?ref=${resellerSlug}` : null;

  return (
    <section className="mt-10 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold text-tiffany-900">販売代理店ページ</h2>

      {!stripeOnboardingComplete ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-tiffany-800/70">
            講座を販売するには、まずStripeアカウントを連携してください。連携後、あなたの紹介リンク経由の購入代金はご自身のStripeアカウントに直接入金されます(手数料10%を差し引いた金額)。
          </p>
          <a
            href="/api/reseller/connect"
            className="whitespace-nowrap rounded-full bg-tiffany-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-tiffany-600"
          >
            Stripeアカウントを連携する
          </a>
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-tiffany-800">
            <span className="rounded-full bg-tiffany-100 px-3 py-1 text-xs font-semibold text-tiffany-700">
              連携済み
            </span>
            <span>Stripeアカウントとの連携が完了しています。</span>
          </div>

          {referralLink && (
            <div>
              <p className="text-xs font-semibold text-tiffany-800">あなたの紹介リンク</p>
              <p className="mt-1 break-all rounded-lg bg-tiffany-50 p-3 text-sm text-tiffany-700">
                {referralLink}
              </p>
              <p className="mt-1 text-xs text-tiffany-800/60">
                このリンクからの購入は、あなたのStripeアカウントに直接入金されます。
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-tiffany-50 p-4">
              <p className="text-xs text-tiffany-800/60">販売件数</p>
              <p className="mt-1 text-xl font-bold text-tiffany-800">{totalSales}件</p>
            </div>
            <div className="rounded-lg bg-tiffany-50 p-4">
              <p className="text-xs text-tiffany-800/60">受取合計(手数料差引後)</p>
              <p className="mt-1 text-xl font-bold text-tiffany-800">
                ¥{totalEarnedJpy.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
