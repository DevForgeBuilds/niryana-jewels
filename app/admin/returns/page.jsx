"use client";

import { useAdminStore } from "@/store/adminStore";

const STATUSES = ["requested", "approved", "rejected", "refunded"];

const statusColor = {
  requested: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  refunded: "bg-green-100 text-green-700",
};

export default function ReturnsPage() {
  const { returns, updateReturnStatus } = useAdminStore();

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Returns &amp; Refunds</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-soft">
            <tr className="text-left text-charcoal/50">
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-3 px-4 font-medium text-forest">{r.orderNumber}</td>
                <td className="py-3 px-4">{r.customerName}</td>
                <td className="py-3 px-4">{r.productName}</td>
                <td className="py-3 px-4 text-charcoal/70">{r.reason}</td>
                <td className="py-3 px-4">₹{r.amount.toLocaleString("en-IN")}</td>
                <td className="py-3 px-4">
                  <select
                    value={r.status}
                    onChange={(e) => updateReturnStatus(r.id, e.target.value)}
                    className={`text-xs rounded-full px-2 py-1 capitalize border-0 ${statusColor[r.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-charcoal/50">{r.createdAt}</td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-charcoal/40">No return requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-charcoal/40 mt-4">
        Live data from MySQL — updates automatically as customers submit return requests.
      </p>
    </div>
  );
}
