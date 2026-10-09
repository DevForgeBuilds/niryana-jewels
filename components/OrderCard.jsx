"use client";

import Link from "next/link";
import OrderStatusStepper from "./OrderStatusStepper";

export default function OrderCard({ order, contact }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <p className="text-xs text-charcoal/40 uppercase tracking-widest mb-1">Order</p>
          <p className="font-serif text-lg text-forest">{order.orderNumber}</p>
          <p className="text-xs text-charcoal/50 mt-0.5">{order.createdAt}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-charcoal/40 uppercase tracking-widest mb-1">Total</p>
          <p className="font-serif text-lg text-forest">₹{Number(order.total).toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="mb-5 overflow-x-auto">
        <div className="min-w-[320px]">
          <OrderStatusStepper status={order.status} />
        </div>
      </div>

      <div className="space-y-3 border-t border-forest/10 pt-4">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-charcoal/70">
              {item.name}
              {item.size && <span className="text-charcoal/40"> · Size {item.size}</span>}
              <span className="text-charcoal/40"> × {item.quantity}</span>
            </span>
            <span className="text-forest font-medium whitespace-nowrap ml-3">
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-forest/10">
        <span className="text-xs text-charcoal/50 capitalize">
          {order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
        </span>
        <Link
          href={`/orders/${order.orderNumber}?contact=${encodeURIComponent(contact || order.email || order.phone || "")}`}
          className="text-xs text-gold uppercase tracking-widest hover:text-forest transition-colors"
        >
          View / Print Invoice
        </Link>
      </div>
    </div>
  );
}
