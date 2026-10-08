"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useAdminStore } from "@/store/adminStore";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthed = useAdminAuthStore((s) => s.isAuthed);
  const loading = useAdminStore((s) => s.loading);
  const loadError = useAdminStore((s) => s.loadError);
  const initialized = useAdminStore((s) => s.initialized);
  const init = useAdminStore((s) => s.init);
  const [hydrated, setHydrated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    const isPublicRoute = pathname === "/admin/login" || pathname === "/admin/reset-password";
    if (!isAuthed && !isPublicRoute) {
      router.replace("/admin/login");
    }
  }, [hydrated, isAuthed, pathname, router]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
    return <div className="min-h-screen bg-cream-soft">{children}</div>;
  }


  if (!hydrated || !isAuthed) {
    return <div className="min-h-screen bg-cream-soft flex items-center justify-center text-forest">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-cream-soft flex">
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <main className="flex-1 md:ml-64 p-4 sm:p-8 print:ml-0 print:p-0 min-w-0 overflow-x-hidden">
        <div className="print:hidden">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        </div>

        {loading && !initialized && (
          <div className="mb-6 rounded-xl bg-cream-soft border border-forest/10 px-4 py-3 text-sm text-charcoal/60 print:hidden">
            Loading dashboard data…
          </div>
        )}

        {loadError && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-4 print:hidden">
            <span>
              Couldn&apos;t load data from the server. This can happen if the backend is just waking up
              (free-tier servers sleep after inactivity and take up to a minute to restart). {loadError}
            </span>
            <button
              onClick={() => init()}
              className="shrink-0 bg-red-600 text-white px-4 py-1.5 rounded-full text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
