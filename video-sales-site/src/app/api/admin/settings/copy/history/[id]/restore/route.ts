import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }

  const target = await prisma.siteCopyHistory.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ error: "履歴が見つかりません。" }, { status: 404 });
  }

  // Snapshot the current state too, so restoring is itself undoable.
  const current = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  await prisma.siteCopyHistory.create({
    data: {
      heroHeadline: current?.heroHeadline,
      heroCatchcopy: current?.heroCatchcopy,
      myPageLabel: current?.myPageLabel,
      footerIntro: current?.footerIntro,
    },
  });

  const restored = {
    heroHeadline: target.heroHeadline,
    heroCatchcopy: target.heroCatchcopy,
    myPageLabel: target.myPageLabel,
    footerIntro: target.footerIntro,
  };
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: restored,
    create: { id: "singleton", ...restored },
  });

  return NextResponse.json({ ok: true });
}
