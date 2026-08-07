import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin";
import { areLessonsEnabled } from "@/lib/plan";
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
  thumbnailUrl: z.string().optional(),
  thumbnailPosition: z.string().optional(),
  membersOnly: z.boolean(),
  published: z.boolean(),
});

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }
  if (!(await areLessonsEnabled())) {
    return NextResponse.json({ error: "レッスン予約機能はプロプラン限定です。" }, { status: 403 });
  }

  const parsed = lessonSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容をご確認ください。" },
      { status: 400 }
    );
  }

  const existing = await prisma.lesson.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "このスラッグは既に使用されています。" }, { status: 409 });
  }

  const lesson = await prisma.lesson.create({ data: parsed.data });
  return NextResponse.json(lesson, { status: 201 });
}
