import Link from "next/link";
import Image from "next/image";
import { LOGO_URL } from "@/data/mediaManifest";

// Branded 404 — replaces Next.js's plain default error page so a broken/old
// link still feels like part of the site, and nudges the visitor back into
// the shop instead of just bouncing.
export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-md">
        <Image
          src={LOGO_URL}
          alt="Niryana Jewels"
          width={160}
          height={80}
          className="h-12 w-auto object-contain mx-auto mb-8 opacity-80"
        />
        <p className="font-serif text-7xl text-gold mb-2">404</p>
        <h1 className="font-serif text-2xl md:text-3xl text-forest mb-3">
          This page has wandered off
        </h1>
        <p className="text-charcoal/60 mb-8">
          The page you're looking for doesn't exist or may have been moved. Let's get you back to
          something beautiful.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="bg-forest text-cream px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors duration-300"
          >
            Shop Collection
          </Link>
          <Link
            href="/"
            className="border border-forest/30 text-forest px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:border-gold hover:text-gold transition-colors duration-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
