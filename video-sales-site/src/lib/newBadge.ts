const NEW_BADGE_DAYS = 14;

export function isNewItem(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() < NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
}
