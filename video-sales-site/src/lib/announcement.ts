import { isWithinNewWindow } from "@/lib/newBadge";

export type AnnouncementItem = {
  typeLabel: string;
  text: string;
  href: string | null;
  createdAt: Date;
};

const MAX_AUTO_ITEMS = 5;

// Auto-picks every recently published video/lesson (same "new" window as the
// NEW badges) so the homepage banner never drops one type in favor of
// another — it lists all of them, newest first, capped at MAX_AUTO_ITEMS.
function pickAutoAnnouncements(
  videos: { slug: string; title: string; createdAt: Date }[],
  lessons: { slug: string; title: string; createdAt: Date }[]
): AnnouncementItem[] {
  const items: AnnouncementItem[] = [
    ...videos
      .filter((video) => isWithinNewWindow(video.createdAt))
      .map((video) => ({
        typeLabel: "講座",
        text: video.title,
        href: `/courses/${video.slug}`,
        createdAt: video.createdAt,
      })),
    ...lessons
      .filter((lesson) => isWithinNewWindow(lesson.createdAt))
      .map((lesson) => ({
        typeLabel: "レッスン",
        text: lesson.title,
        href: `/lessons/${lesson.slug}`,
        createdAt: lesson.createdAt,
      })),
  ];

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return items.slice(0, MAX_AUTO_ITEMS);
}

// The manual announcement (if turned on) is pinned first alongside the
// automatic new-arrivals items, rather than replacing them — so writing a
// one-off announcement never hides that new content exists.
export function buildAnnouncementItems(
  settings: { announcementEnabled: boolean; announcementText: string | null; announcementUrl: string | null } | null | undefined,
  videos: { slug: string; title: string; createdAt: Date }[],
  lessons: { slug: string; title: string; createdAt: Date }[]
): AnnouncementItem[] {
  const items = pickAutoAnnouncements(videos, lessons);
  if (settings?.announcementEnabled && settings.announcementText) {
    items.unshift({
      typeLabel: "お知らせ",
      text: settings.announcementText,
      href: settings.announcementUrl || null,
      createdAt: new Date(),
    });
  }
  return items;
}
