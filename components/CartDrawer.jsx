"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useCartDrawerStore } from "@/store/cartDrawerStore";
import { toast } from "@/store/toastStore";

export default function CartDrawer() {
  const { items, removeItem, restoreItem, subtotal } = useCartStore();
  const { isOpen, close } = useCartDrawerStore();
  const sub = subtotal();

  function handleRemove(item) {
    removeItem(item.productId, item.size);
    toast(`Removed "${item.name}" from cart`, "info", {
      action: { label: "Undo", onClick: () => restoreItem(item) },
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/40 z-[60]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-cream z-[70] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-forest/10">
              <h2 className="font-serif text-xl text-forest">
                Your Cart {items.length > 0 && <span className="text-sm text-charcoal/40">({items.length})</span>}
              </h2>
              <button
                onClick={close}
                aria-label="Close cart"
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-forest/5 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B3A2F" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <p className="text-forest font-serif text-lg mb-2">Your cart is empty.</p>
                <p className="text-charcoal/50 text-sm mb-6">Explore the collection to find your next favourite piece.</p>
                <Link
                  href="/shop"
                  onClick={close}
                  className="bg-forest text-cream px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
                >
                  Explore Shop
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.size}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 bg-white rounded-xl p-3 shadow-sm"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-forest truncate">{item.name}</p>
                        {item.size && <p className="text-xs text-charcoal/40">Size: {item.size}</p>}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-charcoal/50">Qty {item.quantity}</span>
                          <span className="text-sm font-medium text-forest">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item)}
                        aria-label="Remove item"
                        className="text-charcoal/30 hover:text-red-500 transition-colors self-start"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="px-6 py-5 border-t border-forest/10 bg-white">
                  <div className="flex justify-between text-forest font-medium mb-4">
                    <span>Subtotal</span>
                    <span>₹{sub.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/cart"
                      onClick={close}
                      className="text-center border border-forest/20 text-forest py-3 rounded-full text-xs uppercase tracking-widest hover:border-forest transition-colors duration-300"
                    >
                      View Cart
                    </Link>
                    <Link
                      href="/checkout"
                      onClick={close}
                      className="text-center bg-forest text-cream py-3 rounded-full text-xs uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
