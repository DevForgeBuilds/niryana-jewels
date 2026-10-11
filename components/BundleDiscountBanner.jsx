"use client";

import { useAdminStore } from "@/store/adminStore";
import { computeBundleDiscount } from "@/lib/bundleDiscount";

// Nudges shoppers toward a bigger cart: shows how many more items they need
// to unlock the automatic bundle discount, or confirms it's already active.
export default function BundleDiscountBanner({ items }) {
  const settings = useAdminStore((s) => s.settings);
  const bundle = computeBundleDiscount(items, settings);

  if (!bundle.enabled || bundle.percent <= 0) return null;

  const remaining = bundle.minItems - bundle.totalQty;

  return (
    <div className="mb-4">
      {bundle.applies ? (
        <p className="text-xs text-forest flex items-center gap-1.5 font-medium bg-gold/15 rounded-lg px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 7l-9 9-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {bundle.percent}% Bundle Discount applied — {bundle.minItems}+ items in cart!
        </p>
      ) : (
        <p className="text-xs text-forest bg-cream-soft rounded-lg px-3 py-2">
          🎁 Add <span className="font-semibold text-gold">{remaining} more item{remaining > 1 ? "s" : ""}</span> to
          unlock an extra <span className="font-semibold">{bundle.percent}% off</span>
        </p>
      )}
    </div>
  );
}
