"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAdminStore } from "@/store/adminStore";
import { isSaleActive } from "@/lib/festiveSale";
import { toast } from "@/store/toastStore";
import CountdownTimer from "./CountdownTimer";
import Reveal from "./Reveal";

// Prominent homepage strip announcing any currently-active festive sale(s) —
// admin-configured in Admin → Festive Collections (discount %, optional coupon
// code, sale start/end window, and a "show homepage banner" toggle). Purely a
// marketing/visibility layer: the real discount at checkout still goes through
// the existing coupon system, so this never silently changes a product's price.
export default function FestiveSaleBanner() {
  const collections = useAdminStore((s) => s.festiveCollections);

  const activeSales = useMemo(
    () =>
      collections
        .filter(isSaleActive)
        .sort((a, b) => {
          const aEnd = a.saleEndsAt ? new Date(a.saleEndsAt).getTime() : Infinity;
          const bEnd = b.saleEndsAt ? new Date(b.saleEndsAt).getTime() : Infinity;
          return aEnd - bEnd;
        }),
    [collections]
  );

  if (!activeSales.length) return null;

  function copyCode(code) {
    navigator.clipboard?.writeText(code);
    toast(`Coupon code "${code}" copied`, "success");
  }

  return (
    <section className="bg-forest">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
        {activeSales.slice(0, 2).map((c) => (
          <Reveal key={c.slug}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
                <span className="text-gold uppercase tracking-widest text-xs">{c.name}</span>
                {c.discountPercent > 0 && (
                  <span className="bg-gold text-forest text-xs font-semibold px-2.5 py-1 rounded-full">
                    {c.discountPercent}% OFF
                  </span>
                )}
                {c.saleEndsAt && (
                  <span className="text-cream/80 text-xs">
                    Ends in{" "}
                    <CountdownTimer targetDate={c.saleEndsAt} className="text-cream font-medium" />
                  </span>
                )}
                {c.couponCode && (
                  <button
                    onClick={() => copyCode(c.couponCode)}
                    className="text-xs text-cream/90 border border-cream/30 rounded-full px-2.5 py-1 hover:border-gold hover:text-gold transition-colors"
                    title="Click to copy"
                  >
                    Use code <span className="font-semibold">{c.couponCode}</span>
                  </button>
                )}
              </div>
              <Link
                href={`/collections/${c.slug}`}
                className="shrink-0 text-xs uppercase tracking-widest bg-gold text-forest px-5 py-2 rounded-full hover:bg-cream transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
