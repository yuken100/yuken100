import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import FooterLinkForm from "@/components/FooterLinkForm";

export default async function NewFooterLinkPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/footer-links/new");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">新しいリンクを追加</h1>
      <FooterLinkForm />
    </div>
  );
}
