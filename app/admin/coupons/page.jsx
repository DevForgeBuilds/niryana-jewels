"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";

export default function CouponsPage() {
  const { coupons, addCoupon, toggleCoupon, deleteCoupon } = useAdminStore();
  const [form, setForm] = useState({ code: "", type: "percent", value: "", expiresAt: "" });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.code.trim() || !form.value) return;
    addCoupon({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      expiresAt: form.expiresAt || "—",
      active: true,
    });
    setForm({ code: "", type: "percent", value: "", expiresAt: "" });
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Coupons &amp; Discounts</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-8 max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          placeholder="Code (e.g. DIWALI20)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="border border-forest/20 rounded-lg px-4 py-2.5"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border border-forest/20 rounded-lg px-4 py-2.5"
        >
          <option value="percent">Percentage (%)</option>
          <option value="flat">Flat (₹)</option>
        </select>
        <input
          required
          type="number"
          placeholder="Value"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          className="border border-forest/20 rounded-lg px-4 py-2.5"
        />
        <input
          type="date"
          value={form.expiresAt}
          onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          className="border border-forest/20 rounded-lg px-4 py-2.5"
        />
        <button
          type="submit"
          className="sm:col-span-2 bg-forest text-cream py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
        >
          Create Coupon
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-soft">
            <tr className="text-left text-charcoal/50">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Discount</th>
              <th className="py-3 px-4">Used</th>
              <th className="py-3 px-4">Expires</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-3 px-4 font-mono font-medium text-forest">{c.code}</td>
                <td className="py-3 px-4">{c.type === "percent" ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="py-3 px-4">{c.usedCount}×</td>
                <td className="py-3 px-4 text-charcoal/50">{c.expiresAt}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleCoupon(c.id)}
                    className={`px-2 py-1 rounded-full text-xs ${c.active ? "bg-green-100 text-green-700" : "bg-charcoal/10 text-charcoal/50"}`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => deleteCoupon(c.id)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-charcoal/40 mt-4">
        Demo only — wire coupon validation into `/api/checkout` against a MySQL `coupons` table.
      </p>
    </div>
  );
}
