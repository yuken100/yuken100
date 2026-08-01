import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const videoSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "スラッグは半角英数とハイフンのみ使用できます。"),
  description: z.string().min(1),
  category: z.string().min(1),
  level: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  priceJpy: z.number().int().nonnegative(),
  videoUrl: z.string().url(),
  gradientFrom: z.string().min(1),
  gradientTo: z.string().min(1),
  membersOnly: z.boolean(),
  published: z.boolean(),
});

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }

  const parsed = videoSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容をご確認ください。" },
      { status: 400 }
    );
  }

  const existing = await prisma.video.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "このスラッグは既に使用されています。" }, { status: 409 });
  }

  const video = await prisma.video.create({ data: parsed.data });
  return NextResponse.json(video, { status: 201 });
}
