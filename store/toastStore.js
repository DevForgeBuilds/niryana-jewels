"use client";

import { create } from "zustand";

let nextId = 1;
const MAX_VISIBLE = 4;

// UI-only store (no persistence) powering the global toast notification stack.
export const useToastStore = create((set) => ({
  toasts: [],

  addToast: (message, type = "success", options = {}) =>
    set((state) => {
      const { duration = 3800, action = null } = options;

      // Dedupe: if the exact same message/type is already showing, just
      // bump it back to a fresh duration instead of stacking a near-duplicate
      // on top of itself (e.g. rapidly tapping "Add" on the same product).
      const dupeIndex = state.toasts.findIndex((t) => t.message === message && t.type === type);
      if (dupeIndex !== -1) {
        const bumped = { ...state.toasts[dupeIndex], id: nextId++, duration, action };
        const rest = state.toasts.filter((_, i) => i !== dupeIndex);
        return { toasts: [...rest, bumped].slice(-MAX_VISIBLE) };
      }

      const id = nextId++;
      const next = [...state.toasts, { id, message, type, duration, action }];
      // Keep the stack tidy — drop the oldest once we exceed the visible cap.
      return { toasts: next.slice(-MAX_VISIBLE) };
    }),

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helper usable outside React components too.
// toast(message, type, { duration, action: { label, onClick } })
export function toast(message, type = "success", options = {}) {
  useToastStore.getState().addToast(message, type, options);
}
