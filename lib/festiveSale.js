// The store and all its customers are in India, and `saleStartsAt`/`saleEndsAt`
// are stored as naive "YYYY-MM-DDTHH:mm:ss" strings (whatever the admin typed
// into a plain datetime-local field) with no timezone attached — always meant
// as IST (UTC+5:30) wall-clock time. Passing a bare string like that straight
// into `new Date(...)` gets parsed as UTC by JS engines, silently shifting the
// sale window by 5.5 hours (e.g. a 9:37 PM IST start looks like it hasn't
// started until 3:07 AM IST the next day). Appending the explicit IST offset
// here keeps the parsed instant correct regardless of server/visitor timezone.
export function parseIstDateTime(value) {
  if (!value) return null;
  return new Date(`${value}+05:30`);
}

// Shared helper for the festive-sale banner feature — a collection counts as
// "on sale" when an admin has turned the banner on AND (if set) the current
// moment falls within its start/end window. saleEndsAt is optional: a banner
// with no end date just runs indefinitely (no countdown shown) until the admin
// turns bannerEnabled off.
export function isSaleActive(collection) {
  if (!collection || !collection.bannerEnabled) return false;
  const now = Date.now();
  const start = parseIstDateTime(collection.saleStartsAt);
  const end = parseIstDateTime(collection.saleEndsAt);
  if (start && now < start.getTime()) return false;
  if (end && now > end.getTime()) return false;
  return true;
}
