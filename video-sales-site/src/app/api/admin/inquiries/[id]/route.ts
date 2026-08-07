import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }

  await prisma.inquiry.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
