import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isProPlan } from "@/lib/plan";
import { hasActiveMembership } from "@/lib/access";
import { formatJstDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import VideoThumb from "@/components/VideoThumb";
import BookSlotButton from "@/components/BookSlotButton";
import PendingConfirmationNotice from "@/components/PendingConfirmationNotice";
import TestimonialSection from "@/components/TestimonialSection";
import TestimonialSubmitForm from "@/components/TestimonialSubmitForm";

const formatLabel: Record<string, string> = {
  ONLINE: "オンライン",
  OFFLINE: "対面",
  HYBRID: "オンライン+対面",
};

export default async function LessonDetailPage({ params }: { params: { slug: string } }) {
  if (!(await isProPlan())) notFound();

  const session = await getServerSession(authOptions);

  // A PENDING (unconfirmed, ¥0-only) booking still holds its spot, so it
  // counts toward capacity the same as a CONFIRMED one — otherwise two
  // people could claim the same free slot while one hasn't confirmed yet.
  const lesson = await prisma.lesson.findUnique({
    where: { slug: params.slug },
    include: {
      slots: {
        where: { status: "OPEN", startAt: { gt: new Date() } },
        orderBy: { startAt: "asc" },
        include: {
          bookings: {
            where: {
              OR: [
                { status: "CONFIRMED" },
                { status: "PENDING", confirmation: { usedAt: null, expiresAt: { gt: new Date() } } },
              ],
            },
          },
        },
      },
    },
  });
  if (!lesson || !lesson.published) notFound();

  const isMember = session ? await hasActiveMembership(session.user.id) : false;
  const testimonials = await prisma.testimonial.findMany({
    where: { published: true, lessonId: lesson.id },
    orderBy: { createdAt: "desc" },
  });
  const myBookingConfirmed = session
    ? await prisma.lessonBooking.findFirst({
        where: { userId: session.user.id, status: "CONFIRMED", lessonSlot: { lessonId: lesson.id } },
      })
    : null;
  const canReview = Boolean(myBookingConfirmed);
  const myTestimonial = canReview
    ? await prisma.testimonial.findFirst({
        where: { userId: session!.user.id, lessonId: lesson.id },
      })
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/lessons" className="text-sm font-medium text-tiffany-600 hover:text-tiffany-800">
        ← レッスン一覧に戻る
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-5">
        <div className="md:col-span-3">
          <VideoThumb
            from={lesson.gradientFrom}
            to={lesson.gradientTo}
            level={formatLabel[lesson.format] ?? lesson.format}
            imageUrl={lesson.thumbnailUrl}
            imagePosition={lesson.thumbnailPosition}
            className="h-64 w-full md:h-80"
          />

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-tiffany-600">
            <span className="rounded-full bg-tiffany-100 px-3 py-1">
              {formatLabel[lesson.format] ?? lesson.format}
            </span>
            <span className="rounded-full bg-tiffany-100 px-3 py-1">{lesson.durationMinutes}分</span>
            <span className="rounded-full bg-tiffany-100 px-3 py-1">定員{lesson.capacity}人</span>
            {lesson.membersOnly && (
              <span className="rounded-full bg-blush-100 px-3 py-1 text-blush-300">会員限定</span>
            )}
          </div>

          <h1 className="mt-4 font-display text-2xl font-bold text-tiffany-900 md:text-3xl">
            {lesson.title}
          </h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-tiffany-800/80">
            {lesson.description}
          </p>

          {lesson.location && (
            <p className="mt-4 text-sm text-tiffany-800/70">
              <span className="font-semibold text-tiffany-800">場所: </span>
              {lesson.location}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
            <p className="text-3xl font-bold text-tiffany-900">
              ¥{lesson.priceJpy.toLocaleString()}
              <span className="text-sm font-medium text-tiffany-800/60"> (税込・1回)</span>
            </p>

            <div className="mt-6 space-y-4">
              <h2 className="font-display text-base font-bold text-tiffany-900">予約可能な日時</h2>
              {lesson.slots.length === 0 && (
                <p className="text-sm text-tiffany-800/60">現在予約可能な日時はありません。</p>
              )}
              {lesson.slots.map((slot) => {
                const capacity = slot.capacityOverride ?? lesson.capacity;
                const remaining = capacity - slot.bookings.length;
                const full = remaining <= 0;
                const myBooking = slot.bookings.find((booking) => booking.userId === session?.user.id);
                return (
                  <div
                    key={slot.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-tiffany-100 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-tiffany-900">
                        {formatJstDateTime(slot.startAt)}
                      </p>
                      <p className="mt-1 text-xs text-tiffany-800/60">
                        {full ? "満席" : `残り${remaining}枠`}
                      </p>
                    </div>
                    {!session ? (
                      <Link
                        href={`/login?callbackUrl=/lessons/${lesson.slug}`}
                        className="rounded-full border border-tiffany-300 px-5 py-2 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50"
                      >
                        ログインして予約
                      </Link>
                    ) : myBooking?.status === "CONFIRMED" ? (
                      <span className="rounded-full bg-tiffany-50 px-5 py-2 text-sm font-semibold text-tiffany-700">
                        予約済み
                      </span>
                    ) : myBooking?.status === "PENDING" ? (
                      <div className="max-w-xs space-y-2 text-right">
                        <PendingConfirmationNotice className="text-left" />
                        <p className="text-xs text-tiffany-800/70">
                          確認メールをお送りしています。メール内のリンクをクリックすると予約が完了します。
                        </p>
                      </div>
                    ) : lesson.membersOnly && !isMember ? (
                      <div className="max-w-xs text-right text-xs text-tiffany-800/60">
                        <p className="font-semibold text-blush-300">会員限定のレッスンです</p>
                        <Link href="/pricing" className="font-semibold text-tiffany-600 hover:text-tiffany-800">
                          会員プランを見る →
                        </Link>
                      </div>
                    ) : full ? (
                      <span className="rounded-full bg-tiffany-50 px-5 py-2 text-sm font-semibold text-tiffany-800/50">
                        満席
                      </span>
                    ) : (
                      <BookSlotButton slotId={slot.id} priceJpy={lesson.priceJpy} isMember={isMember} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {canReview && (
        <div className="mt-10 max-w-2xl">
          {myTestimonial ? (
            <div className="rounded-xl2 border border-tiffany-100 bg-white p-6 text-sm text-tiffany-800/70 shadow-sm">
              {myTestimonial.published
                ? "あなたが投稿した口コミは公開されています。"
                : "口コミを投稿済みです。確認後に掲載されます。"}
            </div>
          ) : (
            <TestimonialSubmitForm lessonId={lesson.id} defaultName={session?.user.name ?? undefined} />
          )}
        </div>
      )}

      <TestimonialSection testimonials={testimonials} title="このレッスンを受けた生徒さんの声" />
    </div>
  );
}
