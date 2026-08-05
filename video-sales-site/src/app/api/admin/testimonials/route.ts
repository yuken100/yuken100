import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const testimonialSchema = z
  .object({
    studentName: z.string().min(1),
    comment: z.string().min(1),
    photoUrl: z.string().optional(),
    photoPosition: z.string().optional(),
    rating: z.number().int().min(1).max(5).nullable().optional(),
    published: z.boolean(),
    videoId: z.string().nullable().optional(),
    lessonId: z.string().nullable().optional(),
  })
  .refine((data) => !(data.videoId && data.lessonId), {
    message: "表示先は講座・レッスンのどちらか一方のみ選択できます。",
  });

export async function POST(request: Request) {
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

  const testimonial = await prisma.testimonial.create({ data: parsed.data });
  return NextResponse.json(testimonial, { status: 201 });
}
