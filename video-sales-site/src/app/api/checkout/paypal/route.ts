import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaypalAccessToken, isPaypalConfigured, PAYPAL_API_BASE } from "@/lib/paypal";

const bodySchema = z.object({ type: z.literal("video"), videoId: z.string() });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  if (!isPaypalConfigured()) {
    return NextResponse.json(
      {
        error:
          "PayPalの決済設定が完了していません。管理者はPAYPAL_CLIENT_ID/SECRETを設定してください。",
      },
      { status: 503 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  const video = await prisma.video.findUnique({ where: { id: parsed.data.videoId } });
  if (!video) {
    return NextResponse.json({ error: "講座が見つかりません。" }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const customId = JSON.stringify({ t: "video", v: video.id, u: session.user.id });

  try {
    const accessToken = await getPaypalAccessToken();
    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: customId,
            description: video.title.slice(0, 127),
            amount: {
              currency_code: "JPY",
              value: String(video.priceJpy),
            },
          },
        ],
        application_context: {
          return_url: `${siteUrl}/api/checkout/paypal/capture`,
          cancel_url: `${siteUrl}/courses/${video.slug}?checkout=cancel`,
          brand_name: "Sara Yoga",
          user_action: "PAY_NOW",
        },
      }),
    });

    const order = await orderRes.json();
    if (!orderRes.ok) {
      console.error("PayPal order creation failed", order);
      return NextResponse.json({ error: "決済の開始に失敗しました。" }, { status: 500 });
    }

    const approveLink = (order.links as { rel: string; href: string }[]).find(
      (link) => link.rel === "approve"
    );

    return NextResponse.json({ url: approveLink?.href });
  } catch (error) {
    console.error("PayPal checkout error", error);
    return NextResponse.json({ error: "決済の開始に失敗しました。" }, { status: 500 });
  }
}
