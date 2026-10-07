"use client";

import { create } from "zustand";

// UI-only store (no persistence needed) controlling the slide-in mini-cart drawer.
export const useCartDrawerStore = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
