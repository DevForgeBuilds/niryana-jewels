"use client";

import { create } from "zustand";
import { api } from "@/lib/api";

// ---------------------------------------------------------------------------------
// Admin store — now backed by the real MySQL database via the Express API
// (backend/, deployed on Render). Every mutation here calls the backend first, then
// updates local state from the response so every connected browser/device sees the
// same data after a refresh. Call `init()` once (see components/AdminDataProvider)
// to hydrate everything on app start.
// ---------------------------------------------------------------------------------
export const useAdminStore = create((set, get) => ({
  products: [],
  orders: [],
  customers: [],
  categories: [],
  coupons: [],
  reviews: [],
  returns: [],
  staff: [],
  settings: { gstRate: 3, freeShippingThreshold: 5000, flatShippingRate: 99, codEnabled: true },
  festiveCollections: [],
  activityLog: [],
  loading: true,
  loadError: null,
  initialized: false,

  init: async () => {
    if (get().initialized || get()._initializing) return;
    set({ _initializing: true, loading: true, loadError: null });
    try {
      const [products, orders, customers, categories, coupons, reviews, returns, staff, settings, festiveCollections, activityLog] =
        await Promise.all([
          api.getProducts(),
          api.getOrders(),
          api.getCustomers(),
          api.getCategories(),
          api.getCoupons(),
          api.getReviews(),
          api.getReturns(),
          api.getStaff(),
          api.getSettings(),
          api.getCollections(),
          api.getActivity(),
        ]);
      set({
        products,
        orders,
        customers,
        categories,
        coupons,
        reviews,
        returns,
        staff,
        settings,
        festiveCollections,
        activityLog,
        loading: false,
        initialized: true,
        _initializing: false,
      });
    } catch (err) {
      console.error("Failed to load admin data from backend:", err);
      set({ loading: false, loadError: err.message, _initializing: false });
    }
  },

  refreshProducts: async () => set({ products: await api.getProducts() }),
  refreshOrders: async () => set({ orders: await api.getOrders() }),
  refreshActivity: async () => set({ activityLog: await api.getActivity() }),

  pushLog: async (action, detail) => {
    await api.pushLog(action, detail);
    set({ activityLog: await api.getActivity() });
  },

  // ---------------- Products ----------------
  addProduct: async (product) => {
    const created = await api.createProduct(product);
    set((state) => ({ products: [created, ...state.products] }));
    get().refreshActivity();
    return created;
  },

  updateProduct: async (id, updates) => {
    const updated = await api.updateProduct(id, updates);
    set((state) => ({ products: state.products.map((p) => (p.id === id ? updated : p)) }));
    get().refreshActivity();
    return updated;
  },

  deleteProduct: async (id) => {
    await api.deleteProduct(id);
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
    get().refreshActivity();
  },

  adjustStock: async (id, delta) => {
    const updated = await api.adjustStock(id, delta);
    set((state) => ({ products: state.products.map((p) => (p.id === id ? updated : p)) }));
  },

  adjustVariantStock: async (id, variantId, delta) => {
    const updated = await api.adjustVariantStock(id, variantId, delta);
    set((state) => ({ products: state.products.map((p) => (p.id === id ? updated : p)) }));
  },

  // ---------------- Orders ----------------
  // Called from the live checkout flow so a real customer order is written straight
  // into MySQL and shows up under Admin → Orders immediately — on any device/browser.
  addOrder: async (orderData) => {
    const created = await api.createOrder(orderData);
    const [products, customers, activityLog] = await Promise.all([api.getProducts(), api.getCustomers(), api.getActivity()]);
    set((state) => ({ orders: [created, ...state.orders], products, customers, activityLog }));
    return created;
  },

  updateOrderStatus: async (id, status) => {
    const updated = await api.updateOrderStatus(id, status);
    set((state) => ({ orders: state.orders.map((o) => (o.id === id ? updated : o)) }));
    get().refreshActivity();
  },

  getOrderById: (id) => get().orders.find((o) => String(o.id) === String(id)),

  // ---------------- Customers ----------------
  getCustomerById: (id) => get().customers.find((c) => String(c.id) === String(id)),

  // ---------------- Categories ----------------
  addCategory: async (name) => {
    const created = await api.createCategory(name);
    // Newest category shows up first in the admin list, not buried at the bottom.
    set((state) => ({ categories: [created, ...state.categories] }));
    get().refreshActivity();
  },

  renameCategory: async (slug, name) => {
    await api.renameCategory(slug, name);
    set((state) => ({ categories: state.categories.map((c) => (c.slug === slug ? { ...c, name } : c)) }));
  },

  deleteCategory: async (slug) => {
    await api.deleteCategory(slug);
    set((state) => ({ categories: state.categories.filter((c) => c.slug !== slug) }));
  },

  // ---------------- Festive Collections ----------------
  addFestiveCollection: async (collection) => {
    const created = await api.createCollection(collection);
    set((state) => ({ festiveCollections: [...state.festiveCollections, created] }));
    get().refreshActivity();
    return created;
  },

  updateFestiveCollection: async (slug, updates) => {
    const updated = await api.updateCollection(slug, updates);
    set((state) => ({ festiveCollections: state.festiveCollections.map((c) => (c.slug === slug ? updated : c)) }));
    get().refreshActivity();
  },

  deleteFestiveCollection: async (slug) => {
    await api.deleteCollection(slug);
    set((state) => ({ festiveCollections: state.festiveCollections.filter((c) => c.slug !== slug) }));
    get().refreshActivity();
  },

  toggleProductInCollection: async (collectionSlug, productSlug) => {
    const updated = await api.toggleProductInCollection(collectionSlug, productSlug);
    set((state) => ({ festiveCollections: state.festiveCollections.map((c) => (c.slug === collectionSlug ? updated : c)) }));
  },

  // ---------------- Coupons ----------------
  addCoupon: async (coupon) => {
    const created = await api.createCoupon(coupon);
    set((state) => ({ coupons: [...state.coupons, created] }));
    get().refreshActivity();
  },

  toggleCoupon: async (id) => {
    const updated = await api.toggleCoupon(id);
    set((state) => ({ coupons: state.coupons.map((c) => (c.id === id ? updated : c)) }));
  },

  deleteCoupon: async (id) => {
    await api.deleteCoupon(id);
    set((state) => ({ coupons: state.coupons.filter((c) => c.id !== id) }));
  },

  // Looks up an active, non-expired coupon by code (case-insensitive) from local
  // cache first (instant UI feedback); checkout double-checks against the backend
  // via api.validateCoupon before actually applying it.
  findValidCoupon: (code) => {
    const c = get().coupons.find((c) => c.code.toLowerCase() === String(code).trim().toLowerCase());
    if (!c) return null;
    if (!c.active) return null;
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return null;
    return c;
  },

  incrementCouponUsage: async (id) => {
    await api.incrementCouponUsage(id);
    set((state) => ({ coupons: state.coupons.map((c) => (c.id === id ? { ...c, usedCount: (c.usedCount || 0) + 1 } : c)) }));
  },

  // ---------------- Reviews ----------------
  addReview: async (review) => {
    const created = await api.addReview(review);
    set((state) => ({ reviews: [created, ...state.reviews] }));
    get().refreshActivity();
  },

  approveReview: async (id) => {
    await api.approveReview(id);
    set((state) => ({ reviews: state.reviews.map((r) => (r.id === id ? { ...r, status: "approved" } : r)) }));
    get().refreshActivity();
  },

  rejectReview: async (id) => {
    await api.rejectReview(id);
    set((state) => ({ reviews: state.reviews.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)) }));
  },

  deleteReview: async (id) => {
    await api.deleteReview(id);
    set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) }));
  },

  // ---------------- Returns ----------------
  updateReturnStatus: async (id, status) => {
    const updated = await api.updateReturnStatus(id, status);
    set((state) => ({ returns: state.returns.map((r) => (r.id === id ? updated : r)) }));
    get().refreshActivity();
  },

  // ---------------- Staff ----------------
  addStaff: async (staff) => {
    const created = await api.addStaff(staff);
    set((state) => ({ staff: [...state.staff, created] }));
    get().refreshActivity();
  },

  toggleStaff: async (id) => {
    const updated = await api.toggleStaff(id);
    set((state) => ({ staff: state.staff.map((s) => (s.id === id ? updated : s)) }));
  },

  deleteStaff: async (id) => {
    await api.deleteStaff(id);
    set((state) => ({ staff: state.staff.filter((s) => s.id !== id) }));
  },

  // ---------------- Settings ----------------
  updateSettings: async (updates) => {
    const updated = await api.updateSettings(updates);
    set({ settings: updated });
    get().refreshActivity();
  },
}));
