import { prisma } from "@/lib/prisma";

export async function hasActiveMembership(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: new Date() } }],
    },
  });
  return Boolean(subscription);
}

export async function canWatchVideo(userId: string, videoId: string): Promise<boolean> {
  const purchase = await prisma.purchase.findFirst({
    where: { userId, videoId, status: "PAID" },
  });
  if (purchase) return true;

  return hasActiveMembership(userId);
}
