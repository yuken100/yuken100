import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    videoId: z.string().optional(),
    lessonId: z.string().optional(),
    studentName: z.string().min(1),
    comment: z.string().min(1),
    rating: z.number().int().min(1).max(5).nullable().optional(),
    consentToPublish: z.boolean().optional(),
  })
  .refine((data) => Boolean(data.videoId) !== Boolean(data.lessonId), {
    message: "講座またはレッスンのいずれか一方を指定してください。",
  });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容をご確認ください。" },
      { status: 400 }
    );
  }

  const { videoId, lessonId, studentName, comment, rating, consentToPublish } = parsed.data;

  if (videoId) {
    const viewed = await prisma.videoView.findUnique({
      where: { userId_videoId: { userId: session.user.id, videoId } },
    });
    if (!viewed) {
      return NextResponse.json(
        { error: "この講座を視聴した方のみご感想を投稿できます。" },
        { status: 403 }
      );
    }
    const existing = await prisma.testimonial.findFirst({
      where: { userId: session.user.id, videoId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "この講座にはすでにご感想を投稿済みです。" },
        { status: 400 }
      );
    }
  } else if (lessonId) {
    const attended = await prisma.lessonBooking.findFirst({
      where: {
        userId: session.user.id,
        status: "CONFIRMED",
        lessonSlot: { lessonId, startAt: { lt: new Date() } },
      },
    });
    if (!attended) {
      return NextResponse.json(
        { error: "このレッスンを予約した方のみご感想を投稿できます。" },
        { status: 403 }
      );
    }
    const existing = await prisma.testimonial.findFirst({
      where: { userId: session.user.id, lessonId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "このレッスンにはすでにご感想を投稿済みです。" },
        { status: 400 }
      );
    }
  }

  await prisma.testimonial.create({
    data: {
      studentName,
      comment,
      rating: rating ?? null,
      published: false,
      consentToPublish: consentToPublish ?? false,
      userId: session.user.id,
      videoId: videoId ?? null,
      lessonId: lessonId ?? null,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
