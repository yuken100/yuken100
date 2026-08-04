import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, signature ?? "", webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const metadata = checkoutSession.metadata ?? {};

    if (metadata.type === "video" && metadata.videoId && metadata.userId) {
      const video = await prisma.video.findUnique({ where: { id: metadata.videoId } });
      if (video) {
        // If this event came from a reseller's connected account (Direct
        // Charge), event.account carries that account's ID — cross-check it
        // against the referenced reseller before crediting the sale to them.
        const resellerId =
          metadata.resellerId && event.account ? metadata.resellerId : undefined;
        const applicationFeeJpy = resellerId
          ? Number(metadata.applicationFeeJpy) || null
          : null;

        await prisma.purchase.upsert({
          where: { userId_videoId: { userId: metadata.userId, videoId: video.id } },
          update: { status: "PAID" },
          create: {
            userId: metadata.userId,
            videoId: video.id,
            amountJpy: video.priceJpy,
            provider: "stripe",
            providerRef: checkoutSession.id,
            status: "PAID",
            resellerId,
            applicationFeeJpy,
          },
        });
      }
    }

    if (metadata.type === "lesson_slot" && metadata.slotId && metadata.userId) {
      const slot = await prisma.lessonSlot.findUnique({
        where: { id: metadata.slotId },
        include: { lesson: true },
      });
      if (slot) {
        await prisma.lessonBooking.upsert({
          where: { userId_lessonSlotId: { userId: metadata.userId, lessonSlotId: slot.id } },
          update: { status: "CONFIRMED" },
          create: {
            userId: metadata.userId,
            lessonSlotId: slot.id,
            amountJpy: slot.lesson.priceJpy,
            provider: "stripe",
            providerRef: checkoutSession.id,
            status: "CONFIRMED",
          },
        });
      }
    }

    if (metadata.type === "plan" && metadata.planKey && metadata.userId) {
      const plan = await prisma.plan.findUnique({ where: { key: metadata.planKey } });
      if (plan) {
        const periodDays = plan.interval === "YEAR" ? 365 : 31;
        await prisma.subscription.create({
          data: {
            userId: metadata.userId,
            planId: plan.id,
            status: "ACTIVE",
            provider: "stripe",
            providerRef: checkoutSession.subscription as string | null,
            currentPeriodEnd: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await prisma.subscription.updateMany({
      where: { providerRef: subscription.id },
      data: { status: "CANCELED" },
    });
  }

  return NextResponse.json({ received: true });
}
