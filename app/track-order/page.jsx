"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import OrderCard from "@/components/OrderCard";
import { api } from "@/lib/api";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const found = await api.trackOrder(orderNumber.trim(), contact.trim());
      setOrder(found);
    } catch (err) {
      setError(err.message || "No order found with that order number and contact info.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-28 pb-24 max-w-xl mx-auto px-6">
      <Reveal>
        <p className="text-gold uppercase tracking-widest text-xs mb-2 text-center">Order Status</p>
        <h1 className="font-serif text-3xl text-forest mb-8 text-center">Track Your Order</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4 mb-8">
          <div>
            <label className="block text-xs uppercase tracking-wide text-charcoal/50 mb-1.5">Order Number</label>
            <input
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. NJ12345678"
              className="w-full border border-forest/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-charcoal/50 mb-1.5">Email or Phone Number</label>
            <input
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Used at checkout"
              className="w-full border border-forest/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            />
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-cream py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors disabled:opacity-60"
          >
            {loading ? "Searching…" : "Track Order"}
          </button>
        </form>

        {order && <OrderCard order={order} contact={contact.trim()} />}
      </Reveal>
    </div>
  );
}
