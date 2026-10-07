"use client";

import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { PRODUCTS } from "@/data/products";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

export default function RecentlyViewed({ excludeId }) {
  const ids = useRecentlyViewedStore((s) => s.ids);

  const products = ids
    .filter((id) => id !== excludeId)
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  if (products.length === 0) return null;

  return (
    <div className="mt-24">
      <Reveal className="text-center mb-10">
        <h2 className="font-serif text-3xl text-forest">Recently Viewed</h2>
      </Reveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
