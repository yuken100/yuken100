import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isProPlan } from "@/lib/plan";
import { formatJstDate, formatJstDateTime } from "@/lib/datetime";
import VideoCard from "@/components/VideoCard";
import CancelSubscriptionButton from "@/components/CancelSubscriptionButton";
import ResellerPanel from "@/components/ResellerPanel";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard");

  const [purchases, subscription, user, resellerSales, showLessons, bookings] = await Promise.all([
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
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.purchase.findMany({
      where: { resellerId: session.user.id, status: "PAID" },
    }),
    isProPlan(),
    prisma.lessonBooking.findMany({
      where: {
        userId: session.user.id,
        status: "CONFIRMED",
        lessonSlot: { startAt: { gt: new Date() } },
      },
      include: { lessonSlot: { include: { lesson: true } } },
      orderBy: { lessonSlot: { startAt: "asc" } },
    }),
  ]);

  const totalEarnedJpy = resellerSales.reduce(
    (sum, sale) => sum + (sale.amountJpy - (sale.applicationFeeJpy ?? 0)),
    0
  );

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
                  ? `次回更新日: ${formatJstDate(subscription.currentPeriodEnd)}`
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

      {showLessons && (
        <section className="mt-10 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-tiffany-900">
            予約中のレッスン ({bookings.length})
          </h2>
          {bookings.length === 0 ? (
            <p className="mt-3 text-sm text-tiffany-800/70">
              現在予約中のレッスンはありません。
              <Link href="/lessons" className="ml-1 font-semibold text-tiffany-600 hover:text-tiffany-800">
                レッスンを予約する
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-tiffany-100 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-tiffany-900">
                      {booking.lessonSlot.lesson.title}
                    </p>
                    <p className="mt-1 text-xs text-tiffany-800/60">
                      {formatJstDateTime(booking.lessonSlot.startAt)}
                      {booking.lessonSlot.lesson.location &&
                        ` ・ ${booking.lessonSlot.lesson.location}`}
                    </p>
                  </div>
                  {booking.lessonSlot.lesson.onlineUrl && (
                    <a
                      href={booking.lessonSlot.lesson.onlineUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-tiffany-300 px-4 py-2 text-xs font-semibold text-tiffany-700 hover:bg-tiffany-50"
                    >
                      参加リンク
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {user?.isReseller && (
        <ResellerPanel
          resellerSlug={user.resellerSlug}
          stripeOnboardingComplete={user.stripeOnboardingComplete}
          siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}
          totalSales={resellerSales.length}
          totalEarnedJpy={totalEarnedJpy}
        />
      )}

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
