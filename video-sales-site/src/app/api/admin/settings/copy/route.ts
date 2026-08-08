import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  heroHeadline: z.string(),
  heroCatchcopy: z.string(),
  footerIntro: z.string(),
});

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容をご確認ください。" }, { status: 400 });
  }

  const current = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  await prisma.siteCopyHistory.create({
    data: {
      heroHeadline: current?.heroHeadline,
      heroCatchcopy: current?.heroCatchcopy,
      footerIntro: current?.footerIntro,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  return NextResponse.json({ ok: true });
}
