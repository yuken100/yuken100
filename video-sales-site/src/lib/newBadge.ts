const NEW_BADGE_DAYS = 7;
const NEW_BADGE_MAX_COUNT = 3;

function isWithinNewWindow(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() < NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
}

// items must already be sorted by createdAt desc (as they always are for these
// listings). Only the most recently added few, and only while still within the
// time window, get flagged — so adding a batch of content on the same day
// doesn't tag the whole catalog as NEW at once.
export function pickNewIds<T extends { id: string; createdAt: Date }>(items: T[]): Set<string> {
  const ids = new Set<string>();
  for (const item of items.slice(0, NEW_BADGE_MAX_COUNT)) {
    if (isWithinNewWindow(item.createdAt)) ids.add(item.id);
  }
  return ids;
}
