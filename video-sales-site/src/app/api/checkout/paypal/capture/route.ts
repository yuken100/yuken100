import { NextResponse } from "next/server";
import { getPaypalAccessToken, PAYPAL_API_BASE } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/courses?checkout=cancel`);
  }

  try {
    const accessToken = await getPaypalAccessToken();
    const captureRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${token}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const capture = await captureRes.json();

    if (!captureRes.ok) {
      console.error("PayPal capture failed", capture);
      return NextResponse.redirect(`${siteUrl}/courses?checkout=error`);
    }

    const purchaseUnit = capture.purchase_units?.[0];
    const customId: string | undefined = purchaseUnit?.payments?.captures?.[0]?.custom_id;

    if (customId) {
      const parsed = JSON.parse(customId) as { t: string; v: string; u: string };
      if (parsed.t === "video") {
        const video = await prisma.video.findUnique({ where: { id: parsed.v } });
        if (video) {
          await prisma.purchase.upsert({
            where: { userId_videoId: { userId: parsed.u, videoId: video.id } },
            update: { status: "PAID" },
            create: {
              userId: parsed.u,
              videoId: video.id,
              amountJpy: video.priceJpy,
              provider: "paypal",
              providerRef: token,
              status: "PAID",
            },
          });
          return NextResponse.redirect(`${siteUrl}/courses/${video.slug}?checkout=success`);
        }
      }
    }

    return NextResponse.redirect(`${siteUrl}/dashboard?checkout=success`);
  } catch (error) {
    console.error("PayPal capture error", error);
    return NextResponse.redirect(`${siteUrl}/courses?checkout=error`);
  }
}
