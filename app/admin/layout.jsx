"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthed = useAdminAuthStore((s) => s.isAuthed);
  const [hydrated, setHydrated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [hydrated, isAuthed, pathname, router]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") {
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
        {children}
      </main>
    </div>
  );
}
