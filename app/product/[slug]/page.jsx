"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getProductBySlug, PRODUCTS } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

const RING_SIZES = ["12", "13", "14", "15", "16", "17", "18"];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(RING_SIZES[2]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useWishlistStore((s) => (product ? s.isFavorite(product.id) : false));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);

  if (!product) {
    return <div className="pt-40 text-center text-forest">Product not found.</div>;
  }

  function handleAddToCart() {
    addItem(product, qty, product.category === "rings" ? size : null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12">
        <Reveal>
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-white">
            <Image
              src={product.images[activeImg]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  activeImg === i ? "border-gold" : "border-transparent"
                }`}
              >
                <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
          {product.video && (
            <video
              src={product.video}
              controls
              muted
              className="mt-4 w-full rounded-2xl"
            />
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-gold uppercase tracking-widest text-xs mb-2">
            {product.category}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-forest mb-3">{product.name}</h1>
          <p className="text-2xl text-forest font-medium mb-6">
            ₹{product.price.toLocaleString("en-IN")}
            <span className="text-sm text-charcoal/50 font-normal"> incl. taxes</span>
          </p>
          <p className="text-charcoal/70 leading-relaxed mb-6">{product.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-8 bg-cream-soft rounded-xl p-4">
            <div>
              <p className="text-charcoal/50">Metal</p>
              <p className="font-medium text-forest">{product.metal}</p>
            </div>
            <div>
              <p className="text-charcoal/50">Stone</p>
              <p className="font-medium text-forest">{product.stone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-charcoal/50">Certification</p>
              <p className="font-medium text-forest">{product.certification}</p>
            </div>
          </div>

          {product.category === "rings" && (
            <div className="mb-6">
              <p className="text-sm text-charcoal/60 mb-2">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {RING_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-10 h-10 rounded-full border text-sm ${
                      size === s
                        ? "bg-forest text-cream border-forest"
                        : "border-forest/30 text-forest"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center border border-forest/20 rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2 text-forest">−</button>
              <span className="px-4">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2 text-forest">+</button>
            </div>
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.96 }}
              animate={added ? { scale: [1, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              className={`relative overflow-hidden flex-1 py-3 rounded-full text-sm uppercase tracking-widest transition-colors duration-300 ${
                added ? "bg-gold text-forest" : "bg-forest text-cream hover:bg-gold hover:text-forest"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block"
                  >
                    ✓ Added to Cart
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block"
                  >
                    Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button
              onClick={() => toggleWishlist(product)}
              whileTap={{ scale: 0.85 }}
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={isFavorite}
              className="w-12 h-12 flex-shrink-0 rounded-full border border-forest/20 flex items-center justify-center hover:border-gold transition-colors duration-300"
            >
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isFavorite ? "#C9A86A" : "none"}
                stroke={isFavorite ? "#C9A86A" : "#1B3A2F"}
                strokeWidth="1.8"
                animate={isFavorite ? { scale: [1, 1.4, 0.9, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <path d="M12 20.5s-7.5-4.6-10-9.2C0.3 8 1.8 4.5 5 3.4c2.1-.7 4.3.1 5.5 1.9l1.5 2.1 1.5-2.1c1.2-1.8 3.4-2.6 5.5-1.9 3.2 1.1 4.7 4.6 3 7.9-2.5 4.6-10 9.2-10 9.2z" />
              </motion.svg>
            </motion.button>
          </div>
          <p className="text-xs text-charcoal/50 mb-6">
            {isFavorite ? "Saved to your wishlist" : "Tap the heart to save this piece for later"}
          </p>
        </Reveal>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <Reveal className="text-center mb-10">
            <h2 className="font-serif text-3xl text-forest">You May Also Like</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
