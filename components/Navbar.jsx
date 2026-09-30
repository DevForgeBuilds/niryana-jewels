"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LOGO_URL, LOGO_URL_LIGHT } from "@/data/mediaManifest";
import { useCartStore } from "@/store/cartStore";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=devotional", label: "Devotional" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-apple ${
        scrolled
          ? "bg-cream/90 backdrop-blur-md shadow-sm py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={scrolled ? LOGO_URL : LOGO_URL_LIGHT}
            alt="Niryana Jewels"
            width={140}
            height={70}
            priority
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm tracking-widest uppercase hover:text-gold transition-colors duration-300 ${
                scrolled ? "text-forest" : "text-cream"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/account"
            className={`hidden sm:inline text-sm tracking-wide hover:text-gold transition-colors ${
              scrolled ? "text-forest" : "text-cream"
            }`}
          >
            Account
          </Link>
          <Link
            href="/cart"
            className={`relative hover:text-gold transition-colors ${scrolled ? "text-forest" : "text-cream"}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6h15l-1.5 9h-12L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-forest text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            className={scrolled ? "md:hidden text-forest" : "md:hidden text-cream"}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-cream border-t border-gold/30 px-6 py-4 flex flex-col gap-4">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm tracking-widest uppercase text-forest" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/account" className="text-sm tracking-widest uppercase text-forest" onClick={() => setOpen(false)}>
            Account
          </Link>
        </div>
      )}
    </header>
  );
}
