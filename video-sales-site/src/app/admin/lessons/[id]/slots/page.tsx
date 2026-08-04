import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { isProPlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import AddSlotForm from "@/components/AddSlotForm";
import CancelSlotButton from "@/components/CancelSlotButton";

export default async function LessonSlotsPage({ params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) redirect(`/login?callbackUrl=/admin/lessons/${params.id}/slots`);
  if (!(await isProPlan())) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      slots: {
        orderBy: { startAt: "asc" },
        include: {
          bookings: { where: { status: "CONFIRMED" }, include: { user: true } },
        },
      },
    },
  });
  if (!lesson) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/admin/lessons" className="text-sm font-medium text-tiffany-600 hover:text-tiffany-800">
        ← レッスン一覧に戻る
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-tiffany-900">
        {lesson.title} の予約枠
      </h1>

      <section className="mt-6 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-tiffany-900">新しい枠を追加</h2>
        <div className="mt-4">
          <AddSlotForm lessonId={lesson.id} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-tiffany-900">
          予約枠一覧 ({lesson.slots.length})
        </h2>
        <div className="mt-4 space-y-3">
          {lesson.slots.map((slot) => {
            const capacity = slot.capacityOverride ?? lesson.capacity;
            return (
              <div
                key={slot.id}
                className="rounded-xl2 border border-tiffany-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-tiffany-900">
                      {slot.startAt.toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-1 text-sm text-tiffany-800/70">
                      予約 {slot.bookings.length} / {capacity}人
                    </p>
                  </div>
                  <CancelSlotButton slotId={slot.id} />
                </div>
                {slot.bookings.length > 0 && (
                  <ul className="mt-3 border-t border-tiffany-50 pt-3 text-sm text-tiffany-800/70">
                    {slot.bookings.map((booking) => (
                      <li key={booking.id}>
                        {booking.user.name}({booking.user.email})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {lesson.slots.length === 0 && (
            <p className="text-sm text-tiffany-800/60">まだ予約枠がありません。</p>
          )}
        </div>
      </section>
    </div>
  );
}
