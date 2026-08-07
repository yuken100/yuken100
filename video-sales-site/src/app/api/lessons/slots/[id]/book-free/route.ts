import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { areLessonsEnabled } from "@/lib/plan";
import { hasActiveMembership } from "@/lib/access";
import { formatJstDateTime } from "@/lib/datetime";
import { sendLessonBookingConfirmationEmail } from "@/lib/email";

const CONFIRMATION_TTL_MS = 10 * 60 * 1000;

// Bookings that still count toward capacity: confirmed ones, plus pending
// ones whose confirmation link hasn't been used or expired yet. An expired
// pending booking is treated as if it never happened, freeing the spot.
const activeBookingWhere = {
  OR: [
    { status: "CONFIRMED" },
    { status: "PENDING", confirmation: { usedAt: null, expiresAt: { gt: new Date() } } },
  ],
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  if (!(await areLessonsEnabled())) {
    return NextResponse.json({ error: "レッスン予約機能は現在利用できません。" }, { status: 403 });
  }

  const slot = await prisma.lessonSlot.findUnique({
    where: { id: params.id },
    include: {
      lesson: true,
      bookings: { where: activeBookingWhere, include: { confirmation: true } },
    },
  });

  if (!slot || slot.status !== "OPEN" || !slot.lesson.published) {
    return NextResponse.json({ error: "この予約枠は見つかりません。" }, { status: 404 });
  }
  if (slot.startAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "この予約枠は終了しています。" }, { status: 400 });
  }

  const isMember = await hasActiveMembership(session.user.id);

  if (slot.lesson.membersOnly && !isMember) {
    return NextResponse.json({ error: "このレッスンは会員限定です。" }, { status: 403 });
  }
  if (!isMember && slot.lesson.priceJpy !== 0) {
    return NextResponse.json(
      { error: "この予約枠は無料ではありません。通常の予約手続きをご利用ください。" },
      { status: 400 }
    );
  }

  const existing = slot.bookings.find((booking) => booking.userId === session.user.id);
  if (existing?.status === "CONFIRMED") {
    return NextResponse.json({ error: "この枠は既に予約済みです。" }, { status: 400 });
  }

  const capacity = slot.capacityOverride ?? slot.lesson.capacity;
  const othersCount = slot.bookings.filter((booking) => booking.userId !== session.user.id).length;
  if (othersCount >= capacity) {
    return NextResponse.json({ error: "この枠は満席です。" }, { status: 400 });
  }

  // An active member skips payment and email confirmation entirely — the
  // booking is confirmed the moment they click, same as how membership
  // already bypasses per-video purchases.
  if (isMember) {
    await prisma.lessonBooking.upsert({
      where: { userId_lessonSlotId: { userId: session.user.id, lessonSlotId: slot.id } },
      create: {
        userId: session.user.id,
        lessonSlotId: slot.id,
        status: "CONFIRMED",
        amountJpy: 0,
        provider: "membership",
      },
      update: { status: "CONFIRMED", amountJpy: 0, provider: "membership" },
    });
    return NextResponse.json({ ok: true, confirmed: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + CONFIRMATION_TTL_MS);

  const booking = await prisma.lessonBooking.upsert({
    where: { userId_lessonSlotId: { userId: session.user.id, lessonSlotId: slot.id } },
    create: {
      userId: session.user.id,
      lessonSlotId: slot.id,
      status: "PENDING",
      amountJpy: 0,
      provider: "free_email_confirm",
    },
    update: { status: "PENDING", amountJpy: 0, provider: "free_email_confirm" },
  });

  await prisma.lessonBookingConfirmation.upsert({
    where: { bookingId: booking.id },
    create: { bookingId: booking.id, token, expiresAt },
    update: { token, expiresAt, usedAt: null },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const confirmUrl = `${siteUrl}/lessons/confirm?token=${token}`;

  try {
    await sendLessonBookingConfirmationEmail(
      session.user.email as string,
      confirmUrl,
      slot.lesson.title,
      formatJstDateTime(slot.startAt)
    );
  } catch (error) {
    console.error("Failed to send lesson booking confirmation email", error);
    return NextResponse.json(
      { error: "確認メールの送信に失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, pending: true });
}
