"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import { useAdminStore } from "@/store/adminStore";

// Pulls directly from the live catalog (same store the Shop page and Admin
// Dashboard use) — any product that has a video set in Admin → Products
// automatically shows up here, in the most-recently-added order. Removing a
// product's video (or the product itself) removes it from this row too, so
// the section is fully admin-managed without needing a separate screen.
const MAX_CLIPS = 8;


function VideoCard({ clip, delay }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const play = () => videoRef.current?.play().catch(() => {});
  const pause = () => videoRef.current?.pause();

  return (
    <Reveal delay={delay} className="shrink-0 w-[220px] sm:w-[240px] snap-start">
      <Link
        href={`/product/${clip.slug}`}
        className="group relative block w-full aspect-[9/16] overflow-hidden rounded-2xl bg-forest shadow-sm hover:shadow-xl hover:-translate-y-1 transition-[box-shadow,transform] duration-500 ease-apple"
      >
        <motion.video
          ref={videoRef}
          src={clip.video}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          viewport={{ once: false, amount: 0.6 }}
          onViewportEnter={play}
          onViewportLeave={pause}
          className="product-photo-tone absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMuted((m) => !m);
          }}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-cream hover:bg-black/60 transition-colors duration-300"
        >
          {muted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9v6h4l5 5V4L7 9H3z" />
              <path d="M16 9l5 5M21 9l-5 5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9v6h4l5 5V4L7 9H3z" />
              <path d="M15.5 8.5a5 5 0 010 7M18 6a9 9 0 010 12" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-serif text-cream text-sm leading-snug">{clip.name}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gold text-xs tracking-wide">₹{clip.price.toLocaleString("en-IN")}</span>
            <span className="text-cream/80 text-[11px] uppercase tracking-widest inline-flex items-center gap-1">
              Shop
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function WatchAndShop() {
  const products = useAdminStore((s) => s.products);
  const loading = useAdminStore((s) => s.loading);

  const clips = useMemo(() => {
    return products
      .filter((p) => p.video && p.is_active !== false)
      .sort((a, b) => b.id - a.id)
      .slice(0, MAX_CLIPS)
      .map((p) => ({ slug: p.slug, name: p.name, price: p.price, video: p.video }));
  }, [products]);

  // Nothing to show yet (still loading, or no product currently has a video) —
  // render nothing rather than an empty/broken-looking section.
  if (!loading && clips.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <Reveal className="text-center mb-12">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">In Motion</p>
        <h2 className="font-serif text-3xl md:text-5xl text-forest">Watch &amp; Shop</h2>
        <p className="text-forest/60 mt-4 max-w-xl mx-auto">
          Real reels, playing as you scroll — tap any piece to shop it.
        </p>
      </Reveal>

      <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[220px] sm:w-[240px] aspect-[9/16] rounded-2xl bg-forest/10 animate-pulse"
              />
            ))
          : clips.map((clip, idx) => <VideoCard key={clip.slug} clip={clip} delay={idx * 0.06} />)}
      </div>
    </section>
  );
}

