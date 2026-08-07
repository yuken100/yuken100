import { isWithinNewWindow } from "@/lib/newBadge";

export type Announcement = { text: string; href: string };

// Auto-picks the single newest published item (video or lesson) to show in
// the homepage banner, as long as it's still within the "new" window — so
// the banner goes quiet on its own once nothing recent exists, rather than
// showing stale news forever.
export function pickAutoAnnouncement(
  latestVideo: { slug: string; title: string; createdAt: Date } | undefined,
  latestLesson: { slug: string; title: string; createdAt: Date } | undefined
): Announcement | null {
  const candidates: (Announcement & { createdAt: Date })[] = [];

  if (latestVideo && isWithinNewWindow(latestVideo.createdAt)) {
    candidates.push({
      text: `新着講座「${latestVideo.title}」を追加しました`,
      href: `/courses/${latestVideo.slug}`,
      createdAt: latestVideo.createdAt,
    });
  }
  if (latestLesson && isWithinNewWindow(latestLesson.createdAt)) {
    candidates.push({
      text: `新着レッスン「${latestLesson.title}」を追加しました`,
      href: `/lessons/${latestLesson.slug}`,
      createdAt: latestLesson.createdAt,
    });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return { text: candidates[0].text, href: candidates[0].href };
}
