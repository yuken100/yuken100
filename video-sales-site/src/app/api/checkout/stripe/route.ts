import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getReferringReseller, platformFeeJpy } from "@/lib/referral";

const bodySchema = z.union([
  z.object({ type: z.literal("video"), videoId: z.string() }),
  z.object({ type: z.literal("plan"), planKey: z.string() }),
]);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripeの決済設定が完了していません。管理者はSTRIPE_SECRET_KEYを設定してください。",
      },
      { status: 503 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  try {
    if (parsed.data.type === "video") {
      const video = await prisma.video.findUnique({ where: { id: parsed.data.videoId } });
      if (!video) {
        return NextResponse.json({ error: "講座が見つかりません。" }, { status: 404 });
      }

      const reseller = await getReferringReseller();
      const applicationFeeJpy = reseller ? platformFeeJpy(video.priceJpy) : undefined;

      const checkoutSessionParams = {
        mode: "payment" as const,
        customer_email: session.user.email ?? undefined,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "jpy",
              unit_amount: video.priceJpy,
              product_data: { name: video.title },
            },
          },
        ],
        // When a reseller referred this sale, this Checkout Session is created
        // directly on the reseller's connected account (via the stripeAccount
        // request option below) — a Direct Charge. The reseller is the
        // merchant of record: funds settle to them first, and Stripe carves
        // out our application_fee_amount automatically at the same time.
        ...(reseller && {
          payment_intent_data: { application_fee_amount: applicationFeeJpy },
        }),
        metadata: {
          type: "video",
          videoId: video.id,
          userId: session.user.id,
          ...(reseller && {
            resellerId: reseller.id,
            applicationFeeJpy: String(applicationFeeJpy),
          }),
        },
        success_url: `${siteUrl}/courses/${video.slug}?checkout=success`,
        cancel_url: `${siteUrl}/courses/${video.slug}?checkout=cancel`,
      };

      const checkoutSession = reseller
        ? await stripe.checkout.sessions.create(checkoutSessionParams, {
            stripeAccount: reseller.stripeAccountId as string,
          })
        : await stripe.checkout.sessions.create(checkoutSessionParams);

      return NextResponse.json({ url: checkoutSession.url });
    }

    const plan = await prisma.plan.findUnique({ where: { key: parsed.data.planKey } });
    if (!plan || plan.interval === "SINGLE") {
      return NextResponse.json({ error: "プランが見つかりません。" }, { status: 404 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "jpy",
            unit_amount: plan.priceJpy,
            recurring: { interval: plan.interval === "YEAR" ? "year" : "month" },
            product_data: { name: plan.name },
          },
        },
      ],
      metadata: {
        type: "plan",
        planKey: plan.key,
        userId: session.user.id,
      },
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancel`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json({ error: "決済の開始に失敗しました。" }, { status: 500 });
  }
}
