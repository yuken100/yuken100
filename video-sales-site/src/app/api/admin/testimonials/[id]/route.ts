import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const testimonialSchema = z
  .object({
    studentName: z.string().min(1),
    comment: z.string().min(1),
    photoUrl: z.string().nullable().optional(),
    photoPosition: z.string().optional(),
    rating: z.number().int().min(1).max(5).nullable().optional(),
    published: z.boolean(),
    videoId: z.string().nullable().optional(),
    lessonId: z.string().nullable().optional(),
  })
  .refine((data) => !(data.videoId && data.lessonId), {
    message: "表示先は講座・レッスンのどちらか一方のみ選択できます。",
  });

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }

  const parsed = testimonialSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容をご確認ください。" },
      { status: 400 }
    );
  }

  const existing = await prisma.testimonial.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "ご感想が見つかりません。" }, { status: 404 });
  }

  // A student submission can only go live if the student checked the
  // publish-consent box when they submitted it — the admin UI already
  // hides the publish toggle in that case, but enforce it here too so a
  // direct API call can't bypass consent.
  if (existing.userId && parsed.data.published && !existing.consentToPublish) {
    return NextResponse.json(
      { error: "投稿者が掲載に同意していないため、公開できません。" },
      { status: 400 }
    );
  }

  const testimonial = await prisma.testimonial.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json(testimonial);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }

  await prisma.testimonial.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
