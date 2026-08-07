import { redirect, notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import FooterLinkForm from "@/components/FooterLinkForm";

export default async function EditFooterLinkPage({ params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) redirect(`/login?callbackUrl=/admin/footer-links/${params.id}/edit`);

  const footerLink = await prisma.footerLink.findUnique({ where: { id: params.id } });
  if (!footerLink) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">リンクを編集</h1>
      <FooterLinkForm footerLinkId={footerLink.id} initialUrl={footerLink.url} />
    </div>
  );
}
