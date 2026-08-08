import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ itemId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容をご確認ください。" }, { status: 400 });
  }

  await prisma.dismissedAnnouncement.upsert({
    where: { userId_itemId: { userId: session.user.id, itemId: parsed.data.itemId } },
    update: {},
    create: { userId: session.user.id, itemId: parsed.data.itemId },
  });

  return NextResponse.json({ ok: true });
}
