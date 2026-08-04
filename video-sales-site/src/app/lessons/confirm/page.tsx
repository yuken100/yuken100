import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatJstDateTime } from "@/lib/datetime";

function Result({
  title,
  body,
  lessonSlug,
}: {
  title: string;
  body: string;
  lessonSlug?: string;
}) {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">{title}</h1>
      <p className="mt-4 text-sm text-tiffany-800/80">{body}</p>
      <Link
        href={lessonSlug ? `/lessons/${lessonSlug}` : "/lessons"}
        className="mt-8 inline-block rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600"
      >
        レッスンページに戻る
      </Link>
    </div>
  );
}

export default async function ConfirmBookingPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <Result
        title="リンクが正しくありません"
        body="お手数ですが、予約時にお送りしたメールのリンクをもう一度ご確認ください。"
      />
    );
  }

  const confirmation = await prisma.lessonBookingConfirmation.findUnique({
    where: { token },
    include: { booking: { include: { lessonSlot: { include: { lesson: true } } } } },
  });

  if (!confirmation) {
    return <Result title="リンクが見つかりません" body="このリンクは無効です。" />;
  }

  const { booking } = confirmation;
  const lessonSlug = booking.lessonSlot.lesson.slug;

  if (confirmation.usedAt) {
    return (
      <Result
        title="予約は確認済みです"
        body={`「${booking.lessonSlot.lesson.title}」のご予約は既に確認済みです。マイページからご確認いただけます。`}
        lessonSlug={lessonSlug}
      />
    );
  }

  if (confirmation.expiresAt < new Date()) {
    return (
      <Result
        title="リンクの有効期限が切れています"
        body="お手数ですが、レッスンページから再度予約手続きを行ってください。"
        lessonSlug={lessonSlug}
      />
    );
  }

  if (booking.lessonSlot.status !== "OPEN" || !booking.lessonSlot.lesson.published) {
    return (
      <Result
        title="この予約枠は現在ご利用いただけません"
        body="レッスンまたは予約枠が変更・キャンセルされた可能性があります。"
        lessonSlug={lessonSlug}
      />
    );
  }

  await prisma.$transaction([
    prisma.lessonBooking.update({ where: { id: booking.id }, data: { status: "CONFIRMED" } }),
    prisma.lessonBookingConfirmation.update({
      where: { id: confirmation.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">予約が完了しました</h1>
      <p className="mt-4 text-sm text-tiffany-800/80">
        「{booking.lessonSlot.lesson.title}」
        <br />
        {formatJstDateTime(booking.lessonSlot.startAt)}
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-block rounded-full bg-tiffany-500 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-tiffany-600"
      >
        マイページで確認する
      </Link>
    </div>
  );
}
