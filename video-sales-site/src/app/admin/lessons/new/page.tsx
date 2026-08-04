import { redirect, notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { isProPlan } from "@/lib/plan";
import LessonForm from "@/components/LessonForm";

export default async function NewLessonPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin/lessons/new");
  if (!(await isProPlan())) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">新しいレッスンを追加</h1>
      <LessonForm />
    </div>
  );
}
