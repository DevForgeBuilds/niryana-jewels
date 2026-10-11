"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartDrawerStore } from "@/store/cartDrawerStore";
import { useAdminStore } from "@/store/adminStore";
import { StarRatingDisplay } from "./StarRating";
import { toast } from "@/store/toastStore";

// Lightweight "Quick View" dialog triggered from a ProductCard — lets a
// shopper preview details and add to cart without leaving the shop grid.
// Mirrors the core add-to-cart logic from ProductDetailClient (size
// selection, quantity, stock awareness) in a compact modal.
export default function QuickViewModal({ product, onClose }) {
  const [mounted, setMounted] = useState(false);
  const closeBtnRef = useRef(null);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useWishlistStore((s) => (product ? s.isFavorite(product.id) : false));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const openCartDrawer = useCartDrawerStore((s) => s.open);
  const allReviews = useAdminStore((s) => s.reviews);

  useEffect(() => setMounted(true), []);

  const hasVariants = Boolean(product?.variants && product.variants.length > 0);

  useEffect(() => {
    if (!product) return;
    setActiveImg(0);
    setQty(1);
    setAdded(false);
    if (hasVariants) {
      const inStock = product.variants.find((v) => v.stock_quantity > 0);
      setSize((inStock || product.variants[0]).label);
    } else {
      setSize(null);
    }
  }, [product, hasVariants]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const selectedVariant = hasVariants ? product?.variants.find((v) => v.label === size) : null;
  const effectiveStock = hasVariants ? selectedVariant?.stock_quantity ?? 0 : product?.stock_quantity;
  const outOfStock = typeof effectiveStock === "number" && effectiveStock <= 0;

  const { average, count } = useMemo(() => {
    if (!product) return { average: 0, count: 0 };
    const approved = allReviews.filter((r) => r.productName === product.name && r.status === "approved");
    if (approved.length === 0) return { average: 0, count: 0 };
    return {
      average: approved.reduce((sum, r) => sum + r.rating, 0) / approved.length,
      count: approved.length,
    };
  }, [allReviews, product]);

  if (!mounted || !product) return null;

  function handleAddToCart() {
    addItem(product, qty, hasVariants ? size : null);
    setAdded(true);
    openCartDrawer();
    toast(`Added "${product.name}" to cart`, "success", {
      action: { label: "View Cart", onClick: openCartDrawer },
    });
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-charcoal/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
        onClick={onClose}
        role="presentation"
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view: ${product.name}`}
          className="relative bg-cream w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-0 shadow-2xl"
        >
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close quick view"
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B3A2F" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          {/* Image */}
          <div className="relative aspect-square md:aspect-auto bg-white">
            <Image
              src={product.images[activeImg] || product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
                {product.images.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Show image ${i + 1} of ${product.images.length}`}
                    aria-current={i === activeImg}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === activeImg ? "bg-forest w-4" : "bg-forest/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            <h2 className="font-serif text-2xl text-forest pr-8">{product.name}</h2>
            <p className="text-xs text-charcoal/50 mt-1 uppercase tracking-wide">{product.metal}</p>
            {count > 0 && (
              <div className="mt-2">
                <StarRatingDisplay value={average} size={13} showValue count={count} />
              </div>
            )}
            <p className="text-forest text-xl font-medium mt-4">₹{product.price.toLocaleString("en-IN")}</p>

            {product.description && (
              <p className="text-sm text-charcoal/60 mt-3 leading-relaxed line-clamp-3">{product.description}</p>
            )}

            {hasVariants && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.label}
                      onClick={() => setSize(v.label)}
                      disabled={v.stock_quantity <= 0}
                      aria-pressed={size === v.label}
                      className={`text-xs px-3.5 py-2 rounded-full border transition-colors duration-200 ${
                        size === v.label
                          ? "bg-forest text-cream border-forest"
                          : v.stock_quantity <= 0
                          ? "border-forest/10 text-forest/30 line-through cursor-not-allowed"
                          : "border-forest/20 text-forest hover:border-gold"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center border border-forest/20 rounded-full">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 flex items-center justify-center text-forest"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm" aria-live="polite">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-9 h-9 flex items-center justify-center text-forest"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product)}
                aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={isFavorite}
                className="w-9 h-9 rounded-full border border-forest/20 flex items-center justify-center shrink-0"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? "#C9A86A" : "none"}
                  stroke={isFavorite ? "#C9A86A" : "#1B3A2F"}
                  strokeWidth="1.8"
                >
                  <path d="M12 20.5s-7.5-4.6-10-9.2C0.3 8 1.8 4.5 5 3.4c2.1-.7 4.3.1 5.5 1.9l1.5 2.1 1.5-2.1c1.2-1.8 3.4-2.6 5.5-1.9 3.2 1.1 4.7 4.6 3 7.9-2.5 4.6-10 9.2-10 9.2z" />
                </svg>
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {outOfStock ? (
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-center text-xs uppercase tracking-widest px-6 py-3.5 rounded-full border border-forest/30 text-forest hover:border-gold transition-colors duration-300"
                >
                  Out of Stock — Notify Me
                </Link>
              ) : (
                <motion.button
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.97 }}
                  className={`text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-colors duration-300 ${
                    added ? "bg-gold text-forest" : "bg-forest text-cream hover:bg-gold hover:text-forest"
                  }`}
                >
                  {added ? "✓ Added to Cart" : "Add to Cart"}
                </motion.button>
              )}
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="text-center text-xs uppercase tracking-widest text-forest/70 hover:text-forest underline underline-offset-4"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
