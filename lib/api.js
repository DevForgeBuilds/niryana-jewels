// =====================================================================================
// Thin fetch client for the Express + MySQL backend (deployed on Render). All Admin
// Dashboard data (products, orders, customers, coupons, reviews, returns, staff,
// settings, festive collections, activity log) and the storefront catalog now live in
// MySQL and go through these functions instead of localStorage.
// =====================================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Products
  getProducts: () => request("/api/products"),
  getProduct: (slug) => request(`/api/products/${slug}`),
  createProduct: (data) => request("/api/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  adjustStock: (id, delta) => request(`/api/products/${id}/stock`, { method: "PATCH", body: JSON.stringify({ delta }) }),
  adjustVariantStock: (id, variantId, delta) =>
    request(`/api/products/${id}/variants/${variantId}/stock`, { method: "PATCH", body: JSON.stringify({ delta }) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: () => request("/api/categories"),
  createCategory: (name) => request("/api/categories", { method: "POST", body: JSON.stringify({ name }) }),
  renameCategory: (slug, name) => request(`/api/categories/${slug}`, { method: "PUT", body: JSON.stringify({ name }) }),
  deleteCategory: (slug) => request(`/api/categories/${slug}`, { method: "DELETE" }),

  // Festive collections
  getCollections: () => request("/api/collections"),
  createCollection: (data) => request("/api/collections", { method: "POST", body: JSON.stringify(data) }),
  updateCollection: (slug, data) => request(`/api/collections/${slug}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCollection: (slug) => request(`/api/collections/${slug}`, { method: "DELETE" }),
  toggleProductInCollection: (slug, productSlug) =>
    request(`/api/collections/${slug}/toggle-product`, { method: "POST", body: JSON.stringify({ productSlug }) }),

  // Orders
  getOrders: () => request("/api/orders"),
  getOrder: (id) => request(`/api/orders/${id}`),
  createOrder: (data) => request("/api/orders", { method: "POST", body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) => request(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // Customers
  getCustomers: () => request("/api/customers"),
  getCustomer: (id) => request(`/api/customers/${id}`),

  // Coupons
  getCoupons: () => request("/api/coupons"),
  createCoupon: (data) => request("/api/coupons", { method: "POST", body: JSON.stringify(data) }),
  toggleCoupon: (id) => request(`/api/coupons/${id}/toggle`, { method: "PATCH" }),
  incrementCouponUsage: (id) => request(`/api/coupons/${id}/increment-usage`, { method: "POST" }),
  validateCoupon: (code) => request(`/api/coupons/validate/${encodeURIComponent(code)}`),
  deleteCoupon: (id) => request(`/api/coupons/${id}`, { method: "DELETE" }),

  // Reviews
  getReviews: () => request("/api/reviews"),
  addReview: (data) => request("/api/reviews", { method: "POST", body: JSON.stringify(data) }),
  approveReview: (id) => request(`/api/reviews/${id}/approve`, { method: "PATCH" }),
  rejectReview: (id) => request(`/api/reviews/${id}/reject`, { method: "PATCH" }),
  deleteReview: (id) => request(`/api/reviews/${id}`, { method: "DELETE" }),

  // Returns
  getReturns: () => request("/api/returns"),
  updateReturnStatus: (id, status) => request(`/api/returns/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // Staff
  getStaff: () => request("/api/staff"),
  addStaff: (data) => request("/api/staff", { method: "POST", body: JSON.stringify(data) }),
  toggleStaff: (id) => request(`/api/staff/${id}/toggle`, { method: "PATCH" }),
  deleteStaff: (id) => request(`/api/staff/${id}`, { method: "DELETE" }),

  // Settings
  getSettings: () => request("/api/settings"),
  updateSettings: (data) => request("/api/settings", { method: "PUT", body: JSON.stringify(data) }),

  // Activity log
  getActivity: () => request("/api/activity"),
  pushLog: (action, detail) => request("/api/activity", { method: "POST", body: JSON.stringify({ action, detail }) }),

  // Abandoned cart recovery — saves a snapshot once checkout has a valid email so a
  // reminder email can go out later if the order is never completed; the snapshot is
  // marked "converted" once the order actually goes through.
  saveAbandonedCheckout: (data) =>
    request("/api/abandoned-checkout", { method: "POST", body: JSON.stringify(data) }),
  markCheckoutConverted: (email) =>
    request(`/api/abandoned-checkout/${encodeURIComponent(email)}`, { method: "DELETE" }),

  // Back-in-stock notifications (optional variantLabel for size/length-specific products)
  notifyStock: (productId, email, variantLabel) =>
    request("/api/notify-stock", { method: "POST", body: JSON.stringify({ productId, email, variantLabel }) }),

  // Newsletter
  subscribeNewsletter: (email) => request("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) }),
  getNewsletterSubscribers: () => request("/api/newsletter"),

  // Customer-facing order lookup (My Orders + guest order tracking)
  getOrdersByContact: (contact) => request(`/api/orders/by-contact?contact=${encodeURIComponent(contact)}`),
  trackOrder: (orderNumber, contact) =>
    request(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&contact=${encodeURIComponent(contact)}`),
};
