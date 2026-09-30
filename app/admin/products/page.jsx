"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { downloadCSV } from "@/lib/csv";

function ProductsContent() {
  const { products, deleteProduct } = useAdminStore();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-forest">Products</h1>
        <div className="flex gap-3">
          <button
            onClick={() =>
              downloadCSV(
                "niryana-products.csv",
                filtered.map((p) => ({
                  id: p.id,
                  name: p.name,
                  category: p.category,
                  price: p.price,
                  metal: p.metal,
                  stock: p.stock_quantity,
                }))
              )
            }
            className="border border-forest text-forest px-5 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-forest hover:text-cream transition-colors"
          >
            Export CSV
          </button>
          <Link
            href="/admin/products/new"
            className="bg-forest text-cream px-5 py-2.5 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors"
          >
            + Add Product
          </Link>
        </div>
      </div>

      <input
        placeholder="Search products…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-sm mb-6 border border-forest/20 rounded-full px-4 py-2 bg-white"
      />

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-soft">
            <tr className="text-left text-charcoal/50">
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-3 px-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <Image src={p.images[0]} alt={p.name} fill sizes="48px" className="object-cover" />
                  </div>
                </td>
                <td className="py-3 px-4 font-medium text-forest">{p.name}</td>
                <td className="py-3 px-4 capitalize text-charcoal/70">{p.category}</td>
                <td className="py-3 px-4">₹{p.price.toLocaleString("en-IN")}</td>
                <td className="py-3 px-4">{p.stock_quantity ?? "—"}</td>
                <td className="py-3 px-4 space-x-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-gold hover:underline">Edit</Link>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${p.name}"?`)) deleteProduct(p.id);
                    }}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-charcoal/40">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="text-forest">Loading…</div>}>
      <ProductsContent />
    </Suspense>
  );
}
