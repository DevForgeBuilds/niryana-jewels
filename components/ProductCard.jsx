"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAdminStore } from "@/store/adminStore";
import { useCartDrawerStore } from "@/store/cartDrawerStore";
import { toast } from "@/store/toastStore";
import { StarRatingDisplay } from "./StarRating";
import useBestsellerIds from "@/hooks/useBestsellerIds";
import QuickViewModal from "./QuickViewModal";

const LOW_STOCK_THRESHOLD = 8;

export default function ProductCard({ product, discountPercent = 0, priority = false }) {
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useWishlistStore((s) => s.isFavorite(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const restoreWishlistItem = useWishlistStore((s) => s.restoreItem);
  const openCartDrawer = useCartDrawerStore((s) => s.open);
  const allReviews = useAdminStore((s) => s.reviews);
  const bestsellerIds = useBestsellerIds();
  const isBestseller = bestsellerIds.has(product.id);
  const [added, setAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const { average, count } = useMemo(() => {
    const approved = allReviews.filter((r) => r.productName === product.name && r.status === "approved");
    if (approved.length === 0) return { average: 0, count: 0 };
    return {
      average: approved.reduce((sum, r) => sum + r.rating, 0) / approved.length,
      count: approved.length,
    };
  }, [allReviews, product.name]);

  function handleAdd() {
    addItem(product, 1);
    setAdded(true);
    openCartDrawer();
    toast(`Added "${product.name}" to cart`, "success", {
      action: { label: "View Cart", onClick: openCartDrawer },
    });
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="relative group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
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

      {(() => {
        const topBadges = [];
        if (isBestseller) {
          topBadges.push(
            <span key="bestseller" className="bg-forest text-cream">
              ★ Bestseller
            </span>
          );
        }
        if (discountPercent > 0) {
          topBadges.push(
            <span key="discount" className="bg-gold text-forest">
              {discountPercent}% OFF
            </span>
          );
        }
        if (typeof product.stock_quantity === "number" && product.stock_quantity > 0 && product.stock_quantity <= LOW_STOCK_THRESHOLD) {
          topBadges.push(
            <span key="lowstock" className="bg-red-600 text-white">
              Only {product.stock_quantity} left
            </span>
          );
        } else if (typeof product.stock_quantity === "number" && product.stock_quantity <= 0) {
          topBadges.push(
            <span key="outofstock" className="bg-charcoal/80 text-white">
              Out of Stock
            </span>
          );
        }
        return (
          <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
            {topBadges.map((badge, i) => (
              <div
                key={badge.key}
                className={`${badge.props.className} text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full`}
              >
                {badge.props.children}
              </div>
            ))}
          </div>
        );
      })()}

      <motion.button
        onClick={(e) => {
          e.preventDefault();
          const wasFavorite = isFavorite;
          toggleWishlist(product);
          toast(
            wasFavorite ? `Removed "${product.name}" from wishlist` : `Added "${product.name}" to wishlist`,
            wasFavorite ? "info" : "success",
            wasFavorite
              ? {
                  action: {
                    label: "Undo",
                    onClick: () =>
                      restoreWishlistItem({
                        productId: product.id,
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        image: product.images[0],
                        metal: product.metal,
                      }),
                  },
                }
              : undefined
          );
        }}
        whileTap={{ scale: 0.8 }}
        aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isFavorite}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
      >
        <motion.svg
          width="18"
          height="18"
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

      <motion.button
        onClick={(e) => {
          e.preventDefault();
          setQuickViewOpen(true);
        }}
        whileTap={{ scale: 0.85 }}
        aria-label={`Quick view ${product.name}`}
        className="absolute top-14 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1B3A2F" strokeWidth="1.8">
          <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </motion.button>

      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}

      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-serif text-lg leading-snug text-forest line-clamp-2 min-h-[2.75rem]">{product.name}</h3>
        </Link>
        <p className="text-xs text-charcoal/50 mt-1">{product.metal}</p>
        {count > 0 && (
          <div className="mt-1.5">
            <StarRatingDisplay value={average} size={12} count={count} />
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-forest font-medium">₹{product.price.toLocaleString("en-IN")}</span>
          {typeof product.stock_quantity === "number" && product.stock_quantity <= 0 ? (
            <Link
              href={`/product/${product.slug}`}
              className="text-xs uppercase tracking-widest px-4 py-2 rounded-full border border-forest/20 text-forest/60 hover:border-gold hover:text-forest transition-colors duration-300"
            >
              Notify Me
            </Link>
          ) : (
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.9 }}
              animate={added ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              className={`relative overflow-hidden text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-colors duration-300 ${
                added ? "bg-gold text-forest" : "bg-forest text-cream hover:bg-gold hover:text-forest"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1"
                  >
                    ✓ Added
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Add
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
