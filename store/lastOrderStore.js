"use client";

import { create } from "zustand";

// Non-persisted, in-memory store holding the most recently placed order so the
// /order-confirmation page can render a real receipt right after checkout
// (no backend yet — see README for where real order persistence plugs in).
export const useLastOrderStore = create((set) => ({
  order: null,
  setOrder: (order) => set({ order }),
  clearOrder: () => set({ order: null }),
}));
