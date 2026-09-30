"use client";

import { useMemo } from "react";
import { useAdminStore } from "@/store/adminStore";
import BarChart from "@/components/admin/BarChart";
import LineChart from "@/components/admin/LineChart";

export default function AnalyticsPage() {
  const { orders, products } = useAdminStore();

  const revenueByDate = useMemo(() => {
    const sorted = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return sorted.map((o) => ({
      label: new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      value: o.total,
    }));
  }, [orders]);

  const categoryRevenue = useMemo(() => {
    const map = {};
    orders.forEach((o) =>
      o.items.forEach((it) => {
        const product = products.find((p) => p.name === it.name);
        const cat = product?.category || "other";
        map[cat] = (map[cat] || 0) + it.price * it.quantity;
      })
    );
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [orders, products]);

  const topProducts = useMemo(() => {
    const map = {};
    orders.forEach((o) =>
      o.items.forEach((it) => {
        map[it.name] = (map[it.name] || 0) + it.quantity;
      })
    );
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [orders]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Sales Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-1">Total Revenue</p>
          <p className="text-2xl font-serif text-forest">₹{totalRevenue.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-1">Avg. Order Value</p>
          <p className="text-2xl font-serif text-forest">₹{avgOrderValue.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-1">Total Orders</p>
          <p className="text-2xl font-serif text-forest">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-1">Active Products</p>
          <p className="text-2xl font-serif text-forest">{products.length}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-serif text-lg text-forest mb-4">Revenue Trend</h2>
          <LineChart points={revenueByDate} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-serif text-lg text-forest mb-4">Revenue by Category</h2>
          <BarChart data={categoryRevenue} format={(v) => `₹${v.toLocaleString("en-IN")}`} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-serif text-lg text-forest mb-4">Top Selling Products</h2>
          <BarChart data={topProducts} color="#C9A86A" format={(v) => `${v} sold`} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-serif text-lg text-forest mb-4">Order Status Breakdown</h2>
          <BarChart data={statusBreakdown} color="#254A3B" format={(v) => `${v} orders`} />
        </div>
      </div>

      <p className="text-xs text-charcoal/40 mt-6">
        Demo analytics computed from sample orders — replace with real aggregate
        queries against MySQL (`orders`, `order_items`) once live.
      </p>
    </div>
  );
}
