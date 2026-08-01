import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const bodySchema = z.object({ subscriptionId: z.string() });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: parsed.data.subscriptionId },
  });
  if (!subscription || subscription.userId !== session.user.id) {
    return NextResponse.json({ error: "サブスクリプションが見つかりません。" }, { status: 404 });
  }

  if (subscription.provider === "stripe" && subscription.providerRef && isStripeConfigured()) {
    try {
      await getStripe().subscriptions.cancel(subscription.providerRef);
    } catch (error) {
      console.error("Stripe subscription cancel error", error);
    }
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "CANCELED" },
  });

  return NextResponse.json({ ok: true });
}
