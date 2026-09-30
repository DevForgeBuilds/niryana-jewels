"use client";

import Link from "next/link";
import { useAdminStore } from "@/store/adminStore";
import { downloadCSV } from "@/lib/csv";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColor = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useAdminStore();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-forest">Orders</h1>
        <button
          onClick={() =>
            downloadCSV(
              "niryana-orders.csv",
              orders.map((o) => ({
                orderNumber: o.orderNumber,
                customer: o.customerName,
                total: o.total,
                status: o.status,
                date: o.createdAt,
              }))
            )
          }
          className="border border-forest text-forest px-5 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-forest hover:text-cream transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-soft">
            <tr className="text-left text-charcoal/50">
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t align-top">
                <td className="py-3 px-4 font-medium text-forest">
                  <Link href={`/admin/orders/${o.id}`} className="hover:text-gold hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <p>{o.customerName}</p>
                  <p className="text-xs text-charcoal/40">{o.phone}</p>
                </td>
                <td className="py-3 px-4">
                  {o.items.map((it, i) => (
                    <p key={i} className="text-xs text-charcoal/70">{it.name} × {it.quantity}</p>
                  ))}
                </td>
                <td className="py-3 px-4">₹{o.total.toLocaleString("en-IN")}</td>
                <td className="py-3 px-4">
                  <select
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                    className={`text-xs rounded-full px-2 py-1 capitalize border-0 ${statusColor[o.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-charcoal/50">{o.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-charcoal/40 mt-4">
        Demo data — connect to MySQL `orders`/`order_items` tables via `/api/admin/orders` for live data.
      </p>
    </div>
  );
}
