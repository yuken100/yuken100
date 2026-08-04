import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const booking = await prisma.lessonBooking.findUnique({
    where: { id: params.id },
    include: { lessonSlot: true },
  });

  if (!booking || booking.userId !== session.user.id) {
    return NextResponse.json({ error: "予約が見つかりません。" }, { status: 404 });
  }
  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "この予約は既にキャンセルされています。" }, { status: 400 });
  }
  if (booking.lessonSlot.startAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "終了したレッスンはキャンセルできません。" }, { status: 400 });
  }

  await prisma.lessonBooking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ ok: true });
}
