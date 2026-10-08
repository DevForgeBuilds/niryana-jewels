"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LOGO_URL_LIGHT } from "@/data/mediaManifest";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-forest text-cream pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        <div>
          <Image
            src={LOGO_URL_LIGHT}
            alt="Niryana Jewels"
            width={140}
            height={70}
            className="h-14 w-auto object-contain mb-4 -ml-1"
          />
          <p className="text-cream/60 text-sm leading-relaxed">
            Fine Jewellery with Heart &amp; Heritage.
          </p>
          <a
            href="https://instagram.com/niryana_jewels"
            target="_blank"
            rel="noreferrer"
            aria-label="Niryana Jewels on Instagram"
            className="inline-flex items-center justify-center w-9 h-9 mt-4 rounded-full border border-cream/25 text-cream hover:text-gold hover:border-gold transition-colors duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>


        <div>
          <h4 className="text-gold uppercase tracking-widest text-xs mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/shop?category=rings" className="hover:text-gold">Rings</Link></li>
            <li><Link href="/shop?category=earrings" className="hover:text-gold">Earrings</Link></li>
            <li><Link href="/shop?category=pendants" className="hover:text-gold">Pendants</Link></li>
            <li><Link href="/shop?category=necklaces" className="hover:text-gold">Necklaces</Link></li>
            <li><Link href="/shop?category=bracelets" className="hover:text-gold">Bracelets</Link></li>
            <li><Link href="/shop?category=devotional" className="hover:text-gold">Devotional</Link></li>
            <li><Link href="/gift-cards" className="hover:text-gold">Gift Cards</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gold uppercase tracking-widest text-xs mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link href="/faq" className="hover:text-gold">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link href="/account" className="hover:text-gold">My Account</Link></li>
            <li><Link href="/cart" className="hover:text-gold">Cart</Link></li>
          </ul>
          <h4 className="text-gold uppercase tracking-widest text-xs mb-4 mt-6">Legal</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-gold">Terms &amp; Conditions</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-gold">Shipping Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gold uppercase tracking-widest text-xs mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-cream/70 leading-relaxed">
            <li>Shop No. 324, 3rd Floor, Prime Arcade,<br />Beside Raghuvir Shoppers, Lajamni Chowk,<br />Mota Varachha, Surat – 394101, Gujarat</li>
            <li>
              <a href="tel:+919925179067" className="hover:text-gold">+91 99251 79067</a>
            </li>
            <li>
              <a href="mailto:niryanajewels@gmail.com" className="hover:text-gold">niryanajewels@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-cream/10 flex flex-col md:flex-row justify-between gap-2 text-cream/50 text-xs">
        <p>© {new Date().getFullYear()} Niryana Jewels. All rights reserved.</p>
        <p>GSTIN: 24GHKPB8783C1Z8 · Udyam Reg No: UDYAM-GJ-22-0520078</p>
      </div>
    </footer>
  );
}
