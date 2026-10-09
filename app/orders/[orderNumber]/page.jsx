"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import { LOGO_URL } from "@/data/mediaManifest";
import OrderStatusStepper from "@/components/OrderStatusStepper";

export default function CustomerInvoicePage() {
  const { orderNumber } = useParams();
  const searchParams = useSearchParams();
  const contactFromUrl = searchParams.get("contact") || "";

  const [contact, setContact] = useState(contactFromUrl);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(c) {
    if (!c.trim()) return;
    setLoading(true);
    setError("");
    try {
      const found = await api.trackOrder(orderNumber, c.trim());
      setOrder(found);
    } catch (err) {
      setError(err.message || "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (contactFromUrl) lookup(contactFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  if (!order) {
    return (
      <div className="pt-28 pb-24 max-w-md mx-auto px-6">
        <h1 className="font-serif text-2xl text-forest text-center mb-6">View Order #{orderNumber}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup(contact);
          }}
          className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
        >
          <p className="text-sm text-charcoal/60">
            Enter the email or phone number used when placing this order.
          </p>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email or phone number"
            className="w-full border border-forest/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-cream py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors disabled:opacity-60"
          >
            {loading ? "Looking up…" : "View Order"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-6">
      <div className="flex items-center justify-end mb-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-forest text-cream px-5 py-2 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
        >
          Print / Save PDF
        </button>
      </div>

      <div className="mb-8 print:hidden">
        <OrderStatusStepper status={order.status} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-10 print:shadow-none print:rounded-none">
        <div className="flex justify-between items-start border-b border-forest/10 pb-6 mb-6">
          <div>
            <Image src={LOGO_URL} alt="Niryana Jewels" width={160} height={80} className="h-14 w-auto object-contain mb-3" />
            <p className="text-xs text-charcoal/60 leading-relaxed">
              Shop No. 324, 3rd Floor, Prime Arcade,<br />
              Beside Raghuvir Shoppers, Lajamni Chowk,<br />
              Mota Varachha, Surat – 394101, Gujarat, India<br />
              GSTIN: 24GHKPB8783C1Z8
            </p>
          </div>
          <div className="text-right">
            <h1 className="font-serif text-2xl text-forest mb-1">Invoice</h1>
            <p className="text-sm text-charcoal/60">{order.orderNumber}</p>
            <p className="text-sm text-charcoal/60">{order.createdAt}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs capitalize bg-cream-soft text-forest">
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-charcoal/40 mb-1">Billed To</p>
            <p className="font-medium text-forest">{order.customerName}</p>
            <p className="text-sm text-charcoal/60">{order.phone}</p>
            <p className="text-sm text-charcoal/60">{order.email}</p>
            <p className="text-sm text-charcoal/60 mt-1">{order.address}</p>
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-charcoal/50 border-b">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i} className="border-b">
                  <td className="py-3">
                    {it.name}
                    {it.size && <span className="text-charcoal/40"> · Size {it.size}</span>}
                  </td>
                  <td className="py-3 text-center">{it.quantity}</td>
                  <td className="py-3 text-right">₹{it.price.toLocaleString("en-IN")}</td>
                  <td className="py-3 text-right">₹{(it.price * it.quantity).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal/60">Subtotal</span>
              <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-gold">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>−₹{order.discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-charcoal/60">GST</span>
              <span>₹{order.gst.toLocaleString("en-IN")}</span>
            </div>
            {order.codFee > 0 && (
              <div className="flex justify-between">
                <span className="text-charcoal/60">COD Fee</span>
                <span>₹{order.codFee.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-forest text-lg border-t border-forest/10 pt-2">
              <span>Total</span>
              <span>₹{order.total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-charcoal/40 text-center mt-10">
          Thank you for shopping with Niryana Jewels — Fine Jewellery with Heart &amp; Heritage.
        </p>
      </div>
    </div>
  );
}
