"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { ASSETS } from "@/data/mediaManifest";
import { toast } from "@/store/toastStore";
import Reveal from "@/components/Reveal";

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000];

export default function GiftCardsClient() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [amount, setAmount] = useState(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");

  const finalAmount = customAmount ? Number(customAmount) : amount;
  const isValidAmount = finalAmount >= 500 && finalAmount <= 100000;

  function handleAddToCart(e) {
    e.preventDefault();
    if (!isValidAmount) {
      toast("Please enter an amount between ₹500 and ₹1,00,000.", "error");
      return;
    }
    if (!recipientName.trim()) {
      toast("Please enter the recipient's name.", "error");
      return;
    }

    const giftCardProduct = {
      id: `giftcard-${Date.now()}`,
      slug: "gift-card",
      name: `Niryana Jewels Gift Card — ₹${finalAmount.toLocaleString("en-IN")}`,
      price: finalAmount,
      images: [ASSETS.fullLookNecklace],
    };

    addItem(giftCardProduct, 1, null, {
      type: "giftcard",
      giftCardAmount: finalAmount,
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.trim(),
      giftMessage: message.trim(),
    });

    toast("Gift card added to cart!", "success");
    router.push("/cart");
  }

  return (
    <div className="pt-28 pb-24">
      <section className="max-w-5xl mx-auto px-6">
        <Reveal className="text-center mb-14">
          <p className="text-gold uppercase tracking-widest2 text-xs mb-3">Give the Gift of Niryana</p>
          <h1 className="font-serif text-4xl md:text-6xl text-forest mb-6">Digital Gift Cards</h1>
          <p className="text-charcoal/70 max-w-2xl mx-auto leading-relaxed">
            Let them choose their own favourite piece. Delivered instantly as a unique code, redeemable on
            any purchase at Niryana Jewels.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-5 gap-10">
          {/* Preview card */}
          <Reveal className="md:col-span-2">
            <div className="sticky top-28">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-xl bg-forest">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ASSETS.fullLookNecklace}
                  alt="Niryana Jewels Gift Card"
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-forest/90 via-forest/50 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-between p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-white text-lg tracking-wide">NIRYANA JEWELS</span>
                    <span className="text-gold uppercase tracking-widest text-[10px]">Gift Card</span>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Amount</p>
                    <p className="font-serif text-white text-3xl">
                      ₹{(finalAmount || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-charcoal/50 mt-4 text-center">
                Your unique gift card code is generated the moment your order is placed and shown on the
                order confirmation page — share it with
                {recipientName ? ` ${recipientName}` : " your recipient"} however you like.
              </p>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.05} className="md:col-span-3">
            <form onSubmit={handleAddToCart} className="bg-white rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-3">
                  Choose an Amount
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount("");
                      }}
                      className={`py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                        !customAmount && amount === amt
                          ? "border-gold bg-cream-soft text-forest shadow-sm"
                          : "border-forest/10 text-charcoal/70 hover:border-forest/25"
                      }`}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <input
                    type="number"
                    min={500}
                    max={100000}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Or enter a custom amount (₹500 – ₹1,00,000)"
                    className="w-full border border-forest/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">
                    Recipient's Name
                  </label>
                  <input
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Priya"
                    className="w-full border border-forest/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">
                    Recipient's Email (optional)
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="their@email.com"
                    className="w-full border border-forest/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal/50 mb-1.5">
                  Personal Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="Add a short note…"
                  className="w-full border border-forest/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-forest text-cream py-4 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
              >
                Add Gift Card to Cart — ₹{(finalAmount || 0).toLocaleString("en-IN")}
              </button>

              <ul className="text-xs text-charcoal/50 space-y-1.5 pt-2 border-t border-forest/10">
                <li>• Delivered as a unique code right after checkout — no physical card to lose.</li>
                <li>• Valid towards any product on niryanajewels.com, no expiry.</li>
                <li>• Can be used for part-payment — any remaining amount is paid via UPI/Card/COD.</li>
              </ul>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
