// Shared helper for the festive-sale banner feature — a collection counts as
// "on sale" when an admin has turned the banner on AND (if set) the current
// moment falls within its start/end window. saleEndsAt is optional: a banner
// with no end date just runs indefinitely (no countdown shown) until the admin
// turns bannerEnabled off.
export function isSaleActive(collection) {
  if (!collection || !collection.bannerEnabled) return false;
  const now = Date.now();
  if (collection.saleStartsAt && now < new Date(collection.saleStartsAt).getTime()) return false;
  if (collection.saleEndsAt && now > new Date(collection.saleEndsAt).getTime()) return false;
  return true;
}
