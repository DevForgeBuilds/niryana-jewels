"use client";

import { useParams, useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const customer = useAdminStore((s) => s.getCustomerById(id));
  const orders = useAdminStore((s) => s.orders.filter((o) => o.email === customer?.email));

  if (!customer) {
    return <p className="text-charcoal/60">Customer not found.</p>;
  }

  return (
    <div>
      <button onClick={() => router.push("/admin/customers")} className="text-sm text-forest hover:text-gold mb-6">
        ← Back to Customers
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm md:col-span-1">
          <div className="w-16 h-16 rounded-full bg-forest text-cream flex items-center justify-center font-serif text-2xl mb-4">
            {customer.name.charAt(0)}
          </div>
          <h1 className="font-serif text-2xl text-forest mb-1">{customer.name}</h1>
          <p className="text-sm text-charcoal/60">{customer.email}</p>
          <p className="text-sm text-charcoal/60">{customer.phone}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-1">Total Orders</p>
          <p className="text-2xl font-serif text-forest">{customer.orders}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-charcoal/50 mb-1">Total Spent</p>
          <p className="text-2xl font-serif text-forest">₹{customer.totalSpent.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-serif text-xl text-forest mb-4">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-charcoal/50 text-sm">No orders found for this customer.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-charcoal/50 border-b">
                <th className="py-2">Order #</th>
                <th className="py-2">Total</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-forest">{o.orderNumber}</td>
                  <td className="py-3">₹{o.total.toLocaleString("en-IN")}</td>
                  <td className="py-3 capitalize">{o.status}</td>
                  <td className="py-3 text-charcoal/50">{o.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
