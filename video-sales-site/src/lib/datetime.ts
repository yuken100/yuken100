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
