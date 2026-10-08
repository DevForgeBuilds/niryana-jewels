"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAdminStore } from "@/store/adminStore";
import { useLastOrderStore } from "@/store/lastOrderStore";
import { loadRazorpayScript } from "@/lib/razorpay";
import Reveal from "@/components/Reveal";
import { toast } from "@/store/toastStore";
import { api } from "@/lib/api";

const CASH_ON_DELIVERY_FEE = 49; // small COD handling fee, set to 0 if not desired

// Standalone backend (Express, deployed on Render) that owns the Razorpay
// create-order/verify logic. Set NEXT_PUBLIC_API_URL in Vercel's project
// settings to the Render service URL, e.g. https://niryana-backend.onrender.com
// Falls back to same-origin ("") for local dev if you haven't set it yet.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const FIELDS = [
  { name: "name", label: "Full Name", type: "text", span: 1, autoComplete: "name" },
  { name: "phone", label: "Phone Number", type: "tel", span: 1, autoComplete: "tel", inputMode: "numeric", maxLength: 10 },
  { name: "email", label: "Email Address", type: "email", span: 2, autoComplete: "email" },
  { name: "address", label: "Delivery Address", type: "text", span: 2, autoComplete: "street-address" },
  { name: "city", label: "City", type: "text", span: 1, autoComplete: "address-level2" },
  { name: "pincode", label: "Pincode", type: "text", span: 1, autoComplete: "postal-code", inputMode: "numeric", maxLength: 6 },
];

function validateForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Please enter your full name.";
  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errors.phone = "Enter a valid 10-digit mobile number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (!form.address.trim()) errors.address = "Please enter your delivery address.";
  if (!form.city.trim()) errors.city = "Please enter your city.";
  if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = "Enter a valid 6-digit pincode.";
  return errors;
}

