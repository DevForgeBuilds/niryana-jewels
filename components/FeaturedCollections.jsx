"use client";

import Image from "next/image";
import Link from "next/link";
import { CATEGORY_MEDIA } from "@/data/mediaManifest";
import Reveal from "./Reveal";

const ORDER = ["rings", "earrings", "pendants", "necklaces", "bracelets", "devotional"];

export default function FeaturedCollections() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <Reveal className="text-center mb-16">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Collections</p>
        <h2 className="font-serif text-3xl md:text-5xl text-forest">Featured Collections</h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {ORDER.map((key, idx) => {
          const c = CATEGORY_MEDIA[key];
          return (
            <Reveal key={key} delay={idx * 0.08}>
              <Link
                href={`/shop?category=${key}`}
                className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-shadow duration-500"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={c.image}
                    alt={`${c.name} collection — handcrafted jewellery by Niryana Jewels`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-apple group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/50 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif text-white text-2xl">{c.name}</h3>
                    <span className="text-gold text-xs tracking-widest uppercase mt-1 inline-flex items-center gap-1">
                      Explore
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
