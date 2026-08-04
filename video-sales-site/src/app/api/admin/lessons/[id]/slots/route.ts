import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin";
import { isProPlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

const slotSchema = z.object({
  startAt: z.string().min(1),
  capacityOverride: z.number().int().positive().nullable(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }
  if (!(await isProPlan())) {
    return NextResponse.json({ error: "レッスン予約機能はプロプラン限定です。" }, { status: 403 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: params.id } });
  if (!lesson) {
    return NextResponse.json({ error: "レッスンが見つかりません。" }, { status: 404 });
  }

  const parsed = slotSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容をご確認ください。" }, { status: 400 });
  }

  const startAt = new Date(parsed.data.startAt);
  if (Number.isNaN(startAt.getTime())) {
    return NextResponse.json({ error: "日時が正しくありません。" }, { status: 400 });
  }

  const slot = await prisma.lessonSlot.create({
    data: {
      lessonId: lesson.id,
      startAt,
      capacityOverride: parsed.data.capacityOverride,
    },
  });

  return NextResponse.json(slot, { status: 201 });
}
