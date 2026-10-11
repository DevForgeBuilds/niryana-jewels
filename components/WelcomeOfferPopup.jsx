"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAdminStore } from "@/store/adminStore";
import { api } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shown a few seconds after landing, on EVERY visit (not just the first ever
// time) — the visitor has to enter their email to unlock the code, which
// grows the newsletter list and captures first-time buyers who might
// otherwise bounce without ordering. Fully admin-configurable from
// Admin -> Settings -> Welcome Offer Popup (enable/disable, delay, which
// coupon to advertise). It always mirrors a real, active coupon from the
// Coupons list — no separate discount value is stored here, so it can never
// promise a discount that doesn't actually work at checkout.
export default function WelcomeOfferPopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const coupons = useAdminStore((s) => s.coupons);
  const settings = useAdminStore((s) => s.settings);
  const couponCode = settings.welcomePopupCouponCode || "WELCOME10";
  const delayMs = Math.max(0, Number(settings.welcomePopupDelaySeconds ?? 6)) * 1000;
  const coupon = coupons.find((c) => c.code === couponCode && c.active);
  const isAdminRoute = pathname?.startsWith("/admin");
  const enabled = settings.welcomePopupEnabled !== false;

  useEffect(() => {
    if (typeof window === "undefined" || isAdminRoute || !enabled) return;

    // No "seen before" gate — this is intentionally shown again every time
    // someone lands on the site (fresh page load / new tab), not just once
    // ever per visitor.
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [isAdminRoute, enabled, delayMs]);

  function dismiss() {
    setVisible(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.subscribeNewsletter(trimmed);
    } catch (err) {
      // Even if the save fails server-side, don't block the visitor from
      // getting their code — just log it. Worst case: one missed subscriber.
      console.error("Failed to save welcome-offer email:", err.message);
    } finally {
      setSubmitting(false);
      setUnlocked(true);
    }
  }

  function handleCopy() {
    navigator.clipboard?.writeText(couponCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Don't show at all if disabled in Settings, or the coupon isn't active in
  // the live system — avoids promising a discount that won't actually apply
  // at checkout. Also never show inside the admin panel.
  if (!enabled || !coupon || isAdminRoute) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 bg-black/40 z-[90]"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed z-[100] inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96 bg-cream rounded-2xl shadow-2xl p-6 text-center border border-gold/30"
          >
            <button
              onClick={dismiss}
              aria-label="Close offer"
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-forest/50 hover:text-forest hover:bg-forest/5 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
            <p className="text-gold uppercase tracking-widest text-xs mb-2">Welcome to Niryana Jewels</p>
            <h3 className="font-serif text-2xl text-forest mb-2">Get {coupon.value}% Off</h3>

            {!unlocked ? (
              <>
                <p className="text-charcoal/60 text-sm mb-4">
                  On your first order — enter your email to unlock the code.
                </p>
                <form onSubmit={handleSubmit} className="space-y-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-forest/20 rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:border-gold"
                  />
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-forest text-cream rounded-xl py-3 text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors disabled:opacity-60"
                  >
                    {submitting ? "Please wait…" : "Unlock My Code"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="text-charcoal/60 text-sm mb-4">Use this code at checkout.</p>
                <button
                  onClick={handleCopy}
                  className="w-full border-2 border-dashed border-gold rounded-xl py-3 text-forest font-serif text-lg tracking-widest hover:bg-gold/10 transition-colors"
                >
                  {copied ? "Copied!" : couponCode}
                </button>
                <p className="text-[11px] text-charcoal/40 mt-3">Tap the code to copy it</p>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
