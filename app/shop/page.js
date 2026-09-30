"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

function ShopContent() {
  const params = useSearchParams();
  const initialCategory = params.get("category") || "all";
  const [category, setCategory] = useState(initialCategory);
  const [metal, setMetal] = useState("all");
  const [sort, setSort] = useState("featured");

  const metals = useMemo(
    () => ["all", ...new Set(PRODUCTS.map((p) => p.metal))],
    []
  );

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(
      (p) => category === "all" || p.category === category
    );
    if (metal !== "all") list = list.filter((p) => p.metal === metal);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, metal, sort]);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-6">
      <Reveal className="text-center mb-14">
        <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Shop</p>
        <h1 className="font-serif text-4xl md:text-5xl text-forest">The Collection</h1>
      </Reveal>

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

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="pt-40 text-center text-forest">Loading…</div>}>
      <ShopContent />
    </Suspense>
  );
}
