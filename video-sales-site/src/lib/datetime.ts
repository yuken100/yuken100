// The server runs in UTC, but the site is JST-only, so every date/time
// shown to a user must pin timeZone explicitly — otherwise
// toLocaleString/toLocaleDateString silently render in the server's UTC
// clock instead of the time an admin actually entered.
const JST = "Asia/Tokyo";

export function formatJstDateTime(date: Date): string {
  return date.toLocaleString("ja-JP", {
    timeZone: JST,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatJstDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", { timeZone: JST });
}

export function formatJstTime(date: Date): string {
  return date.toLocaleTimeString("ja-JP", {
    timeZone: JST,
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Returns "YYYY-MM-DD" for the given instant, as a JST calendar date —
// used as a grouping key so a slot always lands on the day an admin/user
// would actually call "today" in Japan, regardless of server timezone.
export function jstDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
