"use client";

import { HERO_VIDEO, HERO_POSTER_IMAGE } from "@/data/mediaManifest";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-forest">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-80"
        src={HERO_VIDEO}
        poster={HERO_POSTER_IMAGE}
        aria-label="Niryana Jewels handcrafted fine jewellery showcase"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest/60 via-forest/20 to-forest/80" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-gold tracking-widest2 uppercase text-xs md:text-sm mb-4"
        >
          Fine Jewellery with Heart &amp; Heritage
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-white text-5xl md:text-7xl lg:text-8xl font-medium leading-tight max-w-4xl"
        >
          Niryana Jewels
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-cream/90 mt-6 max-w-xl text-base md:text-lg"
        >
          Handcrafted rings, earrings, pendants &amp; devotional pieces — designed to
          become a part of your story.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex gap-4"
        >
          <Link
            href="/shop"
            className="bg-gold text-forest px-8 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-gold-light transition-colors duration-300"
          >
            Shop Collection
          </Link>
          <Link
            href="/about"
            className="border border-cream/70 text-cream px-8 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-cream/10 transition-colors duration-300"
          >
            Our Story
          </Link>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/80 z-10"
      >
        <svg width="20" height="32" viewBox="0 0 20 32" fill="none">
          <rect x="1" y="1" width="18" height="30" rx="9" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="10" cy="10" r="2.5" fill="currentColor" />
        </svg>
      </motion.div>
    </section>
  );
}
