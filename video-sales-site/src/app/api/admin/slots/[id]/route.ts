import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "管理者権限が必要です。" }, { status: 403 });
  }

  const bookingCount = await prisma.lessonBooking.count({
    where: { lessonSlotId: params.id, status: "CONFIRMED" },
  });
  if (bookingCount > 0) {
    return NextResponse.json(
      { error: "予約が入っている枠は削除できません。予約者への対応は別途行ってください。" },
      { status: 409 }
    );
  }

  await prisma.lessonSlot.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
