import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

// Whether the レッスン予約 (lesson booking + calendar) feature is turned on,
// toggled from /admin/settings. Read on every request rather than being
// baked into a statically generated page — otherwise toggling it wouldn't
// take effect until the next deploy.
export async function areLessonsEnabled(): Promise<boolean> {
  noStore();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return settings?.lessonsEnabled ?? true;
}
