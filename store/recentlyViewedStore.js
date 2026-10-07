"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_ITEMS = 8;

// Tracks the last few products a shopper viewed (localStorage), most recent first.
export const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      ids: [],

      addView: (productId) =>
        set((state) => ({
          ids: [productId, ...state.ids.filter((id) => id !== productId)].slice(0, MAX_ITEMS),
        })),
    }),
    { name: "niryana-recently-viewed" }
  )
);
