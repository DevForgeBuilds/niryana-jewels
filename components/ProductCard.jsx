"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-apple group-hover:scale-105"
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}
      </Link>
      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-serif text-lg text-forest truncate">{product.name}</h3>
        </Link>
        <p className="text-xs text-charcoal/50 mt-1">{product.metal}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-forest font-medium">₹{product.price.toLocaleString("en-IN")}</span>
          <button
            onClick={() => addItem(product, 1)}
            className="text-xs uppercase tracking-widest bg-forest text-cream px-4 py-2 rounded-full hover:bg-gold hover:text-forest transition-colors duration-300"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
