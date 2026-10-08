"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LOGO_URL } from "@/data/mediaManifest";
import { useAdminAuthStore } from "@/store/adminAuthStore";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/analytics", label: "Analytics", icon: "chart" },
  { href: "/admin/products", label: "Products", icon: "box" },
  { href: "/admin/categories", label: "Categories", icon: "tag" },
  { href: "/admin/collections", label: "Festive Collections", icon: "sparkle" },
  { href: "/admin/inventory", label: "Inventory", icon: "layers" },
  { href: "/admin/media", label: "Media Library", icon: "image" },
  { href: "/admin/orders", label: "Orders", icon: "bag" },
  { href: "/admin/returns", label: "Returns", icon: "undo" },
  { href: "/admin/customers", label: "Customers", icon: "users" },
  { href: "/admin/reviews", label: "Reviews", icon: "star" },
  { href: "/admin/coupons", label: "Coupons", icon: "ticket" },
  { href: "/admin/staff", label: "Staff", icon: "shield" },
  { href: "/admin/activity", label: "Activity Log", icon: "clock" },
  { href: "/admin/settings", label: "Settings", icon: "gear" },
];

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6 };
  switch (name) {
    case "grid":
      return <svg {...common}><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>;
    case "chart":
      return <svg {...common}><path d="M4 19V9"/><path d="M11 19V5"/><path d="M18 19v-7"/><path d="M3 19h18"/></svg>;
    case "box":
      return <svg {...common}><path d="M21 8L12 3 3 8l9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>;
    case "tag":
      return <svg {...common}><path d="M20.6 12.6L12.6 20.6a2 2 0 01-2.8 0l-7.4-7.4a2 2 0 010-2.8L10.4 2.4A2 2 0 0111.8 2H19a2 2 0 012 2v7.2a2 2 0 01-.4 1.4z"/><circle cx="14.5" cy="7.5" r="1.2"/></svg>;
    case "layers":
      return <svg {...common}><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>;
    case "bag":
      return <svg {...common}><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 016 0"/></svg>;
    case "users":
      return <svg {...common}><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M15 20c.2-2.5 1.8-4.3 4-4.9"/></svg>;
    case "ticket":
      return <svg {...common}><path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V8z"/></svg>;
    case "gear":
      return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.2a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.2a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.2a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.6 1H21a2 2 0 110 4h-.2a1.7 1.7 0 00-1.6 1z"/></svg>;
    case "image":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.8"/><path d="M21 15l-5-5-9 9"/></svg>;
    case "undo":
      return <svg {...common}><path d="M3 10h10a5 5 0 010 10H9" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 6L3 10l4 4"/></svg>;
    case "star":
      return <svg {...common}><path d="M12 2.5l2.9 6 6.6.6-5 4.4 1.5 6.5L12 16.9 6 19.9l1.5-6.5-5-4.4 6.6-.6L12 2.5z"/></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"/></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>;
    case "sparkle":
      return <svg {...common}><path d="M12 2l1.8 5.6L19 9.5l-5.2 1.9L12 17l-1.8-5.6L5 9.5l5.2-1.9L12 2z"/><path d="M19 15l.8 2.4L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.6L19 15z"/></svg>;
    default:
      return null;
  }
}

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAdminAuthStore((s) => s.logout);

  return (
    <aside
      className={`no-scrollbar w-64 bg-forest text-cream flex flex-col h-full md:min-h-screen fixed left-0 top-0 overflow-y-auto print:hidden z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-6 border-b border-cream/10 flex items-start justify-between">
        <div>
          <div className="bg-cream rounded-lg inline-block px-3 py-2">
            <Image src={LOGO_URL} alt="Niryana Jewels" width={120} height={60} className="h-8 w-auto object-contain" />
          </div>
          <p className="text-gold text-xs uppercase tracking-widest mt-3">Admin Panel</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="md:hidden text-cream/70 hover:text-gold p-1"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-gold text-forest font-medium" : "text-cream/80 hover:bg-cream/10"
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-cream/10 space-y-2">
        <Link href="/" className="block text-xs text-cream/60 hover:text-gold px-4">
          ← Back to Storefront
        </Link>
        <button
          onClick={() => {
            logout();
            router.push("/admin/login");
          }}
          className="w-full text-left text-xs text-cream/60 hover:text-gold px-4 py-2"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
