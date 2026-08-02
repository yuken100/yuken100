import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(
      new URL("/login?callbackUrl=/dashboard", siteUrl())
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isReseller) {
    return NextResponse.json({ error: "販売代理店として登録されていません。" }, { status: 403 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripeの決済設定が完了していません。管理者に確認してください。" },
      { status: 503 }
    );
  }

  const stripe = getStripe();

  try {
    let accountId = user.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${siteUrl()}/api/reseller/connect/refresh`,
      return_url: `${siteUrl()}/api/reseller/connect/return`,
      type: "account_onboarding",
    });

    return NextResponse.redirect(accountLink.url);
  } catch (error) {
    console.error("Stripe Connect onboarding error", error);
    return NextResponse.json({ error: "連携の開始に失敗しました。" }, { status: 500 });
  }
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
