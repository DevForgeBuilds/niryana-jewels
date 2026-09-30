"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Persistent cart (localStorage). For logged-in users this same store can be
// synced to MySQL `cart` table via /api/cart routes (see README).
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, slug, name, price, image, quantity, size }

      addItem: (product, quantity = 1, size = null) =>
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
