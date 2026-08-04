import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin";
import { isProPlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

const lessonSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "スラッグは半角英数とハイフンのみ使用できます。"),
  description: z.string().min(1),
  format: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  location: z.string().optional().nullable(),
  onlineUrl: z.string().optional().nullable(),
  durationMinutes: z.number().int().positive(),
  capacity: z.number().int().positive(),
  priceJpy: z.number().int().nonnegative(),
  gradientFrom: z.string().min(1),
  gradientTo: z.string().min(1),
  published: z.boolean(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }
  if (!(await isProPlan())) {
    return NextResponse.json({ error: "レッスン予約機能はプロプラン限定です。" }, { status: 403 });
  }

  const parsed = lessonSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容をご確認ください。" },
      { status: 400 }
    );
  }

  const conflict = await prisma.lesson.findFirst({
    where: { slug: parsed.data.slug, NOT: { id: params.id } },
  });
  if (conflict) {
    return NextResponse.json({ error: "このスラッグは既に使用されています。" }, { status: 409 });
  }

  const lesson = await prisma.lesson.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(lesson);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }

  const bookingCount = await prisma.lessonBooking.count({
    where: { lessonSlot: { lessonId: params.id }, status: "CONFIRMED" },
  });
  if (bookingCount > 0) {
    return NextResponse.json(
      { error: "予約済みの枠があるレッスンは削除できません。先に枠をキャンセルしてください。" },
      { status: 409 }
    );
  }

  await prisma.lessonSlot.deleteMany({ where: { lessonId: params.id } });
  await prisma.lesson.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
