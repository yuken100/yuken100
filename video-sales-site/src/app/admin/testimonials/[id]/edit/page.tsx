import { redirect, notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import TestimonialForm from "@/components/TestimonialForm";
import TestimonialApprovalForm from "@/components/TestimonialApprovalForm";

export default async function EditTestimonialPage({ params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) redirect(`/login?callbackUrl=/admin/testimonials/${params.id}/edit`);

  const [testimonial, videos, lessons] = await Promise.all([
    prisma.testimonial.findUnique({ where: { id: params.id } }),
    prisma.video.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
    prisma.lesson.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
  ]);
  if (!testimonial) notFound();

  if (testimonial.userId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-2xl font-bold text-tiffany-900">ご感想を確認・公開</h1>
        <TestimonialApprovalForm
          testimonialId={testimonial.id}
          studentName={testimonial.studentName}
          comment={testimonial.comment}
          photoUrl={testimonial.photoUrl}
          photoPosition={testimonial.photoPosition}
          rating={testimonial.rating}
          videoId={testimonial.videoId}
          lessonId={testimonial.lessonId}
          published={testimonial.published}
          consentToPublish={testimonial.consentToPublish}
        />
      </div>
    );
  }

  const target = testimonial.videoId
    ? `video:${testimonial.videoId}`
    : testimonial.lessonId
      ? `lesson:${testimonial.lessonId}`
      : "";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">ご感想を編集</h1>
      <TestimonialForm
        testimonialId={testimonial.id}
        videos={videos}
        lessons={lessons}
        initialValues={{
          studentName: testimonial.studentName,
          comment: testimonial.comment,
          photoUrl: testimonial.photoUrl ?? "",
          photoPosition: testimonial.photoPosition ?? "50% 50%",
          rating: testimonial.rating ? String(testimonial.rating) : "",
          published: testimonial.published,
          target,
        }}
      />
    </div>
  );
}
