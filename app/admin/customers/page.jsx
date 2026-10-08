"use client";

import Link from "next/link";
import { useAdminStore } from "@/store/adminStore";
import { downloadCSV } from "@/lib/csv";

export default function AdminCustomersPage() {
  const customers = useAdminStore((s) => s.customers);
  const loading = useAdminStore((s) => s.loading);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-forest">Customers</h1>
        <button
          onClick={() => downloadCSV("niryana-customers.csv", customers)}
          className="border border-forest text-forest px-5 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-forest hover:text-cream transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-soft">
            <tr className="text-left text-charcoal/50">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Orders</th>
              <th className="py-3 px-4">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-3 px-4 font-medium text-forest">
                  <Link href={`/admin/customers/${c.id}`} className="hover:text-gold hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="py-3 px-4">{c.email}</td>
                <td className="py-3 px-4">{c.phone}</td>
                <td className="py-3 px-4">{c.orders}</td>
                <td className="py-3 px-4">₹{c.totalSpent.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && customers.length === 0 && (
          <p className="text-center text-charcoal/50 py-10">No customers yet — they appear here automatically after the first order.</p>
        )}
        {loading && <p className="text-center text-charcoal/50 py-10">Loading…</p>}
      </div>
      <p className="text-xs text-charcoal/40 mt-4">Live data from MySQL — updates automatically as orders come in.</p>
    </div>
  );
}
