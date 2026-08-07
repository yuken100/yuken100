import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { formatJstDateTime } from "@/lib/datetime";
import MarkInquiryRepliedButton from "@/components/MarkInquiryRepliedButton";

function buildReplyMailtoUrl(to: string, name: string, message: string): string {
  const subject = "Re: お問い合わせありがとうございます";
  const body = `${name} 様\n\n\n\n--- いただいたお問い合わせ ---\n${message}`;
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString()}`;
}

export default async function AdminInquiryDetailPage({ params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) redirect(`/login?callbackUrl=/admin/inquiries/${params.id}`);

  const inquiry = await prisma.inquiry.findUnique({ where: { id: params.id } });
  if (!inquiry) notFound();

  if (!inquiry.readAt) {
    await prisma.inquiry.update({ where: { id: inquiry.id }, data: { readAt: new Date() } });
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/admin/inquiries" className="text-sm font-medium text-tiffany-600 hover:text-tiffany-800">
        ← お問い合わせ一覧に戻る
      </Link>

      <div className="mt-6 rounded-xl2 border border-tiffany-100 bg-white p-6 shadow-sm">
        <p className="text-xs text-tiffany-800/60">{formatJstDateTime(inquiry.createdAt)}</p>
        <h1 className="mt-1 font-display text-xl font-bold text-tiffany-900">{inquiry.name} 様より</h1>
        <a href={`mailto:${inquiry.email}`} className="mt-1 block text-sm text-tiffany-600 hover:text-tiffany-800">
          {inquiry.email}
        </a>

        <p className="mt-4 whitespace-pre-line rounded-lg bg-tiffany-50 p-4 text-sm leading-relaxed text-tiffany-800/80">
          {inquiry.message}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={buildReplyMailtoUrl(inquiry.email, inquiry.name, inquiry.message)}
            className="rounded-full border border-tiffany-300 px-5 py-2.5 text-sm font-semibold text-tiffany-700 hover:bg-tiffany-50"
          >
            メールで返信する
          </a>
          <MarkInquiryRepliedButton inquiryId={inquiry.id} replied={Boolean(inquiry.repliedAt)} />
        </div>

        <p className="mt-4 text-xs text-tiffany-800/60">
          {inquiry.repliedAt
            ? `${formatJstDateTime(inquiry.repliedAt)} に対応済みにしました`
            : "まだ対応済みになっていません"}
        </p>
        <p className="mt-1 text-xs text-tiffany-800/50">
          「メールで返信する」は、宛先・件名・引用文が入力された状態でお使いのメールソフトを開きます。ブラウザでGmailを既定のメールソフトに設定していれば、Gmailの作成画面が開きます。
        </p>
      </div>
    </div>
  );
}
