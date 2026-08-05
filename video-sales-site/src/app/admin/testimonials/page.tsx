import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import DeleteTestimonialButton from "@/components/DeleteTestimonialButton";

export default async function AdminTestimonialsPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/testimonials");

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      video: { select: { title: true } },
      lesson: { select: { title: true } },
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-tiffany-900">口コミ管理</h1>
        <Link
          href="/admin/testimonials/new"
          className="rounded-full bg-tiffany-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-tiffany-600"
        >
          + 新しい口コミを追加
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl2 border border-tiffany-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-tiffany-50 text-xs uppercase text-tiffany-700">
            <tr>
              <th className="px-4 py-3">お名前</th>
              <th className="px-4 py-3">コメント</th>
              <th className="px-4 py-3">投稿者</th>
              <th className="px-4 py-3">表示先</th>
              <th className="px-4 py-3">評価</th>
              <th className="px-4 py-3">公開</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((testimonial) => (
              <tr key={testimonial.id} className="border-t border-tiffany-50">
                <td className="px-4 py-3 font-medium text-tiffany-900">
                  {testimonial.studentName}
                </td>
                <td className="max-w-sm truncate px-4 py-3 text-tiffany-800/70">
                  {testimonial.comment}
                </td>
                <td className="px-4 py-3 text-tiffany-800/70">
                  {testimonial.user ? (
                    <span title={testimonial.user.email}>{testimonial.user.name}(受講生投稿)</span>
                  ) : (
                    "管理者"
                  )}
                </td>
                <td className="px-4 py-3 text-tiffany-800/70">
                  {testimonial.video?.title ?? testimonial.lesson?.title ?? "トップページ"}
                </td>
                <td className="px-4 py-3 text-tiffany-800/70">
                  {testimonial.rating ? `★${testimonial.rating}` : "—"}
                </td>
                <td className="px-4 py-3">{testimonial.published ? "公開中" : "非公開"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/testimonials/${testimonial.id}/edit`}
                      className="font-semibold text-tiffany-600 hover:text-tiffany-800"
                    >
                      編集
                    </Link>
                    <DeleteTestimonialButton testimonialId={testimonial.id} />
                  </div>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-tiffany-800/60">
                  まだ口コミがありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
