// Computes which products are genuine "Bestsellers" from real order history,
// instead of a manually-toggled flag that could be left on/inaccurate. A
// product only earns the badge once it has actually sold a meaningful
// quantity — so on a brand-new store with little order history, nothing gets
// badged (no false social proof), and the badge becomes accurate automatically
// as real sales come in.
const MIN_UNITS_SOLD = 3;
const MAX_BESTSELLERS = 6;

export function computeBestsellerIds(orders = [], topN = MAX_BESTSELLERS, minSold = MIN_UNITS_SOLD) {
  const counts = new Map();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const item of order.items || []) {
      if (!item.productId) continue;
      counts.set(item.productId, (counts.get(item.productId) || 0) + (item.quantity || 1));
    }
  }
  return new Set(
    Array.from(counts.entries())
      .filter(([, qty]) => qty >= minSold)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([productId]) => productId)
  );
}
