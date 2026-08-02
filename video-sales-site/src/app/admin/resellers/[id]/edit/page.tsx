import { redirect, notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import ResellerBusinessForm from "@/components/ResellerBusinessForm";

export default async function EditResellerPage({ params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) redirect(`/login?callbackUrl=/admin/resellers/${params.id}/edit`);

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user || !user.isReseller) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">
        {user.name} さんの事業者情報
      </h1>
      <p className="mt-2 text-sm text-tiffany-800/70">
        この情報は、この方の紹介リンク経由で講座を購入する際の特定商取引法に基づく表記として表示されます。
      </p>
      <ResellerBusinessForm
        userId={user.id}
        initialValues={{
          businessName: user.businessName ?? "",
          businessAddress: user.businessAddress ?? "",
          businessPhone: user.businessPhone ?? "",
          businessEmail: user.businessEmail ?? "",
        }}
      />
    </div>
  );
}
