"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLastOrderStore } from "@/store/lastOrderStore";
import Reveal from "@/components/Reveal";

export default function OrderConfirmationPage() {
  const order = useLastOrderStore((s) => s.order);

  if (!order) {
    return (
      <div className="pt-40 pb-24 text-center px-6">
        <p className="text-forest font-serif text-2xl mb-3">No recent order found</p>
        <p className="text-charcoal/60 mb-6">Looks like you haven't placed an order this session.</p>
        <Link
          href="/shop"
          className="inline-block bg-forest text-cream px-6 py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
        >
          Explore the Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-6">
      <Reveal className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-forest text-cream flex items-center justify-center mx-auto mb-6"
        >
          <motion.svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            />
          </motion.svg>
        </motion.div>
        <p className="text-gold uppercase tracking-widest text-xs mb-2">Thank you</p>
        <h1 className="font-serif text-4xl text-forest mb-3">Order Confirmed!</h1>
        <p className="text-charcoal/60">
          Your order <span className="text-forest font-medium">#{order.orderNumber}</span> has been placed successfully.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="bg-cream-soft rounded-2xl p-6 md:p-8 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-charcoal/50 mb-1">Payment Method</p>
          <p className="text-forest font-medium">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online via Razorpay"}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-charcoal/50 mb-1">Delivery Address</p>
          <p className="text-forest font-medium">{order.form.name} · {order.form.phone}</p>
          <p className="text-charcoal/70 text-sm mt-0.5">
            {order.form.address}, {order.form.city} – {order.form.pincode}
          </p>
        </div>
        {order.giftWrap && (
          <div className="sm:col-span-2 flex items-center gap-2 text-sm text-forest bg-white rounded-xl px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A86A" strokeWidth="1.8">
              <rect x="3" y="8" width="18" height="13" rx="1.5" />
              <path d="M3 12h18M12 8v13" strokeLinecap="round" />
            </svg>
            <span>
              Gift wrapped{order.giftNote ? ` — "${order.giftNote}"` : ""}
            </span>
          </div>
        )}
      </Reveal>

      <Reveal delay={0.15} className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <h2 className="font-serif text-xl text-forest mb-5">Order Summary</h2>
        <div className="space-y-4 mb-5">
          {order.items.map((i) => (
            <div key={`${i.productId}-${i.size}`} className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-cream-soft">
                <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-forest truncate">{i.name}</p>
                <p className="text-xs text-charcoal/40">
                  Qty {i.quantity}{i.size ? ` · Size ${i.size}` : ""}
                </p>
              </div>
              <span className="text-sm text-forest font-medium whitespace-nowrap">
                ₹{(i.price * i.quantity).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm border-t border-forest/10 pt-4">
          <div className="flex justify-between text-charcoal/70">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-gold font-medium">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>−₹{order.discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between text-charcoal/70">
            <span>GST</span>
            <span>₹{order.gst.toLocaleString("en-IN")}</span>
          </div>
          {order.codFee > 0 && (
            <div className="flex justify-between text-charcoal/70">
              <span>COD Fee</span>
              <span>₹{order.codFee.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between font-medium text-forest text-lg border-t border-forest/10 pt-4 mt-2">
          <span>Total Paid</span>
          <span>₹{order.total.toLocaleString("en-IN")}</span>
        </div>
      </Reveal>

      <Reveal delay={0.2} className="text-center flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/shop"
          className="bg-forest text-cream px-6 py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
        >
          Continue Shopping
        </Link>
        <Link
          href="/faq"
          className="border border-forest/20 text-forest px-6 py-3 rounded-full text-sm uppercase tracking-widest hover:border-forest transition-colors duration-300"
        >
          Shipping &amp; Returns FAQ
        </Link>
      </Reveal>
    </div>
  );
}
