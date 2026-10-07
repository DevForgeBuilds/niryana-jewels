"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Persistent wishlist/favorites (localStorage). For logged-in users this same
// store can be synced to MySQL via a `wishlist` table + /api/wishlist routes.
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, slug, name, price, image }

      isFavorite: (productId) => get().items.some((i) => i.productId === productId),

      toggleItem: (product) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === product.id);
          if (exists) {
            return { items: state.items.filter((i) => i.productId !== product.id) };
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
                metal: product.metal,
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      // Re-insert a previously removed favorite verbatim (used by the
      // toast "Undo" action).
      restoreItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.productId === item.productId)) return state;
          return { items: [...state.items, item] };
        }),

      clearWishlist: () => set({ items: [] }),
    }),
    { name: "niryana-wishlist" }
  )
);
