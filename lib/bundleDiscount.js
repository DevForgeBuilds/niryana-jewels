// Automatic "buy N+ items, get X% off" incentive — fully admin-configurable
// from Settings, no coupon code required. Applied on top of any coupon
// discount to encourage larger cart sizes.
export function computeBundleDiscount(items = [], settings = {}) {
  const enabled = Boolean(settings.bundleDiscountEnabled);
  const minItems = Number(settings.bundleMinItems) || 2;
  const percent = Number(settings.bundleDiscountPercent) || 0;
  const totalQty = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const applies = enabled && percent > 0 && totalQty >= minItems;

  return { enabled, minItems, percent, totalQty, applies };
}

export function bundleDiscountAmount(subtotal, bundleInfo) {
  if (!bundleInfo.applies) return 0;
  return Math.round(subtotal * (bundleInfo.percent / 100));
}
