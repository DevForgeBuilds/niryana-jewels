"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import ProductLightbox from "@/components/ProductLightbox";
import ShareButtons from "@/components/ShareButtons";
import Reveal from "@/components/Reveal";
import { toast } from "@/store/toastStore";
import { api } from "@/lib/api";

const LOW_STOCK_THRESHOLD = 8;

export default function ProductDetailClient() {
  const { slug } = useParams();
  const PRODUCTS = useAdminStore((s) => s.products);
  const productsLoading = useAdminStore((s) => s.loading);
  const product = PRODUCTS.find((p) => p.slug === slug);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyStatus, setNotifyStatus] = useState("idle"); // idle | sending | sent | error
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

  const hasVariants = Boolean(product?.variants && product.variants.length > 0);

  // Default to the first in-stock size/length when the product (re)loads; if every
  // size is sold out, fall back to the first one so its "Notify Me" form can show.
  useEffect(() => {
    if (!hasVariants) {
      setSize(null);
      return;
    }
    const inStock = product.variants.find((v) => v.stock_quantity > 0);
    setSize((inStock || product.variants[0]).label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, hasVariants]);

  const selectedVariant = hasVariants ? product.variants.find((v) => v.label === size) : null;
  // Effective stock used for the add-to-cart vs notify-me decision below.
  const effectiveStock = hasVariants ? selectedVariant?.stock_quantity ?? 0 : product?.stock_quantity;

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
    return (
      <div className="pt-40 text-center text-forest">
        {productsLoading ? "Loading…" : "Product not found."}
      </div>
    );
  }

  function handleAddToCart() {
    addItem(product, qty, hasVariants ? size : null);
    setAdded(true);
    openCartDrawer();
    toast(`Added "${product.name}" to cart`, "success", {
      action: { label: "View Cart", onClick: () => openCartDrawer() },
    });
    setTimeout(() => setAdded(false), 1400);
  }

  async function handleNotifyMe(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail.trim())) {
      setNotifyStatus("error");
      return;
    }
    setNotifyStatus("sending");
    try {
      await api.notifyStock(product.id, notifyEmail.trim(), hasVariants ? size : undefined);
      setNotifyStatus("sent");
      toast("We'll email you when it's back in stock", "success");
    } catch {
      setNotifyStatus("error");
    }
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
                    className="object-cover cursor-zoom-in pointer-events-auto"
                    priority
                    draggable={false}
                    onClick={() => setLightboxOpen(true)}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {media.length > 1 && (
              <span className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full z-10">
                {activeImg + 1}/{media.length}
              </span>
            )}

            <button
              onClick={() => setLightboxOpen(true)}
              aria-label={media[activeImg].type === "video" ? "View video full-screen" : "Zoom image"}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center z-10 hover:bg-black/70 transition-colors"
            >
              {media[activeImg].type === "video" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                  <path d="M8 5v14l11-7-11-7z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  <path d="M11 8v6M8 11h6" strokeLinecap="round" />
                </svg>
              )}
            </button>

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
          {typeof effectiveStock === "number" && effectiveStock > 0 && effectiveStock <= LOW_STOCK_THRESHOLD && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Only {effectiveStock} left{hasVariants ? ` in size ${size}` : " in stock"} — order soon
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

          {hasVariants && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-charcoal/60">
                  Select {product.category === "rings" ? "Size" : "Size / Length"}
                </p>
                {(product.category === "rings" || product.category === "bracelets") && (
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-gold underline underline-offset-2 hover:text-forest transition-colors"
                  >
                    Size Guide
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const outOfStock = v.stock_quantity <= 0;
                  return (
                    <button
                      key={v.label}
                      onClick={() => {
                        setSize(v.label);
                        if (notifyStatus !== "idle") setNotifyStatus("idle");
                      }}
                      title={outOfStock ? `${v.label} — out of stock` : v.label}
                      className={`min-w-10 h-10 px-3 rounded-full border text-sm transition-colors ${
                        size === v.label
                          ? "bg-forest text-cream border-forest"
                          : outOfStock
                          ? "border-forest/15 text-charcoal/30 line-through"
                          : "border-forest/30 text-forest"
                      }`}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
              {selectedVariant && selectedVariant.stock_quantity <= 0 && (
                <p className="text-xs text-red-500 mt-2">This size is currently out of stock.</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 mb-2">
            {typeof effectiveStock === "number" && effectiveStock <= 0 ? (
              <form onSubmit={handleNotifyMe} className="flex-1 flex flex-col sm:flex-row gap-2">
                {notifyStatus === "sent" ? (
                  <p className="flex-1 flex items-center gap-2 text-sm text-forest bg-cream-soft rounded-full px-5 py-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A2F" strokeWidth="2">
                      <path d="M20 7l-9 9-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    We&apos;ll email you when it&apos;s back in stock
                  </p>
                ) : (
                  <>
                    <input
                      type="email"
                      required
                      value={notifyEmail}
                      onChange={(e) => {
                        setNotifyEmail(e.target.value);
                        if (notifyStatus === "error") setNotifyStatus("idle");
                      }}
                      placeholder="Your email address"
                      aria-label="Email address for back-in-stock notification"
                      className={`flex-1 min-w-0 border rounded-full px-5 py-3 text-sm text-forest placeholder:text-charcoal/30 focus:outline-none focus:ring-2 transition-shadow duration-200 ${
                        notifyStatus === "error"
                          ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                          : "border-forest/20 focus:ring-gold/50 focus:border-gold"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={notifyStatus === "sending"}
                      className="py-3 px-6 rounded-full text-sm uppercase tracking-widest bg-forest text-cream hover:bg-gold hover:text-forest transition-colors duration-300 disabled:opacity-60"
                    >
                      {notifyStatus === "sending" ? "Saving…" : "Notify Me"}
                    </button>
                  </>
                )}
              </form>
            ) : (
              <>
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
              </>
            )}
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
          <p className="text-xs text-charcoal/50 mb-4">
            {isFavorite ? "Saved to your wishlist" : "Tap the heart to save this piece for later"}
          </p>
          <ShareButtons
            title={product.name}
            url={typeof window !== "undefined" ? window.location.href : `https://niryana-jewels-iota.vercel.app/product/${product.slug}`}
          />
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

      <SizeGuideModal open={showSizeGuide} onClose={() => setShowSizeGuide(false)} category={product.category} />
      <ProductLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        media={media}
        initialIndex={activeImg}
        productName={product.name}
      />
    </div>
  );
}
