"use client";

import Link from "next/link";
import { useAdminStore } from "@/store/adminStore";
import { isSaleActive } from "@/lib/festiveSale";
import CountdownTimer from "./CountdownTimer";
import Reveal from "./Reveal";

export default function FestiveBanner() {
  const collections = useAdminStore((s) => s.festiveCollections);

  if (!collections.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <Reveal className="text-center mb-14">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Shop by Occasion</p>
        <h2 className="font-serif text-3xl md:text-5xl text-forest">Festive Collections</h2>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {collections.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.1}>
            <Link
              href={`/collections/${c.slug}`}
              className="group relative block aspect-[4/5] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 bg-forest"
            >
              {c.heroImage && (
                // Admin-entered URLs can be from any domain, so a plain <img> is used
                // here instead of next/image (which requires a pre-configured allowlist).
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.heroImage}
                  alt={`${c.name} — handcrafted jewellery by Niryana Jewels`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-apple group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/10 to-transparent" />
              {isSaleActive(c) && c.discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-gold text-forest text-xs font-semibold px-3 py-1.5 rounded-full z-10">
                  {c.discountPercent}% OFF
                </span>
              )}
              {isSaleActive(c) && c.saleEndsAt && (
                <span className="absolute top-4 right-4 bg-black/55 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full z-10">
                  Ends in <CountdownTimer targetDate={c.saleEndsAt} />
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                <p className="text-gold uppercase tracking-widest text-xs mb-2">{c.tagline}</p>
                <h3 className="font-serif text-xl text-white">{c.name}</h3>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
