import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  businessName: z.string().max(200),
  businessAddress: z.string().max(300),
  businessPhone: z.string().max(50),
  businessEmail: z.string().max(200),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容をご確認ください。" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user || !user.isReseller) {
    return NextResponse.json({ error: "対象の代理店が見つかりません。" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: {
      businessName: parsed.data.businessName || null,
      businessAddress: parsed.data.businessAddress || null,
      businessPhone: parsed.data.businessPhone || null,
      businessEmail: parsed.data.businessEmail || null,
    },
  });

  return NextResponse.json({ ok: true });
}
