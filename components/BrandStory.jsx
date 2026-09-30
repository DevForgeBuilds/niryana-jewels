"use client";

import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/data/mediaManifest";
import Reveal from "./Reveal";

export default function BrandStory() {
  return (
    <section className="bg-gradient-to-r from-cream via-cream-soft to-forest py-24 md:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <Reveal className="text-center max-w-lg mx-auto md:mx-0 md:ml-auto md:mr-10">
          <p className="text-gold uppercase tracking-widest2 text-xs mb-4">Heart &amp; Heritage</p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-6 text-forest">
            Every piece carries a story worth telling.
          </h2>
          <p className="text-charcoal/70 leading-relaxed mb-4">
            Niryana Jewels was born from a love for craftsmanship and devotion — from
            delicate everyday pendants to Mahadev &amp; Shree Ram pieces carried close
            to the heart, like the hand-finished pendant shown here. Each design is
            handcrafted in Surat, blending timeless Indian heritage with a modern,
            minimal aesthetic.
          </p>
          <p className="text-charcoal/50 text-sm leading-relaxed mb-6">
            Shop No. 324, 3rd Floor, Prime Arcade, Beside Raghuvir Shoppers, Lajamni Chowk,
            Mota Varachha, Surat – 394101, Gujarat.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 font-medium text-forest hover:text-gold transition-colors duration-300 group"
          >
            Contact Us
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>

        <Reveal delay={0.15} className="flex justify-center md:justify-end">
          <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={ASSETS.shreeRamPendant}
              alt="Shree Ram devotional pendant, handcrafted in 925 sterling silver"
              fill
              sizes="(max-width: 768px) 60vw, 320px"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
