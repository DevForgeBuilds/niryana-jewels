"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/store/adminStore";

// Hydrates the admin store (products, orders, customers, coupons, reviews, returns,
// staff, settings, festive collections, activity log) from the MySQL-backed API once
// when the app first loads. Mounted at the root layout so both the storefront and the
// Admin Dashboard share the same live data.
export default function AdminDataProvider() {
  const init = useAdminStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return null;
}
