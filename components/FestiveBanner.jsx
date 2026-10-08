"use client";

import Image from "next/image";
import Link from "next/link";
import { FESTIVE_COLLECTIONS } from "@/data/products";
import Reveal from "./Reveal";

export default function FestiveBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <Reveal className="text-center mb-14">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Shop by Occasion</p>
        <h2 className="font-serif text-3xl md:text-5xl text-forest">Festive Collections</h2>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {FESTIVE_COLLECTIONS.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.1}>
            <Link
              href={`/collections/${c.slug}`}
              className="group relative block aspect-[4/5] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500"
            >
              <Image
                src={c.heroImage}
                alt={`${c.name} — handcrafted jewellery by Niryana Jewels`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-apple group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/10 to-transparent" />
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
