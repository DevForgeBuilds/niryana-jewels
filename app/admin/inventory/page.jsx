"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import { useAdminStore } from "@/store/adminStore";

const LOW_STOCK_THRESHOLD = 5;

export default function InventoryPage() {
  const { products, adjustStock, adjustVariantStock } = useAdminStore();
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({});

  const filtered = useMemo(() => {
    if (filter === "low") return products.filter((p) => (p.stock_quantity ?? 0) < LOW_STOCK_THRESHOLD && (p.stock_quantity ?? 0) > 0);
    if (filter === "out") return products.filter((p) => (p.stock_quantity ?? 0) === 0);
    return products;
  }, [products, filter]);

  const lowCount = products.filter((p) => (p.stock_quantity ?? 0) < LOW_STOCK_THRESHOLD && (p.stock_quantity ?? 0) > 0).length;
  const outCount = products.filter((p) => (p.stock_quantity ?? 0) === 0).length;

  function toggleExpand(id) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Inventory</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl">
        <button
          onClick={() => setFilter("all")}
          className={`bg-white rounded-xl p-4 shadow-sm text-left border-2 ${filter === "all" ? "border-gold" : "border-transparent"}`}
        >
          <p className="text-xs text-charcoal/50">All Products</p>
          <p className="text-xl font-serif text-forest">{products.length}</p>
        </button>
        <button
          onClick={() => setFilter("low")}
          className={`bg-white rounded-xl p-4 shadow-sm text-left border-2 ${filter === "low" ? "border-gold" : "border-transparent"}`}
        >
          <p className="text-xs text-charcoal/50">Low Stock (&lt;{LOW_STOCK_THRESHOLD})</p>
          <p className="text-xl font-serif text-yellow-600">{lowCount}</p>
        </button>
        <button
          onClick={() => setFilter("out")}
          className={`bg-white rounded-xl p-4 shadow-sm text-left border-2 ${filter === "out" ? "border-gold" : "border-transparent"}`}
        >
          <p className="text-xs text-charcoal/50">Out of Stock</p>
          <p className="text-xl font-serif text-red-600">{outCount}</p>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-soft">
            <tr className="text-left text-charcoal/50">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const stock = p.stock_quantity ?? 0;
              const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
              const badge =
                stock === 0
                  ? "bg-red-100 text-red-700"
                  : stock < LOW_STOCK_THRESHOLD
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700";
              const isOpen = Boolean(expanded[p.id]);
              return (
                <Fragment key={p.id}>
                  <tr className="border-t">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={p.images[0]} alt={p.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <span className="font-medium text-forest">{p.name}</span>
                      {hasVariants && (
                        <span className="text-[10px] uppercase tracking-wide text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                          {p.variants.length} sizes
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 capitalize text-charcoal/70">{p.category}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${badge}`}>{stock} units</span>
                    </td>
                    <td className="py-3 px-4">
                      {hasVariants ? (
                        <button
                          onClick={() => toggleExpand(p.id)}
                          className="text-xs text-gold hover:underline flex items-center gap-1"
                        >
                          {isOpen ? "Hide sizes ▲" : "Manage sizes ▼"}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => adjustStock(p.id, -1)}
                            className="w-7 h-7 rounded-full border border-forest/20 text-forest"
                          >
                            −
                          </button>
                          <button
                            onClick={() => adjustStock(p.id, 1)}
                            className="w-7 h-7 rounded-full border border-forest/20 text-forest"
                          >
                            +
                          </button>
                          <button
                            onClick={() => adjustStock(p.id, 10)}
                            className="text-xs text-gold hover:underline ml-2"
                          >
                            Restock +10
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {hasVariants && isOpen && (
                    <tr className="border-t bg-cream-soft/50">
                      <td colSpan={4} className="py-3 px-4">
                        <div className="space-y-2 max-w-md">
                          {p.variants.map((v) => (
                            <div key={v.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm">
                              <span className="font-medium text-forest text-sm w-24">{v.label}</span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  v.stock_quantity === 0
                                    ? "bg-red-100 text-red-700"
                                    : v.stock_quantity < LOW_STOCK_THRESHOLD
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {v.stock_quantity} units
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => adjustVariantStock(p.id, v.id, -1)}
                                  className="w-7 h-7 rounded-full border border-forest/20 text-forest"
                                >
                                  −
                                </button>
                                <button
                                  onClick={() => adjustVariantStock(p.id, v.id, 1)}
                                  className="w-7 h-7 rounded-full border border-forest/20 text-forest"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => adjustVariantStock(p.id, v.id, 10)}
                                  className="text-xs text-gold hover:underline ml-1"
                                >
                                  +10
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-charcoal/40">Nothing here.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
