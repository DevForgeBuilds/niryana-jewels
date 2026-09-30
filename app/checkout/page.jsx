"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAdminStore } from "@/store/adminStore";
import { loadRazorpayScript } from "@/lib/razorpay";
import Reveal from "@/components/Reveal";

const CASH_ON_DELIVERY_FEE = 49; // small COD handling fee, set to 0 if not desired

// Standalone backend (Express, deployed on Render) that owns the Razorpay
// create-order/verify logic. Set NEXT_PUBLIC_API_URL in Vercel's project
// settings to the Render service URL, e.g. https://niryana-backend.onrender.com
// Falls back to same-origin ("") for local dev if you haven't set it yet.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const FIELDS = [
  { name: "name", label: "Full Name", type: "text", span: 1, autoComplete: "name" },
  { name: "phone", label: "Phone Number", type: "tel", span: 1, autoComplete: "tel" },
  { name: "email", label: "Email Address", type: "email", span: 2, autoComplete: "email" },
  { name: "address", label: "Delivery Address", type: "text", span: 2, autoComplete: "street-address" },
  { name: "city", label: "City", type: "text", span: 1, autoComplete: "address-level2" },
  { name: "pincode", label: "Pincode", type: "text", span: 1, autoComplete: "postal-code" },
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const settings = useAdminStore((s) => s.settings);
  const gstRate = settings.gstRate;
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // 'razorpay' | 'cod'
  const [placing, setPlacing] = useState(false);
  const [payError, setPayError] = useState("");

  const sub = subtotal();
  const gst = Math.round(sub * (gstRate / 100));
  const codFee = paymentMethod === "cod" ? CASH_ON_DELIVERY_FEE : 0;
  const total = sub + gst + codFee;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
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
            // TODO: create the order + order_items rows in MySQL here, then
            // send confirmation email/WhatsApp with the invoice.
            alert("Payment successful! Order confirmed. ✨");
            clearCart();
            router.push("/");
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

  async function handleCodOrder() {
    // ---------------------------------------------------------------
    // Cash on Delivery flow:
    // 1. POST /api/orders -> create order row in MySQL
    //    (status: 'pending', payment_method: 'cod', payment_id: NULL)
    // 2. No online payment — amount collected by courier on delivery.
    // 3. Send order confirmation email/WhatsApp with COD amount due.
    // ---------------------------------------------------------------
    alert(
      `Demo checkout — Order placed with Cash on Delivery.\nAmount due at delivery: ₹${total.toLocaleString("en-IN")}\n(Real order creation goes here — see README.)`
    );
    clearCart();
    router.push("/");
  }

  async function handleSubmit(e) {
    e.preventDefault();
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
    <div className="pt-28 pb-24 max-w-6xl mx-auto px-6">
      <Reveal>
        <p className="text-gold uppercase tracking-widest text-xs mb-2">Secure Checkout</p>
        <h1 className="font-serif text-4xl text-forest mb-10">Checkout</h1>
      </Reveal>

      <div className="grid md:grid-cols-5 gap-10">
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-8">
          {/* Shipping Details */}
          <Reveal className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-forest text-cream text-sm font-medium flex items-center justify-center flex-shrink-0">
                1
              </span>
              <h2 className="font-serif text-xl text-forest">Shipping Details</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {FIELDS.map((field) => (
                <div key={field.name} className={field.span === 2 ? "sm:col-span-2" : ""}>
                  <label htmlFor={field.name} className="block text-xs uppercase tracking-wide text-charcoal/50 mb-1.5">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required
                    autoComplete={field.autoComplete}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.label}
                    className="w-full border border-forest/15 rounded-xl px-4 py-3 text-forest placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-shadow duration-200"
                  />
                </div>
              ))}
            </div>
          </Reveal>

          {/* Payment Method */}
          <Reveal delay={0.05} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-forest text-cream text-sm font-medium flex items-center justify-center flex-shrink-0">
                2
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

            <motion.button
              type="submit"
              disabled={placing}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-forest text-cream py-4 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300 mt-6 disabled:opacity-60"
            >
              {placing
                ? "Processing…"
                : paymentMethod === "cod"
                ? `Place Order — Pay ₹${total.toLocaleString("en-IN")} on Delivery`
                : `Pay ₹${total.toLocaleString("en-IN")} with Razorpay`}
            </motion.button>

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

        {/* Order Summary */}
        <Reveal delay={0.1} className="md:col-span-2">
          <div className="bg-cream-soft rounded-2xl p-6 md:p-8 md:sticky md:top-28">
            <h2 className="font-serif text-xl text-forest mb-5">Order Summary</h2>

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

            <div className="space-y-2 text-sm border-t border-forest/10 pt-4">
              <div className="flex justify-between text-charcoal/70">
                <span>Subtotal</span>
                <span>₹{sub.toLocaleString("en-IN")}</span>
              </div>
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
