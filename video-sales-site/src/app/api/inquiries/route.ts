import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendInquiryNotificationEmail, sendInquiryAutoReplyEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容をご確認ください。" },
      { status: 400 }
    );
  }

  const { name, email, message } = parsed.data;

  await prisma.inquiry.create({ data: { name, email, message } });

  // Best-effort: the inquiry is already saved, so an email hiccup here
  // shouldn't fail the submission — it stays visible in /admin/inquiries
  // either way.
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
  await Promise.allSettled([
    ...admins.map((admin) => sendInquiryNotificationEmail(admin.email, name, email, message)),
    sendInquiryAutoReplyEmail(email, name, message),
  ]);

  return NextResponse.json({ ok: true }, { status: 201 });
}
