"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAdminStore } from "@/store/adminStore";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import Breadcrumbs from "@/components/Breadcrumbs";
import Reveal from "@/components/Reveal";

function ShopContent() {
  const params = useSearchParams();
  const router = useRouter();
  const PRODUCTS = useAdminStore((s) => s.products);
  const CATEGORIES_RAW = useAdminStore((s) => s.categories);
  // Keep the shop filter alphabetical regardless of admin-list insertion order.
  const CATEGORIES = useMemo(
    () => [...CATEGORIES_RAW].sort((a, b) => a.name.localeCompare(b.name)),
    [CATEGORIES_RAW]
  );
  const loading = useAdminStore((s) => s.loading);
  const initialCategory = params.get("category") || "all";
  const searchQuery = params.get("search") || "";
  const [category, setCategory] = useState(initialCategory);
  const [metal, setMetal] = useState("all");
  const [sort, setSort] = useState("featured");

  const PRICE_MIN = 0;
  const PRICE_MAX = useMemo(
    () => (PRODUCTS.length ? Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 5000) * 5000 : 50000),
    [PRODUCTS]
  );
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!filtersOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setFiltersOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  const metals = useMemo(() => ["all", ...new Set(PRODUCTS.map((p) => p.metal))], [PRODUCTS]);

  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (metal !== "all" ? 1 : 0) +
    (priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX ? 1 : 0);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => category === "all" || p.category === category);
    if (metal !== "all") list = list.filter((p) => p.metal === metal);
    const [lo, hi] = priceRange[1] > 0 ? priceRange : [PRICE_MIN, PRICE_MAX];
    list = list.filter((p) => p.price >= lo && p.price <= hi);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.metal?.toLowerCase().includes(q) ||
          p.stone?.toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [PRODUCTS, category, metal, sort, priceRange, searchQuery, PRICE_MAX]);

  function handleMinChange(e) {
    const value = Math.min(Number(e.target.value), priceRange[1] - 500);
    setPriceRange([value, priceRange[1]]);
  }

  function handleMaxChange(e) {
    const value = Math.max(Number(e.target.value), priceRange[0] + 500);
    setPriceRange([priceRange[0], value]);
  }

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-6">
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <Reveal className="text-center mb-14">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Shop</p>
        <h1 className="font-serif text-4xl md:text-5xl text-forest">The Collection</h1>
      </Reveal>

      {searchQuery.trim() && (
        <div className="flex items-center justify-center gap-3 mb-8 text-sm">
          <p className="text-charcoal/60">
            Showing results for <span className="text-forest font-medium">"{searchQuery}"</span>
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="text-gold hover:text-forest uppercase tracking-widest text-xs"
          >
            Clear ✕
          </button>
        </div>
      )}

      {/* Desktop: filters shown inline, unchanged */}
      <div className="hidden md:block">
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <button
            onClick={() => setCategory("all")}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-colors ${
              category === "all" ? "bg-forest text-cream border-forest" : "border-forest/30 text-forest"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-colors ${
                category === c.slug ? "bg-forest text-cream border-forest" : "border-forest/30 text-forest"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-14 text-sm">
          <select
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
            aria-label="Filter by metal"
            className="border border-forest/20 rounded-full px-4 py-2 bg-white"
          >
            {metals.map((m) => (
              <option key={m} value={m}>
                {m === "all" ? "All Metals" : m}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
            className="border border-forest/20 rounded-full px-4 py-2 bg-white"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div className="max-w-md mx-auto mb-14 px-2">
          <div className="flex justify-between text-xs uppercase tracking-widest text-charcoal/50 mb-3">
            <span>Price Range</span>
            <span className="text-forest font-medium normal-case tracking-normal">
              ₹{priceRange[0].toLocaleString("en-IN")} – ₹{priceRange[1].toLocaleString("en-IN")}
            </span>
          </div>
          <div className="relative h-6 flex items-center">
            <div className="absolute w-full h-1 bg-forest/10 rounded-full" />
            <div
              className="absolute h-1 bg-gold rounded-full"
              style={{
                left: `${(priceRange[0] / PRICE_MAX) * 100}%`,
                right: `${100 - (priceRange[1] / PRICE_MAX) * 100}%`,
              }}
            />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={500}
              value={priceRange[0]}
              onChange={handleMinChange}
              aria-label="Minimum price"
              aria-valuetext={`₹${priceRange[0].toLocaleString("en-IN")}`}
              className="range-thumb absolute w-full appearance-none bg-transparent pointer-events-none"
            />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={500}
              value={priceRange[1]}
              onChange={handleMaxChange}
              aria-label="Maximum price"
              aria-valuetext={`₹${priceRange[1].toLocaleString("en-IN")}`}
              className="range-thumb absolute w-full appearance-none bg-transparent pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Mobile: compact "Filters" button + Sort dropdown, full filter set lives in a slide-up drawer */}
      <div className="md:hidden flex items-center gap-3 mb-8">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 border border-forest/20 rounded-full px-4 py-2.5 text-xs uppercase tracking-widest text-forest bg-white"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-forest text-cream rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort products"
          className="flex-1 border border-forest/20 rounded-full px-4 py-2.5 bg-white text-xs"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="md:hidden fixed inset-0 bg-charcoal/50 z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-label="Filter products"
              className="md:hidden fixed bottom-0 left-0 right-0 z-[101] bg-cream rounded-t-3xl max-h-[85vh] overflow-y-auto px-6 pt-5 pb-8"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl text-forest">Filters</h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A2F" strokeWidth="2">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-3">Category</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setCategory("all")}
                  className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-colors ${
                    category === "all" ? "bg-forest text-cream border-forest" : "border-forest/30 text-forest"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setCategory(c.slug)}
                    className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-colors ${
                      category === c.slug ? "bg-forest text-cream border-forest" : "border-forest/30 text-forest"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-3">Metal</p>
              <select
                value={metal}
                onChange={(e) => setMetal(e.target.value)}
                aria-label="Filter by metal"
                className="w-full border border-forest/20 rounded-full px-4 py-2.5 bg-white mb-6"
              >
                {metals.map((m) => (
                  <option key={m} value={m}>
                    {m === "all" ? "All Metals" : m}
                  </option>
                ))}
              </select>

              <div className="flex justify-between text-xs uppercase tracking-widest text-charcoal/50 mb-3">
                <span>Price Range</span>
                <span className="text-forest font-medium normal-case tracking-normal">
                  ₹{priceRange[0].toLocaleString("en-IN")} – ₹{priceRange[1].toLocaleString("en-IN")}
                </span>
              </div>
              <div className="relative h-6 flex items-center mb-8">
                <div className="absolute w-full h-1 bg-forest/10 rounded-full" />
                <div
                  className="absolute h-1 bg-gold rounded-full"
                  style={{
                    left: `${(priceRange[0] / PRICE_MAX) * 100}%`,
                    right: `${100 - (priceRange[1] / PRICE_MAX) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={500}
                  value={priceRange[0]}
                  onChange={handleMinChange}
                  aria-label="Minimum price"
                  aria-valuetext={`₹${priceRange[0].toLocaleString("en-IN")}`}
                  className="range-thumb absolute w-full appearance-none bg-transparent pointer-events-none"
                />
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={500}
                  value={priceRange[1]}
                  onChange={handleMaxChange}
                  aria-label="Maximum price"
                  aria-valuetext={`₹${priceRange[1].toLocaleString("en-IN")}`}
                  className="range-thumb absolute w-full appearance-none bg-transparent pointer-events-none"
                />
              </div>

              <div className="flex gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setCategory("all");
                      setMetal("all");
                      setPriceRange([PRICE_MIN, PRICE_MAX]);
                    }}
                    className="flex-1 py-3 rounded-full text-xs uppercase tracking-widest border border-forest/30 text-forest"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 py-3 rounded-full text-xs uppercase tracking-widest bg-forest text-cream"
                >
                  Show {filtered.length} Result{filtered.length === 1 ? "" : "s"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {loading ? (
        <ProductGridSkeleton />
      ) : filtered.length === 0 ? (
        <p className="text-center text-charcoal/60">No products in this filter yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopClient() {
  return (
    <Suspense fallback={<div className="pt-40 text-center text-forest">Loading…</div>}>
      <ShopContent />
    </Suspense>
  );
}
