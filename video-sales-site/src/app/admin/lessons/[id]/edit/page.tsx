import { redirect, notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { isProPlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import LessonForm from "@/components/LessonForm";

export default async function EditLessonPage({ params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) redirect(`/login?callbackUrl=/admin/lessons/${params.id}/edit`);
  if (!(await isProPlan())) notFound();

  const lesson = await prisma.lesson.findUnique({ where: { id: params.id } });
  if (!lesson) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">レッスンを編集</h1>
      <LessonForm
        lessonId={lesson.id}
        initialValues={{
          ...lesson,
          format: lesson.format as "ONLINE" | "OFFLINE" | "HYBRID",
          location: lesson.location ?? "",
          onlineUrl: lesson.onlineUrl ?? "",
          thumbnailUrl: lesson.thumbnailUrl ?? "",
        }}
      />
    </div>
  );
}
