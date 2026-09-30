"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";

export default function Topbar({ onMenuClick = () => {} }) {
  const { products, orders } = useAdminStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const lowStock = useMemo(
    () => products.filter((p) => (p.stock_quantity ?? 0) < 5),
    [products]
  );
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending"),
    [orders]
  );
  const notifCount = lowStock.length + pendingOrders.length;

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) router.push(`/admin/products?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="flex items-center justify-between mb-8 gap-3">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="md:hidden shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-forest"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <form onSubmit={handleSearch} className="flex-1 max-w-md min-w-0">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, orders…"
          className="w-full border border-forest/15 rounded-full px-4 py-2 bg-white text-sm"
        />
      </form>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-forest"
          aria-label="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.7 21a2 2 0 01-3.4 0" strokeLinecap="round" />
          </svg>
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl p-4 z-20 text-sm">
            <p className="font-medium text-forest mb-2">Notifications</p>
            {notifCount === 0 && <p className="text-charcoal/50">You're all caught up. 🎉</p>}
            {pendingOrders.length > 0 && (
              <div className="mb-3">
                <p className="text-xs uppercase tracking-widest text-charcoal/40 mb-1">New Orders</p>
                {pendingOrders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    onClick={() => setOpen(false)}
                    className="block py-1.5 hover:text-gold"
                  >
                    {o.orderNumber} — ₹{o.total.toLocaleString("en-IN")}
                  </Link>
                ))}
              </div>
            )}
            {lowStock.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-charcoal/40 mb-1">Low Stock</p>
                {lowStock.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/inventory`}
                    onClick={() => setOpen(false)}
                    className="block py-1.5 hover:text-gold"
                  >
                    {p.name} — {p.stock_quantity} left
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
