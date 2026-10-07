"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getProductBySlug, PRODUCTS } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartDrawerStore } from "@/store/cartDrawerStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useAdminStore } from "@/store/adminStore";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import RecentlyViewed from "@/components/RecentlyViewed";
import { StarRatingDisplay } from "@/components/StarRating";
import SizeGuideModal from "@/components/SizeGuideModal";
import Reveal from "@/components/Reveal";
import { toast } from "@/store/toastStore";

const RING_SIZES = ["12", "13", "14", "15", "16", "17", "18"];
const LOW_STOCK_THRESHOLD = 8;

export default function ProductDetailClient() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(RING_SIZES[2]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useWishlistStore((s) => (product ? s.isFavorite(product.id) : false));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const openCartDrawer = useCartDrawerStore((s) => s.open);
  const addView = useRecentlyViewedStore((s) => s.addView);
  const allReviews = useAdminStore((s) => s.reviews);

  useEffect(() => {
    if (product) addView(product.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const { average, count } = useMemo(() => {
    if (!product) return { average: 0, count: 0 };
    const approved = allReviews.filter((r) => r.productName === product.name && r.status === "approved");
    if (approved.length === 0) return { average: 0, count: 0 };
    return {
      average: approved.reduce((sum, r) => sum + r.rating, 0) / approved.length,
      count: approved.length,
    };
  }, [allReviews, product]);

  if (!product) {
    return <div className="pt-40 text-center text-forest">Product not found.</div>;
  }

  function handleAddToCart() {
    addItem(product, qty, product.category === "rings" ? size : null);
    setAdded(true);
    openCartDrawer();
    toast(`Added "${product.name}" to cart`, "success", {
      action: { label: "View Cart", onClick: () => openCartDrawer() },
    });
    setTimeout(() => setAdded(false), 1400);
  }

  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const media = [
    ...product.images.map((src) => ({ type: "image", src })),
    ...(product.video ? [{ type: "video", src: product.video }] : []),
  ];

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Reveal>
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-white select-none">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={activeImg}
                className="absolute inset-0"
                initial={{ opacity: 0.4, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                drag={media.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={(e, info) => {
                  const threshold = 60;
                  if (info.offset.x < -threshold && activeImg < media.length - 1) {
                    setActiveImg((i) => i + 1);
                  } else if (info.offset.x > threshold && activeImg > 0) {
                    setActiveImg((i) => i - 1);
                  }
                }}
              >
                {media[activeImg].type === "video" ? (
                  <video
                    src={media[activeImg].src}
                    controls
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover pointer-events-auto"
                  />
                ) : (
                  <Image
                    src={media[activeImg].src}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover pointer-events-none"
                    priority
                    draggable={false}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {media.length > 1 && (
              <span className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full z-10">
                {activeImg + 1}/{media.length}
              </span>
            )}

            {media.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                  disabled={activeImg === 0}
                  aria-label="Previous media"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-0 transition-opacity z-10"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A2F" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveImg((i) => Math.min(media.length - 1, i + 1))}
                  disabled={activeImg === media.length - 1}
                  aria-label="Next media"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-0 transition-opacity z-10"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A2F" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {media.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {media.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Go to ${m.type} ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeImg ? "w-6 bg-forest" : "w-1.5 bg-forest/20"
                  }`}
                />
              ))}
            </div>
          )}

        </Reveal>


        <Reveal delay={0.1}>
          <p className="text-gold uppercase tracking-widest text-xs mb-2">
            {product.category}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-forest mb-3">{product.name}</h1>
          {count > 0 && (
            <div className="mb-3">
              <StarRatingDisplay value={average} size={16} showValue count={count} />
            </div>
          )}
          <p className="text-2xl text-forest font-medium mb-3">
            ₹{product.price.toLocaleString("en-IN")}
            <span className="text-sm text-charcoal/50 font-normal"> incl. taxes</span>
          </p>
          {typeof product.stock_quantity === "number" && product.stock_quantity > 0 && product.stock_quantity <= LOW_STOCK_THRESHOLD && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Only {product.stock_quantity} left in stock — order soon
            </p>
          )}
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-charcoal/60">Select Size</p>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-gold underline underline-offset-2 hover:text-forest transition-colors"
                >
                  Size Guide
                </button>
              </div>
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

      <ProductReviews product={product} />

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

      <RecentlyViewed excludeId={product.id} />

      <SizeGuideModal open={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}
