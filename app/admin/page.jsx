"use client";

import Link from "next/link";
import { useAdminStore } from "@/store/adminStore";

function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-2">{label}</p>
      <p className="text-3xl font-serif text-forest">{value}</p>
      {hint && <p className="text-xs text-charcoal/40 mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { products, orders, settings } = useAdminStore();
  const threshold = settings?.lowStockThreshold ?? 5;

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length;

  // Flatten both plain products and per-size variants into one list of "low or out
  // of stock" rows, sorted so the most urgent (0 left) show first.
  const stockAlerts = products
    .flatMap((p) => {
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        return p.variants
          .filter((v) => v.stock_quantity <= threshold)
          .map((v) => ({ id: `${p.id}-${v.id}`, name: p.name, slug: p.slug, label: v.label, stock: v.stock_quantity }));
      }
      const stock = p.stock_quantity ?? 0;
      return stock <= threshold ? [{ id: `${p.id}`, name: p.name, slug: p.slug, label: "", stock }] : [];
    })
    .sort((a, b) => a.stock - b.stock);

  const lowStock = stockAlerts.length;

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} />
        <StatCard label="Orders" value={orders.length} hint={`${pendingOrders} need attention`} />
        <StatCard label="Products" value={products.length} hint={lowStock > 0 ? `${lowStock} low stock` : "All in stock"} />
        <StatCard label="Customers" value={new Set(orders.map((o) => o.email)).size} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-forest">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-gold hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-charcoal/50 border-b">
              <th className="py-2">Order #</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Total</th>
              <th className="py-2">Status</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="py-3 font-medium text-forest">
                  <Link href={`/admin/orders/${o.id}`} className="hover:text-gold hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="py-3">{o.customerName}</td>
                <td className="py-3">₹{o.total.toLocaleString("en-IN")}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusColor[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-3 text-charcoal/50">{o.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {stockAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-forest">
              Low Stock Alerts <span className="text-sm font-sans text-charcoal/40">(≤ {threshold} units)</span>
            </h2>
            <Link href="/admin/inventory" className="text-sm text-gold hover:underline">
              Manage Inventory
            </Link>
          </div>
          <div className="space-y-2">
            {stockAlerts.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-cream-soft rounded-lg px-4 py-2.5 text-sm">
                <Link href={`/product/${item.slug}`} className="font-medium text-forest hover:text-gold truncate">
                  {item.name}
                  {item.label && <span className="text-charcoal/50 font-normal"> ({item.label})</span>}
                </Link>
                <span
                  className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ml-3 ${
                    item.stock === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.stock === 0 ? "Out of stock" : `${item.stock} left`}
                </span>
              </div>
            ))}
          </div>
          {stockAlerts.length > 6 && (
            <p className="text-xs text-charcoal/40 mt-3">+ {stockAlerts.length - 6} more — see full list in Inventory.</p>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Link href="/admin/products/new" className="bg-forest text-cream px-5 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors">
          + Add Product
        </Link>
      </div>
    </div>
  );
}
