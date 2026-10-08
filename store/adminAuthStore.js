"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Real 2-step admin auth: email + password (checked server-side against ADMIN_EMAIL /
// ADMIN_PASSWORD env vars — never shipped to the browser) followed by a one-time code
// emailed to the admin's inbox via Gmail SMTP (see app/api/admin/auth/*). Once the OTP
// is verified, `markLoggedIn()` flips this flag, which the admin layout checks before
// rendering the dashboard. Session state itself is still a persisted client flag (not
// a server session/cookie) — sufficient for this single-admin setup, but a good next
// step if multiple staff accounts with real permissions are needed later.
export const useAdminAuthStore = create(
  persist(
    (set) => ({
      isAuthed: false,
      markLoggedIn: () => set({ isAuthed: true }),
      logout: () => set({ isAuthed: false }),
    }),
    { name: "niryana-admin-auth" }
  )
);
