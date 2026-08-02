import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { generateResellerSlug } from "@/lib/slug";

const bodySchema = z.object({ isReseller: z.boolean() });

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません。" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      isReseller: parsed.data.isReseller,
      resellerSlug: parsed.data.isReseller && !user.resellerSlug
        ? generateResellerSlug(user.email)
        : user.resellerSlug,
    },
  });

  return NextResponse.json({ isReseller: updated.isReseller });
}
