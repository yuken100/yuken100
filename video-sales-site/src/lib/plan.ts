import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SitePlan = "BASIC" | "PRO";

export async function getSitePlan(): Promise<SitePlan> {
  // Read on every request rather than being baked into a statically
  // generated page — otherwise toggling the plan in /admin/settings
  // wouldn't take effect until the next deploy.
  noStore();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return settings?.plan === "BASIC" ? "BASIC" : "PRO";
}

export async function isProPlan(): Promise<boolean> {
  return (await getSitePlan()) === "PRO";
}
