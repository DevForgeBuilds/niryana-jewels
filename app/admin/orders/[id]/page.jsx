"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useAdminStore } from "@/store/adminStore";
import { LOGO_URL } from "@/data/mediaManifest";
import { downloadInvoicePdf } from "@/lib/generateInvoicePdf";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const order = useAdminStore((s) => s.getOrderById(id));
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  if (!order) {
    return <p className="text-charcoal/60">Order not found.</p>;
  }

  async function handleDownloadInvoice() {
    if (invoiceLoading) return;
    setInvoiceLoading(true);
    try {
      await downloadInvoicePdf(order);
    } catch (err) {
      console.error(err);
      alert("Could not generate the invoice PDF. Please try again.");
    } finally {
      setInvoiceLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.push("/admin/orders")} className="text-sm text-forest hover:text-gold">
          ← Back to Orders
        </button>
        <div className="flex gap-3 items-center">
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
            className="border border-forest/20 rounded-full px-4 py-2 text-sm capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleDownloadInvoice}
            disabled={invoiceLoading}
            className="bg-gold text-forest px-5 py-2 rounded-full text-sm uppercase tracking-widest hover:bg-forest hover:text-cream transition-colors disabled:opacity-60"
          >
            {invoiceLoading ? "Preparing…" : "Download Invoice (PDF)"}
          </button>
          <button
            onClick={() => window.print()}
            className="bg-forest text-cream px-5 py-2 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
          >
            Print Invoice
          </button>
        </div>
      </div>

      {/* ---- Printable Invoice ---- */}
      <div className="bg-white rounded-xl shadow-sm p-10 max-w-3xl mx-auto print:shadow-none print:rounded-none">
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
                <td className="py-3">{it.name}</td>
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
            <div className="flex justify-between">
              <span className="text-charcoal/60">GST (3%)</span>
              <span>₹{order.gst.toLocaleString("en-IN")}</span>
            </div>
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
