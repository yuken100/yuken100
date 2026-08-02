import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import DeleteVideoButton from "@/components/DeleteVideoButton";

export default async function AdminPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin");

  const [videos, userCount, activeSubs, purchases] = await Promise.all([
    prisma.video.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.purchase.findMany({ where: { status: "PAID" } }),
  ]);

  const revenue = purchases.reduce((sum, p) => sum + p.amountJpy, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-tiffany-900">管理画面</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/resellers"
            className="rounded-full border border-tiffany-300 px-5 py-2.5 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50"
          >
            販売代理店を管理
          </Link>
          <Link
            href="/admin/videos/new"
            className="rounded-full bg-tiffany-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-tiffany-600"
          >
            + 新しい動画を追加
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "動画本数", value: `${videos.length}本` },
          { label: "会員数", value: `${userCount}人` },
          { label: "有効な会員プラン", value: `${activeSubs}件` },
          { label: "単品購入の累計売上", value: `¥${revenue.toLocaleString()}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl2 border border-tiffany-100 bg-white p-5">
            <p className="text-xs text-tiffany-800/60">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-tiffany-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 overflow-hidden rounded-xl2 border border-tiffany-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-tiffany-50 text-xs uppercase text-tiffany-700">
            <tr>
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">カテゴリ</th>
              <th className="px-4 py-3">価格</th>
              <th className="px-4 py-3">公開</th>
              <th className="px-4 py-3">会員限定</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id} className="border-t border-tiffany-50">
                <td className="px-4 py-3 font-medium text-tiffany-900">{video.title}</td>
                <td className="px-4 py-3 text-tiffany-800/70">{video.category}</td>
                <td className="px-4 py-3 text-tiffany-800/70">¥{video.priceJpy.toLocaleString()}</td>
                <td className="px-4 py-3">{video.published ? "公開中" : "非公開"}</td>
                <td className="px-4 py-3">{video.membersOnly ? "会員限定" : "誰でも購入可"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/videos/${video.id}/edit`}
                      className="font-semibold text-tiffany-600 hover:text-tiffany-800"
                    >
                      編集
                    </Link>
                    <DeleteVideoButton videoId={video.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
