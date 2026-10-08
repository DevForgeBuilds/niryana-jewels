"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Persistent cart (localStorage). For logged-in users this same store can be
// synced to MySQL `cart` table via /api/cart routes (see README).
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, slug, name, price, image, quantity, size }

      // `meta` carries any extra per-line-item fields that don't apply to normal
      // products — currently used for digital Gift Card lines (type, recipient
      // name/email, personal message) so checkout can issue the right codes.
      addItem: (product, quantity = 1, size = null, meta = {}) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product.id && i.size === size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id && i.size === size
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0],
                quantity,
                size,
                ...meta,
              },
            ],
          };
        }),

      removeItem: (productId, size = null) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        })),

      // Re-insert a previously removed line item verbatim (used by the
      // toast "Undo" action) — merges into an existing matching line if one
      // was added again in the meantime, otherwise restores it as-is.
      restoreItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId && i.size === size
                ? { ...i, quantity: Math.max(1, quantity) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "niryana-cart" }
  )
);
