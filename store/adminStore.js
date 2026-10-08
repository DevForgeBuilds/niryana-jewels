"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS, CATEGORIES as BASE_CATEGORIES, FESTIVE_COLLECTIONS } from "@/data/products";
import { MOCK_ORDERS, MOCK_CUSTOMERS } from "@/data/orders";
import { MOCK_REVIEWS, MOCK_RETURNS, MOCK_STAFF } from "@/data/adminExtras";

const DEFAULT_COUPONS = [
  { id: 1, code: "WELCOME10", type: "percent", value: 10, active: true, usedCount: 12, expiresAt: "2026-12-31" },
  { id: 2, code: "FESTIVE500", type: "flat", value: 500, active: true, usedCount: 4, expiresAt: "2026-11-15" },
  { id: 3, code: "RAKHI2026", type: "percent", value: 15, active: false, usedCount: 30, expiresAt: "2026-08-30" },
];

const DEFAULT_SETTINGS = {
  gstRate: 3,
  freeShippingThreshold: 5000,
  flatShippingRate: 99,
  codEnabled: true,
};

function logEntry(action, detail) {
  return { id: Date.now() + Math.random(), action, detail, timestamp: new Date().toISOString() };
}

// ---------------------------------------------------------------------------------
// Admin demo store — persisted to localStorage so every edit survives reloads
// within this browser. In production, replace every action here with a call to
// /api/admin/* routes backed by MySQL (see README → "Admin API routes").
// ---------------------------------------------------------------------------------
export const useAdminStore = create(
  persist(
    (set, get) => ({
      products: PRODUCTS,
      orders: MOCK_ORDERS,
      customers: MOCK_CUSTOMERS,
      categories: BASE_CATEGORIES,
      coupons: DEFAULT_COUPONS,
      reviews: MOCK_REVIEWS,
      returns: MOCK_RETURNS,
      staff: MOCK_STAFF,
      settings: DEFAULT_SETTINGS,
      festiveCollections: FESTIVE_COLLECTIONS,
      activityLog: [],

      pushLog: (action, detail) =>
        set((state) => ({ activityLog: [logEntry(action, detail), ...state.activityLog].slice(0, 100) })),

      // ---------------- Products ----------------
      addProduct: (product) =>
        set((state) => ({
          products: [
            ...state.products,
            { ...product, id: Date.now(), slug: slugify(product.name) },
          ],
          activityLog: [logEntry("Product Added", product.name), ...state.activityLog].slice(0, 100),
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          activityLog: [logEntry("Product Updated", updates.name || `#${id}`), ...state.activityLog].slice(0, 100),
        })),

      deleteProduct: (id) =>
        set((state) => {
          const p = state.products.find((x) => x.id === id);
          return {
            products: state.products.filter((p) => p.id !== id),
            activityLog: [logEntry("Product Deleted", p?.name || `#${id}`), ...state.activityLog].slice(0, 100),
          };
        }),

      adjustStock: (id, delta) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, stock_quantity: Math.max(0, (p.stock_quantity ?? 0) + delta) }
              : p
          ),
        })),

      // ---------------- Orders ----------------
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
          activityLog: [logEntry("Order Status Updated", `#${id} → ${status}`), ...state.activityLog].slice(0, 100),
        })),

      getOrderById: (id) => get().orders.find((o) => String(o.id) === String(id)),

      // ---------------- Customers ----------------
      getCustomerById: (id) => get().customers.find((c) => String(c.id) === String(id)),

      // ---------------- Categories ----------------
      addCategory: (name) =>
        set((state) => ({
          categories: [...state.categories, { slug: slugify(name), name }],
          activityLog: [logEntry("Category Added", name), ...state.activityLog].slice(0, 100),
        })),

      renameCategory: (slug, name) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.slug === slug ? { ...c, name } : c)),
        })),

      deleteCategory: (slug) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.slug !== slug),
        })),

      // ---------------- Festive Collections ----------------
      addFestiveCollection: (collection) =>
        set((state) => {
          const slug = collection.slug?.trim() ? slugify(collection.slug) : slugify(collection.name);
          if (state.festiveCollections.some((c) => c.slug === slug)) {
            return state; // slug already exists — caller should check first
          }
          return {
            festiveCollections: [
              ...state.festiveCollections,
              {
                accent: "gold",
                heroImage: "",
                heroVideo: "",
                productSlugs: [],
                ...collection,
                slug,
              },
            ],
            activityLog: [logEntry("Festive Collection Added", collection.name), ...state.activityLog].slice(0, 100),
          };
        }),

      updateFestiveCollection: (slug, updates) =>
        set((state) => ({
          festiveCollections: state.festiveCollections.map((c) =>
            c.slug === slug ? { ...c, ...updates } : c
          ),
          activityLog: [logEntry("Festive Collection Updated", updates.name || slug), ...state.activityLog].slice(
            0,
            100
          ),
        })),

      deleteFestiveCollection: (slug) =>
        set((state) => {
          const c = state.festiveCollections.find((x) => x.slug === slug);
          return {
            festiveCollections: state.festiveCollections.filter((x) => x.slug !== slug),
            activityLog: [logEntry("Festive Collection Deleted", c?.name || slug), ...state.activityLog].slice(
              0,
              100
            ),
          };
        }),

      toggleProductInCollection: (collectionSlug, productSlug) =>
        set((state) => ({
          festiveCollections: state.festiveCollections.map((c) => {
            if (c.slug !== collectionSlug) return c;
            const has = c.productSlugs.includes(productSlug);
            return {
              ...c,
              productSlugs: has
                ? c.productSlugs.filter((s) => s !== productSlug)
                : [...c.productSlugs, productSlug],
            };
          }),
        })),

      // ---------------- Coupons ----------------
      addCoupon: (coupon) =>
        set((state) => ({
          coupons: [...state.coupons, { ...coupon, id: Date.now(), usedCount: 0 }],
          activityLog: [logEntry("Coupon Created", coupon.code), ...state.activityLog].slice(0, 100),
        })),

      toggleCoupon: (id) =>
        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
        })),

      deleteCoupon: (id) =>
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id),
        })),

      // Looks up an active, non-expired coupon by code (case-insensitive).
      // Used by the checkout page to validate + preview the discount live.
      findValidCoupon: (code) => {
        const c = get().coupons.find(
          (c) => c.code.toLowerCase() === String(code).trim().toLowerCase()
        );
        if (!c) return null;
        if (!c.active) return null;
        if (c.expiresAt && new Date(c.expiresAt) < new Date()) return null;
        return c;
      },

      incrementCouponUsage: (id) =>
        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === id ? { ...c, usedCount: (c.usedCount || 0) + 1 } : c)),
        })),

      // ---------------- Reviews ----------------
      addReview: (review) =>
        set((state) => ({
          reviews: [
            { ...review, id: Date.now(), status: "pending", createdAt: new Date().toISOString().slice(0, 10) },
            ...state.reviews,
          ],
          activityLog: [logEntry("Review Submitted", review.productName), ...state.activityLog].slice(0, 100),
        })),

      approveReview: (id) =>
        set((state) => ({
          reviews: state.reviews.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
          activityLog: [logEntry("Review Approved", `#${id}`), ...state.activityLog].slice(0, 100),
        })),

      rejectReview: (id) =>
        set((state) => ({
          reviews: state.reviews.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)),
        })),

      deleteReview: (id) =>
        set((state) => ({
          reviews: state.reviews.filter((r) => r.id !== id),
        })),

      // ---------------- Returns ----------------
      updateReturnStatus: (id, status) =>
        set((state) => ({
          returns: state.returns.map((r) => (r.id === id ? { ...r, status } : r)),
          activityLog: [logEntry("Return Updated", `#${id} → ${status}`), ...state.activityLog].slice(0, 100),
        })),

      // ---------------- Staff ----------------
      addStaff: (staff) =>
        set((state) => ({
          staff: [...state.staff, { ...staff, id: Date.now(), active: true }],
          activityLog: [logEntry("Staff Added", staff.name), ...state.activityLog].slice(0, 100),
        })),

      toggleStaff: (id) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
        })),

      deleteStaff: (id) =>
        set((state) => ({
          staff: state.staff.filter((s) => s.id !== id),
        })),

      // ---------------- Settings ----------------
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
          activityLog: [logEntry("Settings Updated", Object.keys(updates).join(", ")), ...state.activityLog].slice(0, 100),
        })),

      resetDemoData: () =>
        set({
          products: PRODUCTS,
          orders: MOCK_ORDERS,
          customers: MOCK_CUSTOMERS,
          categories: BASE_CATEGORIES,
          coupons: DEFAULT_COUPONS,
          reviews: MOCK_REVIEWS,
          returns: MOCK_RETURNS,
          staff: MOCK_STAFF,
          settings: DEFAULT_SETTINGS,
          festiveCollections: FESTIVE_COLLECTIONS,
          activityLog: [],
        }),
    }),
    { name: "niryana-admin-demo" }
  )
);

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
