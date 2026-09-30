"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { getProductBySlug } from "@/data/products";
import Reveal from "@/components/Reveal";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-24 text-center px-6">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1B3A2F"
          strokeWidth="1.4"
          className="mx-auto mb-6 opacity-40"
        >
          <path d="M12 20.5s-7.5-4.6-10-9.2C0.3 8 1.8 4.5 5 3.4c2.1-.7 4.3.1 5.5 1.9l1.5 2.1 1.5-2.1c1.2-1.8 3.4-2.6 5.5-1.9 3.2 1.1 4.7 4.6 3 7.9-2.5 4.6-10 9.2-10 9.2z" />
        </svg>
        <p className="text-forest text-xl font-serif mb-4">Your wishlist is empty.</p>
        <p className="text-charcoal/50 text-sm mb-6">
          Tap the heart on any piece to save it here for later.
        </p>
        <Link href="/shop" className="text-gold underline">
          Explore the Collection
        </Link>
      </div>
    );
  }

  function handleAddToCart(item) {
    const fullProduct = getProductBySlug(item.slug);
    if (fullProduct) addToCart(fullProduct, 1, null);
  }

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-6">
      <Reveal>
        <h1 className="font-serif text-4xl text-forest mb-2">Your Wishlist</h1>
        <p className="text-charcoal/50 text-sm mb-10">
          {items.length} {items.length === 1 ? "piece" : "pieces"} saved for later
        </p>
      </Reveal>

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm">
            <Link href={`/product/${item.slug}`} className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
            </Link>
            <div className="flex-1 flex flex-col">
              <Link href={`/product/${item.slug}`}>
                <h3 className="font-serif text-forest">{item.name}</h3>
              </Link>
              {item.metal && <p className="text-xs text-charcoal/50">{item.metal}</p>}
              <p className="text-forest font-medium mt-1">₹{item.price.toLocaleString("en-IN")}</p>
              <div className="flex items-center gap-4 mt-auto pt-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="text-xs uppercase tracking-widest bg-forest text-cream px-4 py-2 rounded-full hover:bg-gold hover:text-forest transition-colors duration-300"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-xs text-red-500 uppercase tracking-widest"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
