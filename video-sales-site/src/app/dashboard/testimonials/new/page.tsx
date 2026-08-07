import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canWatchVideo } from "@/lib/access";
import TestimonialSubmitForm from "@/components/TestimonialSubmitForm";

export default async function NewTestimonialPage({
  searchParams,
}: {
  searchParams: { videoId?: string; lessonId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard");

  const { videoId, lessonId } = searchParams;
  if (Boolean(videoId) === Boolean(lessonId)) notFound();

  let title: string;

  if (videoId) {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) notFound();
    if (!(await canWatchVideo(session.user.id, videoId))) notFound();
    const existing = await prisma.testimonial.findFirst({
      where: { userId: session.user.id, videoId },
    });
    if (existing) redirect("/dashboard");
    title = video.title;
  } else {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) notFound();
    const attended = await prisma.lessonBooking.findFirst({
      where: {
        userId: session.user.id,
        status: "CONFIRMED",
        lessonSlot: { lessonId, startAt: { lt: new Date() } },
      },
    });
    if (!attended) notFound();
    const existing = await prisma.testimonial.findFirst({
      where: { userId: session.user.id, lessonId },
    });
    if (existing) redirect("/dashboard");
    title = lesson.title;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/dashboard" className="text-sm font-medium text-tiffany-600 hover:text-tiffany-800">
        ← マイページに戻る
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-tiffany-600">{title}</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-tiffany-900">ご意見・ご感想</h1>
      <div className="mt-6">
        <TestimonialSubmitForm
          videoId={videoId}
          lessonId={lessonId}
          defaultName={session.user.name ?? undefined}
        />
      </div>
    </div>
  );
}
