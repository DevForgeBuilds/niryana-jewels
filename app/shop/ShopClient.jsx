"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

const PRICE_MIN = 0;
const PRICE_MAX = Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 5000) * 5000;

function ShopContent() {
  const params = useSearchParams();
  const router = useRouter();
  const initialCategory = params.get("category") || "all";
  const searchQuery = params.get("search") || "";
  const [category, setCategory] = useState(initialCategory);
  const [metal, setMetal] = useState("all");
  const [sort, setSort] = useState("featured");
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);

  const metals = useMemo(
    () => ["all", ...new Set(PRODUCTS.map((p) => p.metal))],
    []
  );

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(
      (p) => category === "all" || p.category === category
    );
    if (metal !== "all") list = list.filter((p) => p.metal === metal);
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
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
  }, [category, metal, sort, priceRange, searchQuery]);

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
            className="range-thumb absolute w-full appearance-none bg-transparent pointer-events-none"
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={500}
            value={priceRange[1]}
            onChange={handleMaxChange}
            className="range-thumb absolute w-full appearance-none bg-transparent pointer-events-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-charcoal/60">No products in this filter yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
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
