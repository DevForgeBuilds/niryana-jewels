"use client";

import { useAdminStore } from "@/store/adminStore";

// Nudges shoppers to add more to their cart by showing how close they are to
// free shipping — a well-proven way to lift average order value and avoid a
// surprise shipping cost at checkout.
export default function FreeShippingBar({ subtotal }) {
  const threshold = useAdminStore((s) => s.settings?.freeShippingThreshold) || 0;

  if (!threshold || threshold <= 0) return null;

  const remaining = threshold - subtotal;
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <div className="mb-4">
      {remaining > 0 ? (
        <p className="text-xs text-forest mb-1.5">
          Add <span className="font-semibold text-gold">₹{remaining.toLocaleString("en-IN")}</span> more for{" "}
          <span className="font-semibold">FREE shipping</span>
        </p>
      ) : (
        <p className="text-xs text-forest mb-1.5 flex items-center gap-1 font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 7l-9 9-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          You&apos;ve unlocked FREE shipping!
        </p>
      )}
      <div className="h-1.5 w-full bg-forest/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
