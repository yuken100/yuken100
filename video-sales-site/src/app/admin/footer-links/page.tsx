import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import DeleteFooterLinkButton from "@/components/DeleteFooterLinkButton";

export default async function AdminFooterLinksPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/footer-links");

  const footerLinks = await prisma.footerLink.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-tiffany-900">フッターリンク管理</h1>
        <Link
          href="/admin/footer-links/new"
          className="rounded-full bg-tiffany-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-tiffany-600"
        >
          + 新しいリンクを追加
        </Link>
      </div>
      <p className="mt-2 text-sm text-tiffany-800/70">
        ブログやInstagram、Xなど、サイトのフッターに小さく表示するリンクを管理できます。
      </p>

      <div className="mt-8 overflow-hidden rounded-xl2 border border-tiffany-100 bg-white">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-tiffany-50 text-xs uppercase text-tiffany-700">
            <tr>
              <th className="px-4 py-3">表示名</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {footerLinks.map((link) => (
              <tr key={link.id} className="border-t border-tiffany-50">
                <td className="px-4 py-3 font-medium text-tiffany-900">{link.label}</td>
                <td className="max-w-sm truncate px-4 py-3 text-tiffany-800/70">{link.url}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/footer-links/${link.id}/edit`}
                      className="font-semibold text-tiffany-600 hover:text-tiffany-800"
                    >
                      編集
                    </Link>
                    <DeleteFooterLinkButton footerLinkId={link.id} />
                  </div>
                </td>
              </tr>
            ))}
            {footerLinks.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-tiffany-800/60">
                  まだリンクがありません。
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
