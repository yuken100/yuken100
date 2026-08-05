import { redirect, notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import TestimonialForm from "@/components/TestimonialForm";

export default async function EditTestimonialPage({ params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) redirect(`/login?callbackUrl=/admin/testimonials/${params.id}/edit`);

  const testimonial = await prisma.testimonial.findUnique({ where: { id: params.id } });
  if (!testimonial) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-tiffany-900">口コミを編集</h1>
      <TestimonialForm
        testimonialId={testimonial.id}
        initialValues={{
          studentName: testimonial.studentName,
          comment: testimonial.comment,
          photoUrl: testimonial.photoUrl ?? "",
          photoPosition: testimonial.photoPosition ?? "50% 50%",
          rating: testimonial.rating ? String(testimonial.rating) : "",
          published: testimonial.published,
        }}
      />
    </div>
  );
}
