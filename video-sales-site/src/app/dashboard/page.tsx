import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VideoCard from "@/components/VideoCard";
import CancelSubscriptionButton from "@/components/CancelSubscriptionButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard");

  const [purchases, subscription] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId: session.user.id, status: "PAID" },
      include: { video: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-tiffany-900">マイページ</h1>
      <p className="mt-2 text-sm text-tiffany-800/70">
        {session.user.name} さん、こんにちは。
      </p>

      <section className="mt-10 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-tiffany-900">会員プラン</h2>
        {subscription ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-tiffany-800">{subscription.plan.name}</p>
              <p className="mt-1 text-xs text-tiffany-800/60">
                {subscription.currentPeriodEnd
                  ? `次回更新日: ${subscription.currentPeriodEnd.toLocaleDateString("ja-JP")}`
                  : "有効期限なし"}
              </p>
            </div>
            <CancelSubscriptionButton subscriptionId={subscription.id} />
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-tiffany-800/70">
              現在会員プランには加入していません。全講座見放題で学びたい方はこちら。
            </p>
            <Link
              href="/pricing"
              className="rounded-full bg-tiffany-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-tiffany-600"
            >
              プランを見る
            </Link>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-tiffany-900">
          購入済みの講座 ({purchases.length})
        </h2>
        {purchases.length === 0 ? (
          <p className="mt-4 text-sm text-tiffany-800/70">
            まだ購入した講座はありません。
            <Link href="/courses" className="ml-1 font-semibold text-tiffany-600 hover:text-tiffany-800">
              講座一覧を見る
            </Link>
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => (
              <VideoCard key={purchase.id} {...purchase.video} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
