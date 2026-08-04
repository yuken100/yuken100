import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isProPlan } from "@/lib/plan";
import { jstDateKey, formatJstTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import LessonCalendar from "@/components/LessonCalendar";

export default async function LessonsCalendarPage() {
  if (!(await isProPlan())) notFound();

  const session = await getServerSession(authOptions);

  const slots = await prisma.lessonSlot.findMany({
    where: {
      status: "OPEN",
      startAt: { gt: new Date() },
      lesson: { published: true },
    },
    orderBy: { startAt: "asc" },
    include: {
      lesson: true,
      bookings: { where: { status: "CONFIRMED" } },
    },
  });

  // All date/time grouping happens here, server-side, using the JST helpers —
  // the client component only ever receives already-formatted JST strings so
  // it can never re-introduce a server-timezone display bug.
  const calendarSlots = slots.map((slot) => {
    const capacity = slot.capacityOverride ?? slot.lesson.capacity;
    const remaining = capacity - slot.bookings.length;
    return {
      id: slot.id,
      lessonTitle: slot.lesson.title,
      lessonSlug: slot.lesson.slug,
      dateKey: jstDateKey(slot.startAt),
      timeLabel: formatJstTime(slot.startAt),
      remaining,
      capacity,
      full: remaining <= 0,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-tiffany-900">レッスンカレンダー</h1>
          <p className="mt-2 text-sm text-tiffany-800/70">
            日付から予約可能なレッスンを探せます。
          </p>
        </div>
        <Link href="/lessons" className="text-sm font-medium text-tiffany-600 hover:text-tiffany-800">
          レッスン一覧を見る →
        </Link>
      </div>

      <LessonCalendar
        slots={calendarSlots}
        todayKey={jstDateKey(new Date())}
        isLoggedIn={!!session}
      />
    </div>
  );
}
