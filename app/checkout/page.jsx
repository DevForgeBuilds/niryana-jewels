"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-6">
      <Reveal>
        <h1 className="font-serif text-4xl text-forest mb-10">Checkout</h1>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-10">
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-serif text-xl text-forest mb-2">Shipping Details</h2>
          {["name", "phone", "email", "address", "city", "pincode"].map((field) => (
            <input
              key={field}
              name={field}
              required
              value={form[field]}
              onChange={handleChange}
              placeholder={field[0].toUpperCase() + field.slice(1)}
              className="w-full border border-forest/20 rounded-lg px-4 py-3"
            />
          ))}

          <h2 className="font-serif text-xl text-forest mb-2 pt-4 border-t border-forest/10">
            Payment Method
          </h2>

          <div className="space-y-3">
            <label
              className={`flex items-start gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                paymentMethod === "razorpay" ? "border-gold bg-cream-soft" : "border-forest/15"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
                className="mt-1 accent-forest"
              />
              <div>
                <p className="font-medium text-forest">Pay Online (Razorpay)</p>
                <p className="text-xs text-charcoal/50">UPI, Cards, Netbanking, Wallets &amp; EMI</p>
              </div>
            </label>

            {settings.codEnabled && (
              <label
                className={`flex items-start gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                  paymentMethod === "cod" ? "border-gold bg-cream-soft" : "border-forest/15"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1 accent-forest"
                />
                <div>
                  <p className="font-medium text-forest">Cash on Delivery (COD)</p>
                  <p className="text-xs text-charcoal/50">
                    Pay ₹{total.toLocaleString("en-IN")} in cash when your order arrives
                    {CASH_ON_DELIVERY_FEE > 0 && ` (includes ₹${CASH_ON_DELIVERY_FEE} COD fee)`}
                  </p>
                </div>
              </label>
            )}
          </div>

          {payError && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{payError}</p>
          )}

          <button
            type="submit"
            disabled={placing}
            className="w-full bg-forest text-cream py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300 mt-4 disabled:opacity-60"
          >
            {placing
              ? "Processing…"
              : paymentMethod === "cod"
              ? `Place Order — Pay ₹${total.toLocaleString("en-IN")} on Delivery`
              : `Pay ₹${total.toLocaleString("en-IN")} with Razorpay`}
          </button>

          {paymentMethod === "razorpay" && !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (
            <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg px-4 py-3">
              ⚠️ Razorpay test keys aren't configured yet in this environment. Add
              <code className="mx-1 bg-white px-1 rounded">NEXT_PUBLIC_RAZORPAY_KEY_ID</code>
              and <code className="mx-1 bg-white px-1 rounded">RAZORPAY_KEY_SECRET</code> to
              <code className="mx-1 bg-white px-1 rounded">.env.local</code> — see README → "Razorpay Test Mode Setup".
            </p>
          )}
        </form>

        <div className="bg-cream-soft rounded-xl p-6 h-fit">
          <h2 className="font-serif text-xl text-forest mb-4">Order Summary</h2>
          {items.map((i) => (
            <div key={`${i.productId}-${i.size}`} className="flex items-start justify-between gap-3 text-sm mb-2">
              <span className="flex-1">{i.name} × {i.quantity}</span>
              <span className="shrink-0 whitespace-nowrap">₹{(i.price * i.quantity).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm mt-4 mb-2 border-t border-forest/10 pt-4">
            <span>Subtotal</span>
            <span>₹{sub.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>GST ({gstRate}%)</span>
            <span>₹{gst.toLocaleString("en-IN")}</span>
          </div>
          {codFee > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span>COD Fee</span>
              <span>₹{codFee.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between font-medium text-forest text-lg border-t border-forest/10 pt-4">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
