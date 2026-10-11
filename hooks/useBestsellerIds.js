"use client";

import { useMemo } from "react";
import { useAdminStore } from "@/store/adminStore";
import { computeBestsellerIds } from "@/lib/bestsellers";

// Shared across every ProductCard / product page — recomputed only when the
// orders list actually changes, not on every render.
export default function useBestsellerIds() {
  const orders = useAdminStore((s) => s.orders);
  return useMemo(() => computeBestsellerIds(orders), [orders]);
}
