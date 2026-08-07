import { notFound } from "next/navigation";
import Link from "next/link";
import { areLessonsEnabled } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import LessonCard from "@/components/LessonCard";

export default async function LessonsPage() {
  if (!(await areLessonsEnabled())) notFound();

  const lessons = await prisma.lesson.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-tiffany-900">レッスン予約</h1>
          <p className="mt-2 text-sm text-tiffany-800/70">
            全{lessons.length}レッスン。オンライン・対面レッスンをご予約いただけます。
          </p>
        </div>
        <Link
          href="/lessons/calendar"
          className="text-sm font-medium text-tiffany-600 hover:text-tiffany-800"
        >
          カレンダーから探す →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} {...lesson} />
        ))}
      </div>
    </div>
  );
}
