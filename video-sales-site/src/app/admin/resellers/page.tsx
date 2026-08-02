import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import ResellerToggleButton from "@/components/ResellerToggleButton";

export default async function AdminResellersPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/resellers");

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-tiffany-900">販売代理店の管理</h1>
        <Link href="/admin" className="text-sm font-semibold text-tiffany-600 hover:text-tiffany-800">
          ← 管理画面に戻る
        </Link>
      </div>
      <p className="mt-2 text-sm text-tiffany-800/70">
        「修了生」フラグを立てると、該当ユーザーのマイページにStripe連携・紹介リンクの発行画面が表示されます。
      </p>

      <div className="mt-8 overflow-hidden rounded-xl2 border border-tiffany-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-tiffany-50 text-xs uppercase text-tiffany-700">
            <tr>
              <th className="px-4 py-3">名前</th>
              <th className="px-4 py-3">メールアドレス</th>
              <th className="px-4 py-3">修了生(代理店)</th>
              <th className="px-4 py-3">Stripe連携</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-tiffany-50">
                <td className="px-4 py-3 font-medium text-tiffany-900">{user.name}</td>
                <td className="px-4 py-3 text-tiffany-800/70">{user.email}</td>
                <td className="px-4 py-3">
                  {user.isReseller ? (
                    <span className="rounded-full bg-tiffany-100 px-3 py-1 text-xs font-semibold text-tiffany-700">
                      有効
                    </span>
                  ) : (
                    <span className="text-tiffany-800/50">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.isReseller
                    ? user.stripeOnboardingComplete
                      ? "連携済み"
                      : "未連携"
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    {user.isReseller && (
                      <Link
                        href={`/admin/resellers/${user.id}/edit`}
                        className="font-semibold text-tiffany-600 hover:text-tiffany-800"
                      >
                        事業者情報を編集
                      </Link>
                    )}
                    <ResellerToggleButton userId={user.id} isReseller={user.isReseller} />
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
