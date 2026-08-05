import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import TestimonialForm from "@/components/TestimonialForm";

export default async function NewTestimonialPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/testimonials/new");

  const [videos, lessons] = await Promise.all([
    prisma.video.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
    prisma.lesson.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">新しいご感想を追加</h1>
      <TestimonialForm videos={videos} lessons={lessons} />
    </div>
  );
}
