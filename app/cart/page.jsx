"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useAdminStore } from "@/store/adminStore";
import Reveal from "@/components/Reveal";
import { toast } from "@/store/toastStore";
import FreeShippingBar from "@/components/FreeShippingBar";
import BundleDiscountBanner from "@/components/BundleDiscountBanner";
import { computeBundleDiscount, bundleDiscountAmount } from "@/lib/bundleDiscount";

export default function CartPage() {
  const { items, removeItem, restoreItem, updateQuantity, subtotal } = useCartStore();
  const settings = useAdminStore((s) => s.settings);
  const gstRate = settings.gstRate;
  const sub = subtotal();
  const bundle = computeBundleDiscount(items, settings);
  const bundleDiscount = bundleDiscountAmount(sub, bundle);
  const discountedSub = sub - bundleDiscount;
  const gst = Math.round(discountedSub * (gstRate / 100));
  const total = discountedSub + gst;

  function handleRemove(item) {
    removeItem(item.productId, item.size);
    toast(`Removed "${item.name}" from cart`, "info", {
      action: { label: "Undo", onClick: () => restoreItem(item) },
    });
  }

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-24 text-center px-6">
        <svg
          width="52"
          height="52"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1B3A2F"
          strokeWidth="1.4"
          className="mx-auto mb-6 opacity-40"
        >
          <path d="M6 6h15l-1.5 9h-12L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
        </svg>
        <p className="text-forest text-xl font-serif mb-2">Your cart is empty.</p>
        <p className="text-charcoal/50 text-sm mb-6">
          Looks like you haven&apos;t added anything yet — let&apos;s find something beautiful.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-forest text-cream px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-6">
      <Reveal>
        <h1 className="font-serif text-4xl text-forest mb-10">Your Cart</h1>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-forest">{item.name}</h3>
                {item.size && <p className="text-xs text-charcoal/50">Size: {item.size}</p>}
                <p className="text-forest font-medium mt-1">₹{item.price.toLocaleString("en-IN")}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-forest/20 rounded-full">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="px-3 py-1 text-forest"
                    >
                      −
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="px-3 py-1 text-forest"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    className="text-xs text-red-500 uppercase tracking-widest"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-cream-soft rounded-xl p-6 h-fit">
          <h2 className="font-serif text-xl text-forest mb-4">Order Summary</h2>
          <FreeShippingBar subtotal={sub} />
          <BundleDiscountBanner items={items} />
          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>₹{sub.toLocaleString("en-IN")}</span>
          </div>
          {bundleDiscount > 0 && (
            <div className="flex justify-between text-sm mb-2 text-gold font-medium">
              <span>Bundle Discount ({bundle.percent}%)</span>
              <span>−₹{bundleDiscount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-4">
            <span>GST ({gstRate}%)</span>
            <span>₹{gst.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between font-medium text-forest text-lg border-t border-forest/10 pt-4 mb-6">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <Link
            href="/checkout"
            className="block text-center bg-forest text-cream py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
