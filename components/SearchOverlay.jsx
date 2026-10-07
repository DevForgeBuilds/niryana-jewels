"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS } from "@/data/products";

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.metal?.toLowerCase().includes(q) ||
        p.stone?.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  function goToResults() {
    if (!query.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed top-0 left-0 right-0 z-[90] bg-cream shadow-2xl"
          >
            <div className="max-w-2xl mx-auto px-6 pt-8 pb-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  goToResults();
                }}
                className="flex items-center gap-3 border-b border-forest/20 pb-4"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2F6B4F" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search rings, earrings, pendants…"
                  className="flex-1 bg-transparent text-forest text-lg placeholder:text-forest/40 outline-none"
                />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="text-forest/50 hover:text-forest text-sm"
                >
                  ESC
                </button>
              </form>

              {query.trim() && (
                <div className="mt-4">
                  {results.length === 0 ? (
                    <p className="text-charcoal/50 text-sm py-6 text-center">
                      No products found for "{query}"
                    </p>
                  ) : (
                    <>
                      <div className="space-y-1">
                        {results.map((p) => (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-4 p-2 rounded-xl hover:bg-cream-soft transition-colors"
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream-soft shrink-0">
                              {p.images?.[0] && (
                                <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-forest text-sm font-medium truncate">{p.name}</p>
                              <p className="text-charcoal/50 text-xs capitalize">{p.category}</p>
                            </div>
                            <p className="text-forest text-sm shrink-0">₹{p.price.toLocaleString("en-IN")}</p>
                          </Link>
                        ))}
                      </div>
                      <button
                        onClick={goToResults}
                        className="mt-3 w-full text-center text-xs uppercase tracking-widest text-gold hover:text-forest py-2"
                      >
                        View all results for "{query}" →
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
