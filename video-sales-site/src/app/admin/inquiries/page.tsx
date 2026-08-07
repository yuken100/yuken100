import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { formatJstDateTime } from "@/lib/datetime";
import DeleteInquiryButton from "@/components/DeleteInquiryButton";

export default async function AdminInquiriesPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/inquiries");

  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-tiffany-900">お問い合わせ ({inquiries.length})</h1>
      <p className="mt-2 text-sm text-tiffany-800/70">
        サイトの「お問い合わせ」フォームから届いた内容の一覧です。「詳細を見る」から全文の確認・返信対応ができます。
      </p>

      <div className="mt-8 overflow-hidden rounded-xl2 border border-tiffany-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-tiffany-50 text-xs uppercase text-tiffany-700">
              <tr>
                <th className="px-4 py-3">受信日時</th>
                <th className="px-4 py-3">お名前</th>
                <th className="px-4 py-3">内容</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-t border-tiffany-50">
                  <td className="whitespace-nowrap px-4 py-3 text-tiffany-800/70">
                    {formatJstDateTime(inquiry.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-tiffany-900">{inquiry.name}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-tiffany-800/70">{inquiry.message}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          inquiry.readAt
                            ? "bg-tiffany-100 text-tiffany-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {inquiry.readAt ? "既読" : "未読"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          inquiry.repliedAt
                            ? "bg-tiffany-100 text-tiffany-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {inquiry.repliedAt ? "対応済み" : "未対応"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/inquiries/${inquiry.id}`}
                        className="font-semibold text-tiffany-600 hover:text-tiffany-800"
                      >
                        詳細を見る
                      </Link>
                      <DeleteInquiryButton inquiryId={inquiry.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-tiffany-800/60">
                    まだお問い合わせはありません。
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