const PAYMENT_BADGES = [
  {
    label: "VISA",
    node: <span className="italic font-black text-[11px] text-blue-800 tracking-tight">VISA</span>,
  },
  {
    label: "Mastercard",
    node: (
      <span className="relative w-6 h-3.5 flex items-center">
        <span className="absolute left-0 w-3.5 h-3.5 rounded-full bg-red-500/90" />
        <span className="absolute left-2 w-3.5 h-3.5 rounded-full bg-amber-400/90 mix-blend-multiply" />
      </span>
    ),
  },
  { label: "RuPay", node: <span className="font-bold text-[11px] text-indigo-700">RuPay</span> },
  { label: "UPI", node: <span className="font-bold text-[11px] text-forest">UPI</span> },
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const settings = useAdminStore((s) => s.settings);
  const findValidCoupon = useAdminStore((s) => s.findValidCoupon);
  const incrementCouponUsage = useAdminStore((s) => s.incrementCouponUsage);
  const addOrder = useAdminStore((s) => s.addOrder);
  const setLastOrder = useLastOrderStore((s) => s.setOrder);
  const gstRate = settings.gstRate;
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", pincode: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // 'razorpay' | 'cod'
  const [placing, setPlacing] = useState(false);
  const [payError, setPayError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  const sub = subtotal();
  const discount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.round(sub * (appliedCoupon.value / 100))
      : Math.min(appliedCoupon.value, sub)
    : 0;
  const discountedSub = sub - discount;
  const gst = Math.round(discountedSub * (gstRate / 100));
  const codFee = paymentMethod === "cod" ? CASH_ON_DELIVERY_FEE : 0;
  const total = discountedSub + gst + codFee;

  function handleChange(e) {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    if (touched[name]) {
      setErrors(validateForm(newForm));
    }
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validateForm(form));
  }

  async function handleApplyCoupon() {
    setCouponError("");
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      // Always re-checks against the live MySQL `coupons` table (not just the
      // locally cached list) so a coupon the admin just deactivated/expired
      // can't still be applied from a stale page.
      const coupon = await api.validateCoupon(couponInput.trim());
      setAppliedCoupon(coupon);
      toast(`Coupon "${coupon.code}" applied!`, "success");
    } catch {
      // Fall back to the local cache (e.g. if the backend is briefly unreachable)
      // so the page still degrades gracefully instead of hard-failing.
      const cached = findValidCoupon(couponInput);
      if (cached) {
        setAppliedCoupon(cached);
        toast(`Coupon "${cached.code}" applied!`, "success");
      } else {
        setCouponError("Invalid or expired coupon code.");
        setAppliedCoupon(null);
        toast("Invalid or expired coupon code.", "error");
      }
    } finally {
      setApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
    toast("Coupon removed", "info");
  }

  async function handleRazorpayPayment() {
    setPayError("");

    // 1. Load the Razorpay Checkout script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setPayError("Could not load Razorpay checkout. Check your internet connection and try again.");
      return;
    }

    // 2. Ask our server to create a Razorpay Order (test mode uses rzp_test_ keys)
    let order;
    try {
      const res = await fetch(`${API_URL}/api/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, receipt: `NJ-${Date.now()}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create order");
      order = data;
    } catch (err) {
      setPayError(err.message);
      return;
    }

    // 3. Open Razorpay Checkout modal
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Niryana Jewels",
      description: "Fine Jewellery with Heart & Heritage",
      image: "/logo/niryana-logo.png",
      order_id: order.id,
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: "#1B3A2F" },
      handler: async function (response) {
        // 4. Verify the payment signature server-side
        try {
          const verifyRes = await fetch(`${API_URL}/api/razorpay/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.verified) {
            if (appliedCoupon) incrementCouponUsage(appliedCoupon.id);
            await completeOrder();
          } else {
            setPayError("Payment verification failed. Please contact support before retrying.");
          }
        } catch {
          setPayError("Could not verify payment. Please contact support.");
        }
      },
      modal: {
        ondismiss: function () {
          setPlacing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      setPayError(`Payment failed: ${response.error.description}`);
    });
    rzp.open();
  }

  async function completeOrder() {
    const orderNumber = `NJ${Date.now().toString().slice(-8)}`;

    // Write the order straight into MySQL (via the Admin store's addOrder, which
    // calls the backend API) so it shows up under Admin → Orders immediately —
    // on any device/browser, no manual sync needed.
    try {
      await addOrder({
        orderNumber,
        customerName: form.name,
        phone: form.phone,
        email: form.email,
        address: `${form.address}, ${form.city} - ${form.pincode}`,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          size: i.size || null,
        })),
        subtotal: sub,
        discount,
        couponCode: appliedCoupon?.code || null,
        gst,
        codFee,
        total,
        paymentMethod,
        giftWrap,
        giftNote,
      });
    } catch (err) {
      console.error("Failed to save order to the backend:", err);
      setPayError("Order placed, but we couldn't reach the server to save it. Please contact support with your details.");
    }

    setLastOrder({
      orderNumber,
      items: items.map((i) => ({ ...i })),
      form: { ...form },
      paymentMethod,
      giftWrap,
      giftNote,
      subtotal: sub,
      discount,
      couponCode: appliedCoupon?.code || null,
      gst,
      codFee,
      total,
      placedAt: new Date().toISOString(),
    });

    clearCart();
    router.push("/order-confirmation");
  }

  async function handleCodOrder() {
    // ---------------------------------------------------------------
    // Cash on Delivery flow:
    // 1. POST /api/orders -> create order row in MySQL
    //    (status: 'pending', payment_method: 'cod', payment_id: NULL)
    // 2. No online payment — amount collected by courier on delivery.
    // 3. Send order confirmation email/WhatsApp with COD amount due.
    // ---------------------------------------------------------------
    if (appliedCoupon) incrementCouponUsage(appliedCoupon.id);
    await completeOrder();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const allErrors = validateForm(form);
    setErrors(allErrors);
    setTouched({ name: true, phone: true, email: true, address: true, city: true, pincode: true });
    if (Object.keys(allErrors).length > 0) {
      document.getElementById(Object.keys(allErrors)[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!agreedToTerms) {
      setTermsError(true);
      document.getElementById("agree-terms")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setPlacing(true);
    if (paymentMethod === "cod") {
      await handleCodOrder();
    } else {
      await handleRazorpayPayment();
    }
    setPlacing(false);
  }

  if (items.length === 0) {
    return <div className="pt-40 text-center text-forest">Your cart is empty.</div>;
  }

  return (
    <div className="pt-28 pb-28 md:pb-24 max-w-6xl mx-auto px-6">
      <Reveal>
        <p className="text-gold uppercase tracking-widest text-xs mb-2">Secure Checkout</p>
        <h1 className="font-serif text-4xl text-forest mb-10">Checkout</h1>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
        <form id="checkout-form" onSubmit={handleSubmit} className="md:col-span-3 space-y-8">
          {/* Shipping Details */}
          <Reveal className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-forest text-cream text-sm font-medium flex items-center justify-center flex-shrink-0">
                1
              </span>
              <h2 className="font-serif text-xl text-forest">Shipping Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.map((field) => {
                const showError = touched[field.name] && errors[field.name];
                return (
                  <div key={field.name} className={field.span === 2 ? "sm:col-span-2" : ""}>
                    <label htmlFor={field.name} className="block text-xs uppercase tracking-wide text-charcoal/50 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      required
                      inputMode={field.inputMode}
                      maxLength={field.maxLength}
                      autoComplete={field.autoComplete}
                      value={form[field.name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={field.label}
                      aria-invalid={!!showError}
                      className={`w-full border rounded-xl px-4 py-3 text-forest placeholder:text-charcoal/30 focus:outline-none focus:ring-2 transition-shadow duration-200 ${
                        showError
                          ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                          : "border-forest/15 focus:ring-gold/50 focus:border-gold"
                      }`}
                    />
                    <AnimatePresence>
                      {showError && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-500 text-xs mt-1.5 overflow-hidden"
                        >
                          {errors[field.name]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Gift Options */}
          <Reveal delay={0.03} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-forest text-cream text-sm font-medium flex items-center justify-center flex-shrink-0">
                2
              </span>
              <h2 className="font-serif text-xl text-forest">Gift Options</h2>
            </div>

            <label
              className={`flex items-start gap-4 border-2 rounded-xl px-4 py-4 cursor-pointer transition-all duration-200 ${
                giftWrap ? "border-gold bg-cream-soft shadow-sm" : "border-forest/10 hover:border-forest/25"
              }`}
            >
              <span
                className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                  giftWrap ? "bg-forest text-cream" : "bg-cream-soft text-forest"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="8" width="18" height="13" rx="1.5" />
                  <path d="M3 12h18M12 8v13" strokeLinecap="round" />
                  <path d="M12 8c-2-3-6-3-6 0 0 1.5 2.5 1.5 6 0zM12 8c2-3 6-3 6 0 0 1.5-2.5 1.5-6 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="accent-forest"
                  />
                  <span className="font-medium text-forest">Add complimentary gift wrapping</span>
                </span>
                <span className="block text-xs text-charcoal/50 mt-1">
                  Your order arrives in a signature Niryana Jewels gift box with ribbon — on the house.
                </span>
              </span>
            </label>

            <AnimatePresence>
              {giftWrap && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    rows={2}
                    maxLength={200}
                    placeholder="Add a personal gift note (optional)…"
                    className="w-full border border-forest/15 rounded-xl px-4 py-3 mt-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Reveal>

          {/* Payment Method */}
          <Reveal delay={0.05} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-forest text-cream text-sm font-medium flex items-center justify-center flex-shrink-0">
                3
              </span>
              <h2 className="font-serif text-xl text-forest">Payment Method</h2>
            </div>

            <div className="space-y-3">
              <label
                className={`flex items-start gap-4 border-2 rounded-xl px-4 py-4 cursor-pointer transition-all duration-200 ${
                  paymentMethod === "razorpay" ? "border-gold bg-cream-soft shadow-sm" : "border-forest/10 hover:border-forest/25"
                }`}
              >
                <span
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === "razorpay" ? "bg-forest text-cream" : "bg-cream-soft text-forest"
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="2" y="5" width="20" height="14" rx="2.5" />
                    <path d="M2 10h20" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="accent-forest"
                    />
                    <span className="font-medium text-forest">Pay Online</span>
                  </span>
                  <span className="block text-xs text-charcoal/50 mt-1">UPI, Cards, Netbanking, Wallets &amp; EMI — powered by Razorpay</span>
                </span>
              </label>

              {settings.codEnabled && (
                <label
                  className={`flex items-start gap-4 border-2 rounded-xl px-4 py-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === "cod" ? "border-gold bg-cream-soft shadow-sm" : "border-forest/10 hover:border-forest/25"
                  }`}
                >
                  <span
                    className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === "cod" ? "bg-forest text-cream" : "bg-cream-soft text-forest"
                    }`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9.5 9.5c0-1.1 1.1-2 2.5-2s2.5.9 2.5 2-1.1 1.5-2.5 2-2.5.9-2.5 2 1.1 2 2.5 2 2.5-.9 2.5-2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-forest"
                      />
                      <span className="font-medium text-forest">Cash on Delivery</span>
                    </span>
                    <span className="block text-xs text-charcoal/50 mt-1">
                      Pay ₹{total.toLocaleString("en-IN")} in cash when your order arrives
                      {CASH_ON_DELIVERY_FEE > 0 && ` (includes ₹${CASH_ON_DELIVERY_FEE} COD fee)`}
                    </span>
                  </span>
                </label>
              )}
            </div>

            <AnimatePresence>
              {payError && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3 mt-4 overflow-hidden"
                >
                  {payError}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-6">
              <label htmlFor="agree-terms" className="flex items-start gap-3 cursor-pointer">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                  className={`mt-0.5 accent-forest ${termsError ? "outline outline-2 outline-red-400 rounded" : ""}`}
                />
                <span className="text-sm text-charcoal/70">
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-forest underline underline-offset-2 hover:text-gold">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/shipping-policy" target="_blank" className="text-forest underline underline-offset-2 hover:text-gold">
                    Return Policy
                  </Link>
                </span>
              </label>
              <AnimatePresence>
                {termsError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs mt-1.5 ml-7 overflow-hidden"
                  >
                    Please accept the Terms &amp; Conditions to continue.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              disabled={placing}
              whileTap={{ scale: 0.98 }}
              className="hidden md:block w-full bg-forest text-cream py-4 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300 mt-6 disabled:opacity-60"
            >
              {placing
                ? "Processing…"
                : paymentMethod === "cod"
                ? `Place Order — Pay ₹${total.toLocaleString("en-IN")} on Delivery`
                : `Pay ₹${total.toLocaleString("en-IN")} with Razorpay`}
            </motion.button>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {PAYMENT_BADGES.map((b) => (
                <span
                  key={b.label}
                  className="flex items-center justify-center gap-1.5 border border-forest/10 rounded-lg px-3 h-8 bg-cream-soft"
                >
                  {b.node}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-charcoal/40 mt-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" strokeLinecap="round" />
              </svg>
              Your payment information is encrypted and secure
            </div>

            {paymentMethod === "razorpay" && !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (
              <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg px-4 py-3 mt-4">
                ⚠️ Razorpay test keys aren't configured yet in this environment. Add
                <code className="mx-1 bg-white px-1 rounded">NEXT_PUBLIC_RAZORPAY_KEY_ID</code>
                and <code className="mx-1 bg-white px-1 rounded">RAZORPAY_KEY_SECRET</code> to
                <code className="mx-1 bg-white px-1 rounded">.env.local</code> — see README → "Razorpay Test Mode Setup".
              </p>
            )}
          </Reveal>
        </form>

        {/* Mobile sticky pay bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-forest/10 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-charcoal/50">Total</p>
              <p className="text-forest font-medium text-lg">₹{total.toLocaleString("en-IN")}</p>
            </div>
            <motion.button
              type="submit"
              form="checkout-form"
              disabled={placing}
              whileTap={{ scale: 0.97 }}
              className="flex-1 max-w-[220px] bg-forest text-cream py-3.5 rounded-full text-xs uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300 disabled:opacity-60"
            >
              {placing ? "Processing…" : paymentMethod === "cod" ? "Place Order" : "Pay Now"}
            </motion.button>
          </div>
        </div>

        {/* Order Summary */}
        <Reveal delay={0.1} className="md:col-span-2">

          <div className="bg-cream-soft rounded-2xl p-6 md:p-8 md:sticky md:top-28">
            <h2 className="font-serif text-xl text-forest mb-5">Order Summary</h2>

            {giftWrap && (
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 mb-5 text-sm text-forest">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A86A" strokeWidth="1.8">
                  <rect x="3" y="8" width="18" height="13" rx="1.5" />
                  <path d="M3 12h18M12 8v13" strokeLinecap="round" />
                </svg>
                <span>Gift wrapped <span className="text-charcoal/40">· complimentary</span></span>
              </div>
            )}

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 mb-5">
              {items.map((i) => (
                <div key={`${i.productId}-${i.size}`} className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                    <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 bg-forest text-cream text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-forest truncate">{i.name}</p>
                    {i.size && <p className="text-xs text-charcoal/40">Size: {i.size}</p>}
                  </div>
                  <span className="text-sm text-forest font-medium whitespace-nowrap">
                    ₹{(i.price * i.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code */}
            <div className="border-t border-forest/10 pt-4 mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 text-sm">
                  <span className="text-forest font-medium flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A86A" strokeWidth="1.8">
                      <path d="M20 12V7a2 2 0 00-2-2h-5L4 14l7 7 9-9z" />
                      <circle cx="9.5" cy="9.5" r="1.2" fill="#C9A86A" stroke="none" />
                    </svg>
                    {appliedCoupon.code} applied
                  </span>
                  <button type="button" onClick={handleRemoveCoupon} className="text-xs text-red-500 uppercase tracking-widest">
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="flex-1 min-w-0 border border-forest/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon}
                      className="px-5 py-2.5 rounded-xl border border-forest/20 text-forest text-xs uppercase tracking-widest hover:bg-forest hover:text-cream transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applyingCoupon ? "Checking…" : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                </>
              )}
            </div>

            <div className="space-y-2 text-sm border-t border-forest/10 pt-4">
              <div className="flex justify-between text-charcoal/70">
                <span>Subtotal</span>
                <span>₹{sub.toLocaleString("en-IN")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-gold font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>−₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal/70">
                <span>GST ({gstRate}%)</span>
                <span>₹{gst.toLocaleString("en-IN")}</span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between text-charcoal/70">
                  <span>COD Fee</span>
                  <span>₹{codFee.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between font-medium text-forest text-lg border-t border-forest/10 pt-4 mt-2">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-charcoal/40 mt-6 pt-4 border-t border-forest/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M20 7l-9 9-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Certified metal purity &amp; free insured shipping
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
