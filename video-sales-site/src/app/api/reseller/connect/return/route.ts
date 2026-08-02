import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(`${siteUrl}/login`);
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeAccountId) {
    return NextResponse.redirect(`${siteUrl}/dashboard`);
  }

  try {
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    const complete = Boolean(account.details_submitted && account.charges_enabled);

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeOnboardingComplete: complete },
    });

    return NextResponse.redirect(
      `${siteUrl}/dashboard?stripe=${complete ? "connected" : "incomplete"}`
    );
  } catch (error) {
    console.error("Stripe Connect return error", error);
    return NextResponse.redirect(`${siteUrl}/dashboard?stripe=error`);
  }
}
