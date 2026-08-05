import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import TestimonialForm from "@/components/TestimonialForm";

export default async function NewTestimonialPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/testimonials/new");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">新しい口コミを追加</h1>
      <TestimonialForm />
    </div>
  );
}
