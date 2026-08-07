import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { areLessonsEnabled } from "@/lib/plan";
import { hasActiveMembership } from "@/lib/access";
import { formatJstDate, formatJstDateTime } from "@/lib/datetime";
import VideoCard from "@/components/VideoCard";
import CancelSubscriptionButton from "@/components/CancelSubscriptionButton";
import CancelBookingButton from "@/components/CancelBookingButton";
import ResellerPanel from "@/components/ResellerPanel";
import PendingConfirmationNotice from "@/components/PendingConfirmationNotice";

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
    areLessonsEnabled(),
    // Includes CANCELLED bookings for still-upcoming slots too, so a
    // cancellation stays visible as confirmation instead of just vanishing
    // from the list — it naturally drops off once the slot's time passes.
    prisma.lessonBooking.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["CONFIRMED", "PENDING", "CANCELLED"] },
        lessonSlot: { startAt: { gt: new Date() } },
      },
      include: { lessonSlot: { include: { lesson: true } }, confirmation: true },
      orderBy: { lessonSlot: { startAt: "asc" } },
    }),
  ]);

  // A PENDING booking whose confirmation link expired without being used
  // never got completed — the slot has already freed up automatically
  // (see the activeBookingWhere filter in the booking routes), so this is
  // just a record of a booking attempt that timed out, not an active hold.
  const isExpiredPending = (booking: (typeof bookings)[number]) =>
    booking.status === "PENDING" &&
    !booking.confirmation?.usedAt &&
    (booking.confirmation ? booking.confirmation.expiresAt.getTime() < Date.now() : false);

  const totalEarnedJpy = resellerSales.reduce(
    (sum, sale) => sum + (sale.amountJpy - (sale.applicationFeeJpy ?? 0)),
    0
  );

  // Reviewable = purchased (or, with an active membership, any published
  // video) plus any lesson with a CONFIRMED booking whose slot has already
  // happened — matching the same eligibility /api/testimonials enforces.
  const isMember = await hasActiveMembership(session.user.id);
  const [allPublishedVideos, myVideoTestimonials, confirmedLessonBookings, myLessonTestimonials] =
    await Promise.all([
      isMember ? prisma.video.findMany({ where: { published: true } }) : Promise.resolve([]),
      prisma.testimonial.findMany({ where: { userId: session.user.id, videoId: { not: null } } }),
      showLessons
        ? prisma.lessonBooking.findMany({
            where: {
              userId: session.user.id,
              status: "CONFIRMED",
              lessonSlot: { startAt: { lt: new Date() } },
            },
            include: { lessonSlot: { include: { lesson: true } } },
          })
        : Promise.resolve([]),
      prisma.testimonial.findMany({ where: { userId: session.user.id, lessonId: { not: null } } }),
    ]);

  const eligibleVideos = new Map<string, { id: string; title: string }>();
  for (const purchase of purchases) eligibleVideos.set(purchase.video.id, purchase.video);
  for (const video of allPublishedVideos) eligibleVideos.set(video.id, video);
  const videoTestimonialByVideoId = new Map(myVideoTestimonials.map((t) => [t.videoId as string, t]));

  const eligibleLessons = new Map<string, { id: string; title: string }>();
  for (const booking of confirmedLessonBookings) {
    eligibleLessons.set(booking.lessonSlot.lesson.id, booking.lessonSlot.lesson);
  }
  const lessonTestimonialByLessonId = new Map(myLessonTestimonials.map((t) => [t.lessonId as string, t]));

  const reviewItems = [
    ...Array.from(eligibleVideos.values()).map((video) => ({
      key: `video-${video.id}`,
      typeLabel: "講座",
      title: video.title,
      href: `/dashboard/testimonials/new?videoId=${video.id}`,
      testimonial: videoTestimonialByVideoId.get(video.id) ?? null,
    })),
    ...Array.from(eligibleLessons.values()).map((lesson) => ({
      key: `lesson-${lesson.id}`,
      typeLabel: "レッスン",
      title: lesson.title,
      href: `/dashboard/testimonials/new?lessonId=${lesson.id}`,
      testimonial: lessonTestimonialByLessonId.get(lesson.id) ?? null,
    })),
  ].sort((a, b) => Number(Boolean(a.testimonial)) - Number(Boolean(b.testimonial)));

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
            予約中のレッスン (
            {
              bookings.filter((booking) => booking.status !== "CANCELLED" && !isExpiredPending(booking))
                .length
            }
            )
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
              {bookings.map((booking) => {
                const expired = isExpiredPending(booking);
                return (
                  <li
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-tiffany-100 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-tiffany-900">
                        {booking.lessonSlot.lesson.title}
                        {booking.status === "PENDING" && !expired && (
                          <span className="ml-2 text-xs font-semibold text-red-500">確認待ち</span>
                        )}
                        {expired && (
                          <span className="ml-2 text-xs font-semibold text-tiffany-800/50">
                            時間切れで予約できませんでした
                          </span>
                        )}
                        {booking.status === "CANCELLED" && (
                          <span className="ml-2 text-xs font-semibold text-tiffany-800/50">
                            キャンセル済み
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-tiffany-800/60">
                        {formatJstDateTime(booking.lessonSlot.startAt)}
                        {booking.lessonSlot.lesson.location &&
                          ` ・ ${booking.lessonSlot.lesson.location}`}
                      </p>
                      {booking.status === "PENDING" && !expired && (
                        <div className="mt-2 max-w-sm space-y-2">
                          <PendingConfirmationNotice />
                          <p className="text-xs text-tiffany-800/70">
                            メール内のリンクをクリックすると予約が完了します。
                          </p>
                        </div>
                      )}
                      {expired && (
                        <p className="mt-2 max-w-sm text-xs text-tiffany-800/60">
                          確認期限(10分)内にお手続きがなかったため、この予約枠は自動的に空き枠に戻りました。ご希望の場合はお手数ですが再度予約してください。
                        </p>
                      )}
                    </div>
                    {booking.status !== "CANCELLED" && !expired && (
                      <div className="flex items-center gap-3">
                        {booking.status === "CONFIRMED" && booking.lessonSlot.lesson.onlineUrl && (
                          <a
                            href={booking.lessonSlot.lesson.onlineUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-tiffany-300 px-4 py-2 text-xs font-semibold text-tiffany-700 hover:bg-tiffany-50"
                          >
                            参加リンク
                          </a>
                        )}
                        <CancelBookingButton bookingId={booking.id} />
                      </div>
                    )}
                  </li>
                );
              })}
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

      <section className="mt-10 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-tiffany-900">ご意見・ご感想</h2>
        <p className="mt-2 text-sm text-tiffany-800/70">
          受講した講座・レッスンについて、ご感想をお聞かせください。
        </p>
        {reviewItems.length === 0 ? (
          <p className="mt-4 text-sm text-tiffany-800/60">まだ感想を書ける講座・レッスンはありません。</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviewItems.map((item) => (
              <li
                key={item.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-tiffany-100 p-4"
              >
                <div>
                  <p className="text-xs font-semibold text-tiffany-600">{item.typeLabel}</p>
                  <p className="text-sm font-semibold text-tiffany-900">{item.title}</p>
                </div>
                {item.testimonial ? (
                  <span className="text-xs text-tiffany-800/60">
                    {item.testimonial.published ? "ご感想が公開されています" : "ご感想を送信済みです"}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="rounded-full bg-tiffany-500 px-4 py-2 text-xs font-semibold text-white hover:bg-tiffany-600"
                  >
                    感想を書く
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
