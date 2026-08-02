export function generateResellerSlug(seed: string): string {
  const base = seed
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "reseller"}-${suffix}`;
}
