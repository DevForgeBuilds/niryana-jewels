"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LOGO_URL, LOGO_URL_LIGHT } from "@/data/mediaManifest";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartDrawerStore } from "@/store/cartDrawerStore";
import SearchOverlay from "./SearchOverlay";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/shop?category=devotional", label: "Devotional" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const openCartDrawer = useCartDrawerStore((s) => s.open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  // The transparent, light-text navbar treatment only makes sense floating over
  // the homepage's dark hero image/video. Every other page starts with a plain
  // light (cream) background right at the top, so the navbar must always use
  // the dark/solid treatment there — otherwise light text disappears against
  // the light page background.
  const isHomepage = pathname === "/";
  const light = isHomepage && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-apple print:hidden ${
        light ? "bg-transparent py-4" : "bg-cream/90 backdrop-blur-md shadow-sm py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={light ? LOGO_URL_LIGHT : LOGO_URL}
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
                light ? "text-cream" : "text-forest"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className={`hover:text-gold transition-colors ${light ? "text-cream" : "text-forest"}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
          </button>
          <Link
            href="/account"
            className={`hidden sm:inline text-sm tracking-wide hover:text-gold transition-colors ${
              light ? "text-cream" : "text-forest"
            }`}
          >
            Account
          </Link>
          <Link
            href="/wishlist"
            className={`relative hidden sm:inline-flex hover:text-gold transition-colors ${light ? "text-cream" : "text-forest"}`}
            aria-label="Wishlist"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 20.5s-7.5-4.6-10-9.2C0.3 8 1.8 4.5 5 3.4c2.1-.7 4.3.1 5.5 1.9l1.5 2.1 1.5-2.1c1.2-1.8 3.4-2.6 5.5-1.9 3.2 1.1 4.7 4.6 3 7.9-2.5 4.6-10 9.2-10 9.2z" />
            </svg>
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-2 -right-2 bg-gold text-forest text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={openCartDrawer}
            className={`relative hover:text-gold transition-colors ${light ? "text-cream" : "text-forest"}`}
            aria-label="Cart"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6h15l-1.5 9h-12L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-2 -right-2 bg-gold text-forest text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            className={light ? "md:hidden text-cream" : "md:hidden text-forest"}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`md:hidden overflow-hidden border-t ${
              light
                ? "bg-forest/95 backdrop-blur-md border-cream/10"
                : "bg-cream border-gold/30"
            }`}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <button
                onClick={() => {
                  setOpen(false);
                  setSearchOpen(true);
                }}
                className={`flex items-center gap-2 text-sm tracking-widest uppercase ${light ? "text-cream" : "text-forest"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                Search
              </button>
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm tracking-widest uppercase ${light ? "text-cream" : "text-forest"}`}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/wishlist"
                className={`text-sm tracking-widest uppercase ${light ? "text-cream" : "text-forest"}`}
                onClick={() => setOpen(false)}
              >
                Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
              </Link>
              <Link
                href="/account"
                className={`text-sm tracking-widest uppercase ${light ? "text-cream" : "text-forest"}`}
                onClick={() => setOpen(false)}
              >
                Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

    </header>
  );
}
