"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useWishlistStore((s) => s.isFavorite(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);

  return (
    <div className="relative group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
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

      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isFavorite}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-300"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={isFavorite ? "#C9A86A" : "none"}
          stroke={isFavorite ? "#C9A86A" : "#1B3A2F"}
          strokeWidth="1.8"
        >
          <path d="M12 20.5s-7.5-4.6-10-9.2C0.3 8 1.8 4.5 5 3.4c2.1-.7 4.3.1 5.5 1.9l1.5 2.1 1.5-2.1c1.2-1.8 3.4-2.6 5.5-1.9 3.2 1.1 4.7 4.6 3 7.9-2.5 4.6-10 9.2-10 9.2z" />
        </svg>
      </button>

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
