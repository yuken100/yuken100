import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const REF_COOKIE = "ref_slug";
const PLATFORM_FEE_RATE = 0.1;

export function platformFeeJpy(amountJpy: number): number {
  return Math.round(amountJpy * PLATFORM_FEE_RATE);
}

/**
 * Resolves the referring reseller from the `ref_slug` cookie, if any, and
 * only if that reseller has completed Stripe Connect onboarding and can
 * accept Direct Charges.
 */
export async function getReferringReseller() {
  const slug = cookies().get(REF_COOKIE)?.value;
  if (!slug) return null;

  const reseller = await prisma.user.findUnique({ where: { resellerSlug: slug } });
  if (!reseller?.isReseller || !reseller.stripeOnboardingComplete || !reseller.stripeAccountId) {
    return null;
  }
  return reseller;
}
