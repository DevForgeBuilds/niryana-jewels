"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// DEMO-ONLY auth. Replace with NextAuth + JWT + real admin role check from the
// `users.role = 'admin'` column in MySQL before going live.
export const DEMO_ADMIN_PASSWORD = "niryana2026";

export const useAdminAuthStore = create(
  persist(
    (set) => ({
      isAuthed: false,
      login: (password) => {
        const ok = password === DEMO_ADMIN_PASSWORD;
        if (ok) set({ isAuthed: true });
        return ok;
      },
      logout: () => set({ isAuthed: false }),
    }),
    { name: "niryana-admin-auth" }
  )
);
