import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { areLessonsEnabled } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import DeleteLessonButton from "@/components/DeleteLessonButton";

export default async function AdminLessonsPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/lessons");
  if (!(await areLessonsEnabled())) notFound();

  const lessons = await prisma.lesson.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { slots: true } } },
  });

  const formatLabel: Record<string, string> = {
    ONLINE: "オンライン",
    OFFLINE: "対面",
    HYBRID: "オンライン+対面",
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-tiffany-900">レッスン管理</h1>
        <Link
          href="/admin/lessons/new"
          className="rounded-full bg-tiffany-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-tiffany-600"
        >
          + 新しいレッスンを追加
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl2 border border-tiffany-100 bg-white">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-tiffany-50 text-xs uppercase text-tiffany-700">
            <tr>
              <th className="px-4 py-3">レッスン名</th>
              <th className="px-4 py-3">形式</th>
              <th className="px-4 py-3">価格</th>
              <th className="px-4 py-3">定員</th>
              <th className="px-4 py-3">会員限定</th>
              <th className="px-4 py-3">公開</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="border-t border-tiffany-50">
                <td className="px-4 py-3 font-medium text-tiffany-900">{lesson.title}</td>
                <td className="px-4 py-3 text-tiffany-800/70">{formatLabel[lesson.format]}</td>
                <td className="px-4 py-3 text-tiffany-800/70">
                  ¥{lesson.priceJpy.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-tiffany-800/70">{lesson.capacity}人</td>
                <td className="px-4 py-3">{lesson.membersOnly ? "会員限定" : "誰でも予約可"}</td>
                <td className="px-4 py-3">{lesson.published ? "公開中" : "非公開"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/lessons/${lesson.id}/slots`}
                      className="font-semibold text-tiffany-600 hover:text-tiffany-800"
                    >
                      予約枠({lesson._count.slots})
                    </Link>
                    <Link
                      href={`/admin/lessons/${lesson.id}/edit`}
                      className="font-semibold text-tiffany-600 hover:text-tiffany-800"
                    >
                      編集
                    </Link>
                    <DeleteLessonButton lessonId={lesson.id} />
                  </div>
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-tiffany-800/60">
                  まだレッスンがありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
