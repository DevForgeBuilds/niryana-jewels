"use client";

import Link from "next/link";
import { useAdminStore } from "@/store/adminStore";
import Reveal from "@/components/Reveal";

export default function CollectionsIndexClient() {
  const collections = useAdminStore((s) => s.festiveCollections);

  return (
    <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
      {collections.map((c, i) => (
        <Reveal key={c.slug} delay={i * 0.1}>
          <Link
            href={`/collections/${c.slug}`}
            className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-shadow duration-500"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-forest">
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
              <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                <p className="text-gold uppercase tracking-widest text-xs mb-2">{c.tagline}</p>
                <h2 className="font-serif text-2xl text-white">{c.name}</h2>
              </div>
            </div>
          </Link>
        </Reveal>
      ))}
      {collections.length === 0 && (
        <p className="md:col-span-3 text-center text-charcoal/60 py-16">
          New collections are coming soon — check back shortly!
        </p>
      )}
    </section>
  );
}
