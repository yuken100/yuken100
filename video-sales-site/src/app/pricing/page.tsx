import { prisma } from "@/lib/prisma";
import PricingCard from "@/components/PricingCard";
import type { PlanInterval } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({ orderBy: { priceJpy: "asc" } });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold text-tiffany-900">料金プラン</h1>
        <p className="mt-3 text-sm text-tiffany-800/70">
          気になる講座だけ購入するもよし、会員プランで全講座見放題にするもよし。
          学び方に合わせてお選びください。
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            name={plan.name}
            priceJpy={plan.priceJpy}
            interval={plan.interval as PlanInterval}
            description={plan.description}
            features={JSON.parse(plan.features) as string[]}
            highlighted={plan.key === "monthly"}
            ctaHref={plan.key === "single" ? "/courses" : `/signup?plan=${plan.key}`}
            ctaLabel={plan.key === "single" ? "講座を見る" : "このプランで始める"}
            planKey={plan.key === "single" ? undefined : plan.key}
          />
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-3xl rounded-xl2 bg-tiffany-50 p-8 text-sm text-tiffany-800/80">
        <h2 className="font-display text-lg font-bold text-tiffany-900">よくある質問</h2>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="font-semibold text-tiffany-800">単品購入した講座に視聴期限はありますか？</dt>
            <dd className="mt-1">いいえ、購入いただいた講座は期限なくいつでも視聴いただけます。</dd>
          </div>
          <div>
            <dt className="font-semibold text-tiffany-800">会員プランはいつでも解約できますか？</dt>
            <dd className="mt-1">はい、マイページからいつでも解約可能です。解約後も期間終了までは視聴いただけます。</dd>
          </div>
          <div>
            <dt className="font-semibold text-tiffany-800">支払い方法は何が使えますか？</dt>
            <dd className="mt-1">クレジットカード(Stripe)、PayPalに対応しています。</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
