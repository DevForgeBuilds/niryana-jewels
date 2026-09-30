"use client";

import Image from "next/image";
import { ASSETS } from "@/data/mediaManifest";
import Reveal from "./Reveal";

const posts = [
  ASSETS.heartRingHand,
  ASSETS.earringsStillLife,
  ASSETS.shreeRamPendant,
  ASSETS.necklaceDiamond,
  ASSETS.fullLookNecklace,
  ASSETS.braceletEmeraldSatin,
];

export default function InstagramFeed() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <Reveal className="text-center mb-14">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">@niryana_jewels</p>
        <h2 className="font-serif text-3xl md:text-5xl text-forest">From Our Instagram</h2>
        <a
          href="https://instagram.com/niryana_jewels"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-4 text-sm tracking-widest uppercase text-forest border-b border-gold hover:text-gold transition-colors"
        >
          Follow us
        </a>
      </Reveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {posts.map((src, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <a
              href="https://instagram.com/niryana_jewels"
              target="_blank"
              rel="noreferrer"
              className="relative block aspect-square rounded-xl overflow-hidden group"
            >
              <Image
                src={src}
                alt="Niryana Jewels Instagram post"
                fill
                sizes="200px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/30 transition-colors duration-300 flex items-center justify-center">
                <svg
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
                </svg>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
